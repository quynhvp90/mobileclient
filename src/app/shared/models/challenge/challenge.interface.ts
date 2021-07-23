import { default as Document } from '../document.interface';
import { IActivityDocument } from '../activity/activity.interface';
import { IUserDocument } from '../user/user.interface';
import { IChallengeRowItem } from 'src/app/challenges/challenge-shared/challenge-row/challenge-row.component';
export interface IChallengeUser {
  userId?: string;
  organizationId?: string;
  role: string;
  invitationStatus?: string;
  archived?: boolean;
  workoutId?: string;
  percentComplete?: number;
  totalCount?: number;
}

export interface IChallengeTeams {
  enabled: boolean;
  allowTeamCreation: boolean;
  roster: IChallengeTeam[];
}
export interface IChallengeTeam {
  _id?: string;
  name: string;
  icon: string;
  ownerUserId: string;
  percentComplete: number;
  totalCount: number;
  users: {
    userId: string;
    role: string;
  }[];
  activities: IChallengeTeamActivity[];
  lookups?: {
    challengeRowItem?: IChallengeRowItem; // hydrated on client
    activities?: IChallengeActivitiesHydrated[]; // hydrated on client
    users?: IChallengeUserHydrated[], // hydrated on server
  };
}

export interface IChallengeTeamActivity {
  name: string;
  activityLogLabel: string;
  total: number;
  goal: number;
}

export interface IChallenge {
  publicId?: string;
  name?: string;
  accessCode?: string;
  description?: string;
  workoutId?: string; // fromOrganizationId, i.e. owner Organization
  startDate?: Date;
  endDate?: Date;
  resetDate?: Date;
  statStartDate?: Date;
  statEndDate?: Date;
  reset?: {
    enabled: Boolean,
    lock: Date,
    lockId: string,
  };
  teams?: IChallengeTeams;
  permission?: string;
  users?: IChallengeUser[];
  dynamicLink?: string;
  notifications?: {
    broadcastStatus: boolean;
    broadcastJoins: boolean;
  };
  advanced: {
    donateUrl?: string;
    displayOrder?: number, // for sorting
    showTotalsInsteadOfPercent?: boolean;
    bannerImage?: string;
    thumbnailImage?: string;
  };
}

export interface IChallengeDocument extends IChallenge, Document {
}

export interface IChallengeUserHydrated extends IChallengeUser {
  avatar: string;
  display: string;
  primaryEmail: string;
  activities: IActivityDocument[];
  totalCount: number;
  totalGoal: number;
  stats?: {
    dailyStreaks: number;
    totalDaysLogged: number;
  };
  contactStatus?: string;
}

export interface IChallengeActivitiesHydrated {
  _id?: string;
  name: string;
  label: string;
  logLabel: string;
  count: number;
  goal: number;
  weight: string;
  measurement: string;
  unit: string;
}

export interface IChallengeDocumentHydrated extends IChallengeDocument {
  lookups?: {
    users?: IChallengeUserHydrated[],
    usersTop?: IChallengeUserHydrated[],
    rosterTop?: IChallengeTeam[],
    totalUsers?: number;
    activities?: IChallengeActivitiesHydrated[],
    durationStr?: string;
    timeToStart?: number;
    timeToEnd?: number;
  };
}

export default IChallengeDocument;
