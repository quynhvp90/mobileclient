import { default as Document } from '../document.interface';

interface IPerson {
  avatar?: string; // assetId or url
  kind?: string;
  firstName?: string; // required by application (after login)
  lastName?: string; // required by application (after login)
  title?: string;
  referredBy?: string[]; // userIds that referred person
  phones?: {
    _id?: string,
    number: string,
    verified: boolean,
  }[];
  emails?: {
    providerId: string;
    providerType: string;
    email: string;
    verified: boolean;
  }[]; // federated list of emails dynamically retrieved at runtime
  addresses?: {
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  }[];
  created: Date;
  modified: Date;
}

export interface IPersonDocument extends IPerson, Document {
}

export default IPersonDocument;
