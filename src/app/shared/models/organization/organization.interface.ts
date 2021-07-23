import { default as Document } from '../document.interface';

export interface IOrganization {
  name: string;
  logo?: string;
  website?: string;
  users?: [{
    userId: string,
    roles: string[],
  }];
}

export interface IOrganizationDocument extends IOrganization, Document {
}

export default IOrganizationDocument;
