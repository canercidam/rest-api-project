import { DB } from '../models/DB';

export interface IError<M> {
  message: string;
  meta?: M;
}

export interface Result<D, E = string> {
  data?: D;
  error?: IError<E>;
}

export function errResult<M = any>(message: string, meta?: M): Result<any, M> {
  return { error: { message, meta } };
}

export interface IRepository {
  getRanks(date?: string, sort?: string): Promise<Result<DB.TrackerRank[]>>;
  getTrackerEvents(
    trackerUid: string, limit?: number, offset?: number, date?: string, sort?: string
  ): Promise<Result<DB.Event[]>>;
}

export class Repository {
  private static implementation: IRepository;

  static set(implementation: IRepository) {
    Repository.implementation = implementation;
  }

  static get() {
    return Repository.implementation;
  }
}
