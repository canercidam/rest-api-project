import { API } from '../models/API';

export interface IError<M> {
  message: string;
  meta?: M;
}

export interface Result<D, E = string> {
  data?: D;
  error?: IError<E>;
}

/**
 * Creates a result with an error.
 * @param message - message string for error
 * @param meta - extra metadata
 */
export function errResult<M = any>(message: string, meta?: M): Result<any, M> {
  return { error: { message, meta } };
}

/**
 * An indirection definition for data access.
 */
export interface IRepository {
  getRanks(date?: string, sort?: string): Promise<Result<API.TrackerRank[]>>;
  getTrackerEvents(
    trackerUid: string, limit?: number, offset?: number, date?: string, sort?: string
  ): Promise<Result<API.Event[]>>;
}

/**
 * A class to set IRepository implementation and make it
 * accessible.
 */
export class Repository {
  private static implementation: IRepository;

  static set(implementation: IRepository) {
    Repository.implementation = implementation;
  }

  static get() {
    return Repository.implementation;
  }
}

export function setRepository(implementation: IRepository) {
  Repository.set(implementation);
}
