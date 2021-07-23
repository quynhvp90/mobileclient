import { default as Document } from '../document.interface';
import { IChallengeDocument } from '../challenge/challenge.interface';

export interface IWorkout {
  organizationId?: string;
  userId?: string;
  name?: string;
  archived?: boolean;
  workoutType?: string; // personal, challenge
  frequency?: string;
  icon?: string;
}

export interface IWorkoutDocument extends IWorkout, Document {
}

export interface IWorkoutDocumentHydrated extends IWorkoutDocument {
  lookups?: {
    challenge: IChallengeDocument,
  };
}

export default IWorkoutDocument;
