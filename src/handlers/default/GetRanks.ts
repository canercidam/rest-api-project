import { Response, Request } from 'express';
import { Repository } from '../Repository';
import { Status, internalErr } from '../status';

interface QueryParams {
  date?: string;
  sort?: string;
}

export async function GetRanks(req: Request, res: Response) {
  const params = req.query as QueryParams;
  const result = await Repository.get().getRanks(params.date, params.sort);
  if (result.error) {
    console.log(`failed to get ranks: ${result.error.message}`);
    return res.status(Status.InternalError).json(internalErr());
  }
  return res.status(Status.OK).json(result.data);
}
