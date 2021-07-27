import { default as IPerson } from '../person/person.interface';
import { default as Document } from '../document.interface';
import { IWorkout, IWorkoutDocument } from '../workout/workout.interface';

interface IUserStats {
  exportData?: number;
  activitiesCreated?: number;
  activitiesLogged?: number;
  challengesJoined?: number;
  challengesCreated?: number;
  friendsInvited?: number;
  friends?: number;
  logins?: number;
  rated?: number;
  socialShare?: number;
  workoutsCreated?: number;
  dailyStreaks?: number;
  totalDaysLogged?: number;
  lastUpdated?: Date;
}
export interface IUser extends IPerson {
  organizationId: string;
  display: string; // virtual
  primaryEmail: string; // virtual
  accountClaimed: boolean;
  isTempAccount?: boolean;
  stats?: IUserStats;
  activeWorkoutId?: string;
  license?: any;
  stripe?: any;
  avatar?: string;
  publicName?: string;
  publicId?: string;
  pushTokens: {
    token: string,
    date: Date,
  }[];
  notifications?: INotificationSettings;
  reminders: IUserReminders;
  timezone: string;
  timezoneOffset?: number;
  lastLogin: Date;
  lastActivity: Date;
  health?: {
    appleHealthKitEnabled: boolean,
    appleHealthKitErrorMessage?: string,
    googleFitEnabled: boolean,
    googleFitErrorMessage?: string,
    weight: number,
    weightUnit: string, // lbs, kg
    calorieOverrides: {
      label: string,
      total: number,
    }[],
  };
  showActivityInPublicFeed?: boolean;
}

export interface IUserReminders {
  lock: Date;
  lockId: string;
  enabled: boolean;
  startReminderTime: number;
  repeatReminder: string;
  nextReminder: Date;
  lastReminder: Date;
  lastDailyReminder: Date;
  days: string[];
}

export interface INotificationSettings {
  enable: boolean;
  enableReactions: boolean;
  lock: Date;
  lockId: string;
  startHour: number;
  endHour: number;
  previous: IUserNotification;
  next: IUserNotification;
}

export interface IUserNotification {
  priority: number;
  notificationType: string;
  date: Date;
  expiration: Date;
  message: {
    title: string,
    body: string,
    imageUrl?: string,
  };
  data: any;
  dbModel: string;
  dbModelId: string;
}

export interface IUserDocument extends IUser, Document {
  identityProviders?: IIdentityProvider[];
  externalProviders?: IExternalProvider[];
}

export interface IUserLastActivityDetail {
  date: Date;
  activityLogId: string;
  count: number;
  logLabel: string;
}
export interface IUserPublicDetail {
  userId: string;
  publicId: string;
  publicName: string;
  avatar: string;
  lastActivityDetail: IUserLastActivityDetail;
  stats: {
    dailyStreaks: number;
    totalDaysLogged: number;
  };
  lookups?: {
    contactId?: string;
    isFriend?: boolean;
    tagLine?: string;
    invitationEmail?: string;
  };
}

export interface IUserPublic extends IUser { // TODO
  defaultOrganizationId: string;
  emails?: {
    providerId: string;
    providerType: string;
    email: string;
    verified: boolean;
  }[]; // federated list of emails dynamically retrieved at runtime
  email?: string; // primary email address
  token: string;
  intercomSignature?: string;
  stats: IUserStats;
  lookups: {
    workouts?: IWorkoutDocument[],
    userAgent?: any,
  };
  userAgent?: any;
  subscribed? : boolean;
  isTempAccount?: any;
}

export interface IIdentityProvider extends IExternalProvider {
  resetToken?: string; // token to either (a) verify an email address, or (b) reset a users password
  usePassword?: boolean;
  password?: string;
}

export interface IExternalProvider extends Document {
  providerType: string; // email, facebook, google, linkedin, etc
  emails?: string[]; // support possible array for social
  emailVerified?: boolean;
  scopes?: {
    contacts: boolean,
  };
  encryptedToken?: string;
  encryptedRefreshToken?: string;
  profile?: any;
}

export interface INewUser { // initial interface for new inbound users
  socialId?: string;
  email?: string;
  password?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  referredBy?: string[];
  displayName?: string;
  provider?: string;
  encryptedToken?: string;
  encryptedRefreshToken?: string;
  raw?: object;
  license?: object;
}

export default IUserDocument;
