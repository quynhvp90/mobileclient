import { default as Document } from './document.interface';
import { IUserPublicDetail } from './user/user.interface';

export interface IChatroom {
  chatRoomType: string;    // ['personal']
  name: string;
  users: [{
    userId: string;
    publicName: string;
    avatar: string;
  }];
}

export interface IChatroomDocument extends IChatroom, Document {
  lookups: {
    users?: IUserPublicDetail[],
  };
}

export default IChatroomDocument;
