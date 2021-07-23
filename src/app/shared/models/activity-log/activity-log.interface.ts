import { default as Document } from '../document.interface';
import { IMessageSocial } from '../message.interface';

export interface IActivityLog {
  organizationId: string;
  userId: string;
  activityId: string;
  activityLogLabel: string;
  dupeActivityLogId: string;
  count: number;
  averageHeartRate?: number;
  description?: string;
  duration: number; // for running (future concept, like milliseconds to track total running time)
  calories: number;
  social: IMessageSocial[];
  health: {
    syncDate?: Date;
    status?: String;
    res?: any;
  };
}

export interface IActivityLogDocument extends IActivityLog, Document {
  lookups?: {
    created?: string;
    activityName?: string;
    userDisplay?: string;
    userAvatar?: string;
    userStats?: {
      dailyStreaks?: number;
      totalDaysLogged?: number;
    }
    syncing?: boolean; // for health syncing
  };
}

export default IActivityLogDocument;
