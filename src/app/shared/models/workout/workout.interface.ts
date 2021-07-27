import { default as Document } from '../document.interface';

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
  };
}

export default IWorkoutDocument;
