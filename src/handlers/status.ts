import { API } from '../models/API';

export enum ErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum Status {
  OK = 200,
  BadRequest = 400,
  InternalError = 500,
}

export function internalErr(): API.ErrorResponse {
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: 'something went wrong',
  };
}
