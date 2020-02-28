import { Response, Request } from 'express';
import { Repository } from './Repository';
import { Status, internalErr } from './status';

interface Params {
  date?: string;
  sort?: string;
  tracker_uid?: string;
  limit?: number;
  offset?: number;
}

export async function GetTrackerEvents(req: Request, res: Response) {
  const {
    limit, offset, date, sort,
  } = req.params as Params;
  const result = await Repository.get().getTrackerEvents(
    req.params.tracker_uid, limit, offset, date, sort,
  );
  if (result.error) {
    console.log(`failed to get tracker events: ${result.error.message}`);
    return res.status(Status.InternalError).json(internalErr());
  }
  return res.status(Status.OK).json(result.data);
}
