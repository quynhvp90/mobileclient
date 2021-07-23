import { default as Document } from '../document.interface';
import { IUserPublicDetail } from '../user/user.interface';

export interface IContact {
  organizationId?: string; // fromOrganizationId, i.e. owner Organization
  fromUserId?: string; // not available for legacy connections
  fromEmail?: string;
  email?: string; // toUserEmail
  toUserId?: string; // the toUserId
  invitationAccepted?: boolean;
  invitationDeny?: boolean;
  inviteMessage?: string;
}

export interface IContactDocument extends IContact, Document {
  lookups? : {
    fromUser: {
      _id?: string,
      display?: string,
      userId?: string,
      avatar?: string,
      organizationId?: string,
    },
    toUser: {
      _id?: string,
      display?: string,
      userId?: string,
      avatar?: string,
      organizationId?: string,
    },
    v2?: {
      fromUser: IUserPublicDetail,
      toUser: IUserPublicDetail,
    },
  };
}

export default IContactDocument;
