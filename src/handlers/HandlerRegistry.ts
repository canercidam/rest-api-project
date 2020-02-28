import { RequestHandler } from 'express';
import { GetRanks } from './default/GetRanks';
import { GetTrackerEvents } from './default/GetTrackerEvents';

export class HandlerRegistry {
  static readonly allHandlers: RequestHandler[] = [
    GetRanks,
    GetTrackerEvents,
  ];
}
