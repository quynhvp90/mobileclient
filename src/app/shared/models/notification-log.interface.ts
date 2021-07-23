import { default as Document } from './document.interface';
import { IUserPublicDetail } from './user/user.interface';

export interface INotificationLog {
  userId: string;
  fromUserId?: string;
  priority: number;
  notificationType: string;
  date: Date;
  expiration: Date;
  archived?: boolean;
  viewed?: boolean;
  sent: Date;
  message: {
    title: string,
    body?: string,
    imageUrl?: string,
  };
  data?: any;
  dbModel?: string;
  dbModelId?: string;
}

export interface INotificationLogDocument extends INotificationLog, Document {
  lookups?: {
    fromUser?: IUserPublicDetail;
    message?: {
      dbModel: string;
      dbModelId: string;
    };
    navLink?: string;
    class?: string;
  };
}

export default INotificationLogDocument;
