import { default as Document } from '../document.interface';

export interface IApplicationAnswer {
  questionId?: string; // fk
  attachments?: {
    assetId: string;
    filename: string;
    mimeType: string;
  }[];
  version?: number;
  dateSubmitted?: Date;
  response?: string;
  videoId?: string;
}

export interface IApplicationReview {
  reviewers: [{
    userId: string; // userId of reviewer
    start: Date; // date time when reviewer first opens the Homework to review
    end: Date; // date time when reviewer has scored last question
    scores: [{
      questionId: string;
      score: number, // save LATEST score.  The MessageModel saves ALL scores
    }];
  }];
}

export interface IApplicationLookups {
  job?: any;
  applicant?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    display?: string;
    avatar?: string;
    applicantProfile?: any;
    primaryEmail?: string;
    primaryPhone?: string;
    accountClaimed?: boolean;
  };
  users?: any;
  rejectReason?: string;
  ratings?: {
    homework?: {
      userStatusComplete?: any,
    },
    interview?: {
      userStatusComplete?: any,
    },
    applicant?: {
      userStatusComplete?: any,
    },
  };
  location?: string;
  archivedUsers?: any;
  attachmentToken?: any;
  needsAccommodation?: boolean;
  friendlyStatus?: string; // converts to 'status' to human readable
  friendlyStatusChangeDate?: Date;
  isAts?: boolean;
  organizationSettings?: {
    rejectHourDelay?: {
      'stage1-failed'?: number;
      'stage2-failed'?: number;
      'stage3-failed'?: number;
    };
  };
}

export interface IApplication {
  seqNumber: number; // generated from job schema
  base32?: string;
  jobId: string; // fk
  applicantId: string; // fk
  organizationId: string; // fk
  applicantName?: string;
  labels?: string[];
  audit?: {
    auditDate: Date,
    userId: string, // fk of user that did the change
    text: string, // text describing the change
    // - {Date-Time} Hung reviewed the homework
    // - {Date-Time} Hung rated the homework answer 1 3.5
    // - {Date-Time} Nick added the label ABC
  }[];
  stats: {
    messageCount?: number,
    noteCount?: number,
    loginDate?: Date,
    demographicsDate?: Date,
  };
  actionRequired?: {
    [userId: string]: string; // Review, Unlock, Rate, Done
  };
  results: {
    ratings: {
      homework: {
        totalRatings: number,
        totalRated: number,
        average: number,
        percentComplete: number,
        questions: [{
          questionId: string,
          userId: string,
          archived: boolean,
          rating: number,
          weight?: number,
        }],
      },
      interview: {
        totalRatings: number,
        totalRated: number,
        average: number,
        percentComplete: number,
        questions: [{
          questionId: string,
          userId: string,
          archived: boolean,
          rating: number,
          weight?: number,
        }],
      },
      applicant: {
        totalRatings: number,
        totalRated: number,
        average: number,
        ratings: [{
          userId: string,
          archived: boolean,
          rating: number,
        }],
      },
    }
    currentSection?: string;
    homework: IApplicationAnswer[],
    interview: IApplicationAnswer[],
    quiz?: IApplicationAnswer[],
    questionnaire: {
      referral?: {
        state: string;
        value?: string;
        enteredReferral?: string;
        enteredEmployee?: string;
      },
      location?: {
        state: string;
        value?: any; // string;
      },
      travel?: {
        state: string;
        value?: string;
      },
      skills?: {
        state: string;
        value?: Object;
      },
      compensation?: {
        state: string;
        value?: number,
      },
      requirements?: {
        state: string;
        value?: Object;
      },
      languages?: {
        state: string;
        value?: Object;
      },
      certifications?: {
        state: string;
        value?: Object;
      },
      acknowledgement?: {
        state: string;
        value?: Object;
        signedName: string;
        signedDate: Date;
      },
      accommodation?: {
        state: string;
        value?: Object;
      },
      quiz?: {
        state?: string;
        answers?: any;
      },
    },
  };
  review: {
    homework: IApplicationReview;
    interview: IApplicationReview;
  };
  source: string;
  applyStats?: {
    url?: string,
    location?: string, // address line for now...
    postingDate?: Date,
    title?: string,
    urlId?: string,
  };
  referral: string;
  lastStatus: string;
  status: string; // viewed, stage0 (Filling in Questionnaire), stage1 (Assessments), stage2 (Homework in Progress), stage2R (Being reviewed by employer), Stage3 (Interview needed), Stage3R (Being reviewed by employer), unqualified, cancelled
  statusChangeDate: Date; // posted, not-posted
  statusModifiedBy: string; // userId
  startedDate: Date;
  stageXsubmitted?: Date;
  emailReminderSentDate?: Date;

  statusHistory: {
    status: string;
    statusChangeDate: Date;
    modifiedBy: string;
    modifiedByName?: string; // is lookup
    isEmployer: boolean;
  }[];
  archived: boolean;
  rejects: {
    status: string; // ['stage0', 'stage1', 'stage2', 'stage3']
    requirement: string; // ['location', 'salary', 'travel', 'skills', 'certifications', 'questions', 'questionnaire']
    rejectLabel: string; // specific detail of rejected item
    rejectQuestions: string[], // specific detail of rejected items
    rejectDate: Date;
  }[]; // array - just in case future need

  /*
    going to delete
  */
  statusChangeData: {
    rejectReason: string;
    rejectDetail: string;
  };
  rejectReason: string;

  employerReject: {
    reason: string;
    detail: string;
  };

  created: Date;
  modified: Date;
  lookups?: IApplicationLookups; // TODO - create interface for lookups?: any
  title?: string;
  externals?: {
    icims?: {
      personId: string,
      systemId: string, // this may be the applicantId
      assessmentEndpoint: string,
      returnUrl: string,
    };
    jazzhr?: {
      orderId?: string,
      endpoint?: string,
    },
    greenhouse?: {
      orderId?: string,
      endpoint?: string,
      greenhouse_profile_url?: string, // used to parse applicantId // -> https://app.greenhouse.io/people/17681532?application_id=26234709
      applicationId?: string, // application Id if from webhook
      isWebhookApplication?: boolean,
    },
  };
  inviteUrl? : string;
  updateLock? : Date;
}

export interface IApplicationDocument extends IApplication, Document {
}

export default IApplicationDocument;
