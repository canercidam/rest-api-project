import { Pool } from 'mysql';
import { promisify } from 'util';
import {
  IRepository, Result, errResult,
} from '../handlers/Repository';
import { makeLimit } from './helpers';
import { API } from '../models/API';
import { DB } from '../models/DB';

const HARD_LIMIT = 1000;
const DEFAULT_LIMIT = 100;
const RANKS_DEFAULT_SORT = 'ASC';
const EVENTS_DEFAULT_SORT = 'DESC';
const DEFAULT_DATE = 'NULL';

function queryErr(err: any): Result<any> {
  return errResult(`query failed: ${err}`);
}

export class Repository implements IRepository {
  constructor(private pool: Pool) {
    return this;
  }

  /**
   * Promisifies pool.query and expects a return type.
   * Expecting a return type here ensures that we get a DB model
   * and transform it to other model later (e.g. API model).
   * @param queryString - MySQL query string
   * @param options - query options object
   */
  private query<T>(queryString: string, options?: any): Promise<T> {
    const promise = promisify<string, any, T>(this.pool.query).bind(this.pool);
    return promise(queryString, options);
  }

  /**
   * Orders events by speed, takes the first ones (max) using "GROUP BY",
   * sorts in asc or desc order and assigns a rank for each max speed.
   * @param date - only on this date
   * @param sort - ASC or DESC
   */
  async getRanks(date?: string, sort?: string): Promise<Result<API.TrackerRank[]>> {
    try {
      const data = await this.query<DB.TrackerRank[]>(`
        SELECT 
          t2.tracker_uid,
          CASE
            WHEN @prev = t2.speed THEN @rank
            WHEN (@prev := t2.speed) IS NOT NULL THEN @rank := @rank + 1
          END AS max_speed_rank
        FROM (
          SELECT tracker_uid, speed
          FROM (
            SELECT tracker_uid, speed
            FROM application.data
            WHERE DATE(COALESCE(:date, insert_time)) = DATE(insert_time)
            ORDER BY speed DESC
          ) t1
          GROUP BY tracker_uid ORDER BY speed :sort
        ) t2, (SELECT @rank := 0, @prev := NULL) AS t3;
      `, { date: date || DEFAULT_DATE, sort: sort || RANKS_DEFAULT_SORT });

      // Same model - return without transforming.
      return Promise.resolve({ data });
    } catch (err) {
      return Promise.resolve(queryErr(err));
    }
  }

  /**
   * Gets all events
   * @param trackerUid - only for this tracker UID
   * @param limit - result limit
   * @param offset - result offset
   * @param date - only on this date
   * @param sort - ASC or DESC
   */
  async getTrackerEvents(
    trackerUid: string, limit?: number, offset?: number, date?: string, sort?: string,
  ): Promise<Result<API.Event[]>> {
    try {
      const data = await this.query<DB.Event[]>(`
        SELECT * FROM application.data
        WHERE tracker_uid = :tracker_uid
        AND DATE(COALESCE(:date, insert_time)) = DATE(insert_time)
        ORDER BY insert_time :sort
        LIMIT :limit OFFSET :offset;
      `, {
        date: date || DEFAULT_DATE,
        sort: sort || EVENTS_DEFAULT_SORT,
        limit: makeLimit(DEFAULT_LIMIT, HARD_LIMIT, limit),
        offset: offset || 0,
        tracker_uid: trackerUid,
      });

      // Same model - return without transforming.
      return Promise.resolve({ data });
    } catch (err) {
      return Promise.resolve(queryErr(err));
    }
  }
}
