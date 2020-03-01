import { Response, Request } from 'express';
import { Repository } from '../Repository';
import { Status, internalErr } from '../status';

interface QueryParams {
  date?: string;
  sort?: string;
  limit?: string;
  offset?: string;
}

export async function GetTrackerEvents(req: Request, res: Response) {
  const {
    limit, offset, date, sort,
  } = req.query as QueryParams;
  const trackerUid = req.params.tracker_uid;

  const result = await Repository.get().getTrackerEvents(
    trackerUid,
    limit ? parseInt(limit, 10) : undefined,
    offset ? parseInt(offset, 10) : undefined,
    date, sort,
  );
  if (result.error) {
    console.log(`failed to get tracker events: ${result.error.message}`);
    return res.status(Status.InternalError).json(internalErr());
  }

  return res.status(Status.OK).json(result.data);
}
