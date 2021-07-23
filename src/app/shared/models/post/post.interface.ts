import { default as Document } from '../document.interface';

export interface IPost {
  publicId: string;
  userId: string;
  title: string;
  postType: string; // 'workout', 'challenge'
  postData: any;
  created: Date;
  modified: Date;
}

export interface IPostDocument extends IPost, Document {
}

export default IPostDocument;
