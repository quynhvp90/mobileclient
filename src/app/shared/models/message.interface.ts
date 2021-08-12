import { default as Document } from './document.interface';
import { IUserPublicDetail } from './user/user.interface';

export interface IMessage {
  messageType?: string;    // ['challenge-broadcast']
  dbModel?: string;
  dbModelId?: string;
  applicationId?: string;
  questionId?: string;
  organizationId?: string;
  distributionList?: string[]; // userIds
  distributionType?: string[];
  dismissedDistributionList?: string[];
  fromUserId?: string;
  questionType?: string;
  message?: INotificationMessage;
  draft?: { // flag if draft (for application-notes)
    inEditMode?: boolean,
    body?: string,
  };
  archived?: boolean; // flag to delete
  tag?: string;
  social?: IMessageSocial[];
}

export interface IMessageSocial {
  _id?: string;
  emote: string;
  date: Date;
  userId: string;
  fromUserAvatar: string;
  fromUserDisplay: string;
  comment: string;
  lookups?: {
    ago?: string; // timeago
  };
}

export interface IMessageDocument extends IMessage, Document {
  lookups?: {
    created?: string; // convert fromNow
    fromUser?: IUserPublicDetail,
    fromTeam?: {
      name?: string;
      icon?: string;
    };
    toUsers?: {
      userId: string;
      displayName: string;
    }[];
    isSystemMessage?: boolean;
  };
}

interface INotificationMessage {
  template?: string;
  to?: {
    email: string;
    name?: string;
    distributionType?: string; // 'to'
    type?: string; // only used later to set the type in code
  }[];
  data: IDataMessage;
}

interface IDataMessage {
  summary?: string;
  subject?: string;
  title?: string; // The title (in the body)
  body?: string;
  notes?: string;
  footer?: string;
  alignTitle?: string; // ['center', 'left', 'right']
  alignBody?: string; // ['center', 'left', 'right']
  alignFooter?: string; // ['center', 'left', 'right']
  image?: string; // path to embed image
  data?: any; // misc data for other message types (like newsletter)
  button?: {
    label?: string;
    url: string;
    color?: string;
  };
  sendEmailAs?: {
    from_email: string;
    from_name: string;
  };
}
