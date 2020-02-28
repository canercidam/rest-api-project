import { Pool } from 'mysql';
import { promisify } from 'util';
import {
  IRepository, Result, errResult,
} from '../handlers/Repository';
import { makeLimit } from './helpers';
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
  private query: (queryString: string, options?: any) => Promise<any>;

  constructor(private pool: Pool) {
    this.query = promisify(this.pool.query).bind(this.pool);
    return this;
  }

  async getRanks(date?: string, sort?: string): Promise<Result<DB.TrackerRank[]>> {
    try {
      const data = await this.query(`
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

      return Promise.resolve({ data });
    } catch (err) {
      return Promise.resolve(queryErr(err));
    }
  }

  async getTrackerEvents(
    trackerUid: string, limit?: number, offset?: number, date?: string, sort?: string,
  ): Promise<Result<DB.Event[]>> {
    try {
      const data = await this.query(`
        SELECT * FROM application.data
        WHERE tracker_uid = :tracker_uid
        AND DATE(COALESCE(:date, insert_time)) = DATE(insert_time)
        ORDER BY insert_time :sort
        LIMIT :limit OFFSET :offset;
      `, {
        date: date || DEFAULT_DATE,
        sort: sort || EVENTS_DEFAULT_SORT,
        limit: makeLimit(DEFAULT_LIMIT, HARD_LIMIT, limit),
        offset,
        tracker_uid: trackerUid,
      });

      return Promise.resolve({ data });
    } catch (err) {
      return Promise.resolve(queryErr(err));
    }
  }
}
