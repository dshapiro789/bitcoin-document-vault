import 'express';
import { IUser } from '../models/User';

declare module 'express' {
  interface Response {
    download(path: string, filename?: string, callback?: (err?: Error) => void): void;
  }

  interface Request {
    user?: IUser;
  }
}

export interface RequestWithUser extends Request {
  user: IUser;
}