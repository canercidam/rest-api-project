import { Response } from 'express';
import { API } from '../models/API';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  REQUEST_FAILED = 'REQUEST_FAILED',
}

export enum Status {
  OK = 200,
  BadRequest = 400,
  NotFound = 404,
  InternalError = 500,
}

export function internalErr(): API.ErrorResponse {
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: 'something went wrong',
  };
}

export function notFoundErr(): API.ErrorResponse {
  return {
    code: ErrorCode.RESOURCE_NOT_FOUND,
  };
}

export function validationErr(message: string): API.ErrorResponse {
  return {
    code: ErrorCode.VALIDATION_ERROR,
    message: message.split('\n')[0].replace(/"/g, '\'').trim(),
  };
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export function errorHandler(err: any, req: any, res: Response, next: any) {
  const { status } = err;

  switch (status) {
    case undefined: case 500: {
      console.log(`unexpected internal error: ${err}`);
      res.status(Status.InternalError).json(internalErr());
      return;
    }

    case 400: {
      res.status(Status.BadRequest).json(validationErr(err.message));
      return;
    }

    case 404: {
      res.status(Status.NotFound).json({ code: ErrorCode.RESOURCE_NOT_FOUND });
      return;
    }

    default: {
      console.log(`unhandled error: ${err}`);
      res.status(err.status).json({ code: ErrorCode.REQUEST_FAILED });
    }
  }
}
