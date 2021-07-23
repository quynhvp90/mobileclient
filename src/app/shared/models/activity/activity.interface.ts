import { default as Document } from '../document.interface';

export interface IActivity {
  organizationId?: string;
  userId?: string;
  workoutId?: string;
  name: string; // change to 'icon'
  label: string;
  goal: number;
  logLabel: string;

  measurement: string; // 'repetitions', 'time', 'distance', 'weight', 'other'
  unit?: string; // 'null', 'seconds', 'minutes', 'hours', 'miles', 'kilometers', 'lbs', 'kgs', 'grams', 'oz', 'other'
  weight?: string;
  caloriesPerMinute?: number;

  lastLogCount?: number;
  lastlogDate?: Date;
  lifetimeCount?: number;
  personalRecord?: number;

  // not used
  priority?: number;
  enableDuration?: Boolean;
  enableAverageHeartRate?: Boolean;
  countType?: string; // 'reps', 'miles', 'km', 'time',
  durationType?: string;
  muscles?: string;
  youtube?: string;

  lookup?: {
    count?: number; // user done push
    calories?: number;
    stats?: any;
    duplicateActivites?: any[]; // for stats when combining
  };
}

export interface IActivityDocument extends IActivity, Document {
}

export default IActivityDocument;
