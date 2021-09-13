export interface IExercise {
  name: string;
  label: string;
  plural: string;
  exerciseType: string[];
  muscles: string[];
  tags: string[];
  exertionLevel: string;
  enabled: boolean;
  youtube?: string;
  image?: string;
}

const exercises: IExercise[] = [{
  name: 'alt_arm_leg_plank',
  label: 'Alt. Arm & Leg Planks',
  plural: 'alternating arm planks',
  exerciseType: ['upper', 'core'],
  muscles: ['shoulders', 'sideabs'],
  tags: ['alernating', 'arm', 'plank'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/JoBPHqtUqSo',
}, {
  name: 'bicycle_machine',
  label: 'Bicycle (Machine)',
  plural: 'bicycle',
  exerciseType: ['cardio'],
  muscles: ['upperlegs'],
  tags: ['bicycle'],
  exertionLevel: 'very_hard',
  enabled: true,
}, {
  name: 'bicycle_outdoor',
  label: 'Bicycle (Outdoors)',
  plural: 'bicycle',
  exerciseType: ['cardio', 'outdoor'],
  muscles: ['upperlegs'],
  tags: ['bicycle', 'outdoor', 'outside'],
  exertionLevel: 'very_hard',
  enabled: true,
}, {
  name: 'box_jumps',
  label: 'Box Jumps',
  plural: 'box jumps',
  exerciseType: ['core', 'lower'],
  muscles: ['upperlegs'],
  tags: ['box', 'jump'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/52r_Ul5k03g',
}, {
  name: 'bridges',
  label: 'Bridges',
  plural: 'bridges',
  exerciseType: ['core', 'abs'],
  muscles: ['back', 'abs', 'glutes'],
  tags: ['bridges', 'reverse plank'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/_leI4qFfPVw',
}, {
  name: 'burpee',
  label: 'Burpee',
  plural: 'burpees',
  exerciseType: ['core', 'abs', 'upper', 'lower'],
  muscles: ['shoulders', 'forearms', 'chest', 'abs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
  tags: ['burpee', 'body builder', 'push up', 'pushup'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/TU8QYVW0gDU',
}, {
  name: 'chinup',
  label: 'Chin-up',
  plural: 'chin-ups',
  exerciseType: ['core', 'upper', 'back'],
  muscles: ['shoulders', 'neck'],
  tags: ['chinup', 'chin-up', 'curl-up'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/QAuDYzEw_Js',
}, {
  name: 'cleanAndJerk',
  label: 'Clean & Jerk',
  plural: 'clean & jerks',
  exerciseType: ['core', 'back', 'upper', 'weights'],
  tags: ['clean and jerk', 'body builder', 'weights'],
  muscles: ['shoulders', 'neck', 'glutes', 'upperlegs'],
  exertionLevel: 'hard',
  enabled: true,
}, {
  name: 'climbers',
  label: 'Mountain Climbers',
  plural: 'mountain climbers',
  exerciseType: ['core', 'abs'],
  muscles: ['shoulders', 'chest', 'abs', 'upperlegs', 'lowerlegs'],
  tags: ['mountain climbers', 'climbers'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/nmwgirgXLYM',
}, {
  name: 'curl',
  label: 'Curl',
  plural: 'curls',
  muscles: ['shoulders', 'forearms'],
  exerciseType: ['core', 'upper', 'arms', 'weights'],
  tags: ['curl', 'curls'],
  exertionLevel: 'hard',
  enabled: true,
}, {
  name: 'dip',
  label: 'Dips',
  plural: 'dips',
  exerciseType: ['arms'],
  muscles: ['shoulders', 'forearms', 'back'],
  tags: ['dips'],
  exertionLevel: 'hard',
  enabled: true,
}, {
  name: 'flutter_kicks',
  label: 'Flutter Kicks',
  plural: 'flutter kicks',
  exerciseType: ['core', 'abs'],
  muscles: ['abs'],
  tags: ['flutter kicks', 'leg lifts'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/eEG9uXjx4vQ',
}, {
  name: 'leg_raises',
  label: 'Leg Raises',
  plural: 'leg raises',
  exerciseType: ['core', 'abs'],
  muscles: ['abs'],
  tags: ['leg lifts', 'leg raises'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/l4kQd9eWclE',
}, {
  name: 'lunge',
  label: 'Lunge',
  plural: 'lunges',
  exerciseType: ['core', 'abs', 'lower'],
  tags: ['lunges'],
  muscles: ['abs', 'upperlegs'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/QF0BQS2W80k',
}, {
  name: 'plank',
  label: 'Plank',
  plural: 'planks',
  exerciseType: ['core', 'abs', 'upper'],
  muscles: ['shoulders', 'chest', 'abs', 'sideabs', 'back'],
  tags: ['planks'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/XMxHTNPPgxM',
}, {
  name: 'pullup',
  label: 'Pull-up',
  plural: 'pull-ups',
  exerciseType: ['core', 'back', 'upper'],
  muscles: ['shoulders', 'neck'],
  tags: ['pullups'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/HRV5YKKaeVw',
}, {
  name: 'side_grip_pullups',
  label: 'Side Grip Pullup',
  plural: 'side grip pull-ups',
  exerciseType: ['core', 'back', 'upper'],
  muscles: ['shoulders', 'neck'],
  tags: ['pullups'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/hrP7qgW8PWc',
}, {
  name: 'pushup',
  label: 'Push-up',
  plural: 'push-ups',
  exerciseType: ['core', 'upper'],
  muscles: ['shoulders', 'forearms', 'chest', 'neck'],
  tags: ['pushups'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/_l3ySVKYVJ8',
}, {
  name: 'plyo_pushup',
  label: 'Plyo push-up',
  plural: 'plyo push-ups',
  exerciseType: ['core', 'upper'],
  muscles: ['shoulders', 'forearms', 'chest', 'neck'],
  tags: ['pushups', 'plyo'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/FRo3b_Pfw3M',
  image: 'pushup',
}, {
  name: 'rowing_machine',
  label: 'Rowing Machine',
  plural: 'rowing machine',
  exerciseType: ['cardio', 'back', 'core', 'abs'],
  tags: ['rowing machine'],
  muscles: ['shoulders', 'chest', 'abs', 'neck', 'back', 'upperlegs', 'lowerlegs'],
  exertionLevel: 'hard',
  enabled: true,
}, {
  name: 'running_outdoor',
  label: 'Running (Outdoor)',
  plural: 'running',
  exerciseType: ['cardio', 'outdoor'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['running'],
  exertionLevel: 'very_hard',
  enabled: true,
}, {
  name: 'shoulder_taps',
  label: 'Shoulder Taps',
  plural: 'should taps',
  exerciseType: ['core', 'upper'],
  muscles: ['shoulders', 'chest', 'abs', 'sideabs', 'back'],
  tags: ['shoulder taps', 'plank taps'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/ztpXZm7Dv80',
}, {
  name: 'single_leg_squat',
  label: 'Single Leg Squat',
  plural: 'single leg squats',
  exerciseType: ['lower'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['single leg squat'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/7LRToEIS14o',
}, {
  name: 'situp',
  label: 'Sit-up',
  plural: 'sit-ups',
  exerciseType: ['core', 'abs'],
  muscles: ['abs'],
  tags: ['situps'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/jDwoBqPH0jk',
}, {
  name: 'vup',
  label: 'v-up',
  plural: 'v-ups',
  exerciseType: ['core', 'abs'],
  muscles: ['abs'],
  tags: ['vup', 'v-up'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/7UVgs18Y1P4',
  image: 'v_up',
}, {
  name: 'snatch',
  label: 'Snatch',
  plural: 'snatches',
  exerciseType: ['upper', 'weights'],
  muscles: ['shoulders', 'neck', 'glutes', 'upperlegs'],
  tags: ['snatches'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/9xQp2sldyts',
}, {
  name: 'squat',
  label: 'Squat',
  plural: 'squats',
  exerciseType: ['lower'],
  muscles: ['upperlegs'],
  tags: ['squats'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/C_VtOYc6j5c',
}, {
  name: 'open_hip_squat',
  label: 'Open Hip Squats',
  plural: 'open hip squats',
  exerciseType: ['lower'],
  muscles: ['upperlegs'],
  tags: ['squats'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/Pkid3_35Rjc',
  image: 'open_hip_squats',
}, {
  name: 'squat_weight',
  label: 'Squat',
  plural: 'squats',
  exerciseType: ['lower'],
  muscles: ['upperlegs', 'weights'],
  tags: ['squats', 'weights', 'deadlift'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/op9kVnSso6Q',
}, {
  name: 'side_plank_pushup',
  label: 'Side Plank Pushup',
  plural: 'side plank pushups',
  exerciseType: ['core', 'abs', 'upper'],
  muscles: ['shoulders', 'chest', 'abs', 'sideabs', 'back'],
  tags: ['planks'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/rnrioFu3WAs',
  image: 'side_plank_pushup',
}, {
  name: 'stairmaster',
  label: 'Stairmaster',
  plural: 'stairmaster',
  exerciseType: ['cardio'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['stairmaster'],
  exertionLevel: 'very_hard',
  enabled: true,
}, {
  name: 'star_plank',
  label: 'Star Plank',
  plural: 'star planks',
  exerciseType: ['core'],
  muscles: ['shoulders', 'chest', 'abs', 'sideabs', 'back'],
  tags: ['starplanks'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/UeC46HoCrrA',
}, {
  name: 'superman',
  label: 'Superman',
  plural: 'supermans',
  exerciseType: ['core', 'abs'],
  muscles: ['back', 'glutes'],
  tags: ['superman'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/z6PJMT2y8GQ',
}, {
  name: 'tire_slams_sledgehammer',
  label: 'Tire Slam',
  plural: 'tire slams',
  exerciseType: ['core', 'arms', 'upper', 'back'],
  muscles: ['shoulders', 'forearm', 'chest', 'neck', 'back'],
  tags: ['tireslams', 'sledge'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/RJKY5Ib9wkA',
}, {
  name: 'treadmill',
  label: 'Treadmill',
  plural: 'treadmill',
  exerciseType: ['cardio'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['treadmill', 'running'],
  exertionLevel: 'very_hard',
  enabled: true,
}, {
  name: 'tricep_extensions',
  label: 'Tricep Extensions',
  plural: 'tricep extensions',
  exerciseType: ['core', 'arms', 'upper'],
  muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
  tags: ['tricep', 'extensions'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/SuajkDYlIRw',
}, {
  name: 'tricep_curls',
  label: 'Tricep Curl',
  plural: 'tricep curls',
  exerciseType: ['core', 'arms', 'upper'],
  muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
  tags: ['tricep', 'curls'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/8nWNyQaEbaM',
}, {
  name: 'other',
  label: 'Other',
  plural: 'other',
  exerciseType: ['cardio', 'abs', 'core', 'arms', 'lower', 'upper'],
  muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
  tags: ['other'],
  exertionLevel: 'medium',
  enabled: true,
}, {
  name: 'bring_sally_up',
  label: 'Bring Sally Up',
  plural: 'change this',
  exerciseType: ['abs', 'core', 'arms', 'lower', 'upper'],
  muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
  tags: ['other'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/41N6bKO-NVI',
  image: 'other',
}, {
  name: 'bicycles_crunches',
  label: 'Bicycle Crunches',
  plural: 'bicycle crunches',
  exerciseType: ['abs', 'core', 'lower'],
  muscles: ['abs', 'sideabs'],
  tags: ['bicycle', 'crunches', 'situps'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/Iwyvozckjak',
  image: 'bicycles_crunches',
}, {
  name: 'crunches',
  label: 'Crunches',
  plural: 'crunches',
  exerciseType: ['abs', 'core', 'lower'],
  muscles: ['abs', 'sideabs'],
  tags: ['crunches', 'situps'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
  image: 'crunches',
}, {
  name: 'side_crunches',
  label: 'Side Crunch',
  plural: 'side crunches',
  exerciseType: ['abs', 'core', 'lower'],
  muscles: ['abs', 'sideabs'],
  tags: ['crunches', 'situps'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/FrFyUbxs1uQ',
  image: 'crunches',
}, {
  name: 'calf_raises',
  label: 'Calf Raise',
  plural: 'calf raises',
  exerciseType: ['lower', 'lowerlegs'],
  muscles: ['abs', 'sideabs'],
  tags: ['calf raises'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/-M4-G8p8fmc',
  image: 'calf_raises',
}, {
  name: 'inch_worms',
  label: 'Inch-worms',
  plural: 'inch-worms',
  exerciseType: ['core', 'upper'],
  muscles: ['shoulders', 'forearms', 'chest', 'neck'],
  tags: ['inch', 'inchworms'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/VSp0z7Mp5IU',
  image: 'inch_worms',
}, {
  name: 'jumping_jacks',
  label: 'Jumping Jacks',
  plural: 'jumping jacks',
  exerciseType: ['cardio'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['jumping', 'jacks'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/nGaXj3kkmrU',
  image: 'jumping_jacks',
}, {
  name: 'ab_wheel',
  label: 'AB Wheel',
  plural: 'ab wheel',
  exerciseType: ['abs', 'core', 'arms'],
  muscles: ['abs', 'sideabs'],
  tags: ['ab wheel', 'wheel', 'ab crunch'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/ikkOq5mHaho',
  image: 'ab_wheel',
}, {
  name: 'one_arm_curl',
  label: 'One Arm Curl',
  plural: 'one arm curls',
  exerciseType: ['arms', 'upper'],
  muscles: ['forearm'],
  tags: ['curl', 'one arm curl'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/yTWO2th-RIY',
  image: 'one_arm_curl',
}, {
  name: 'rings',
  label: 'Rings',
  plural: 'rings',
  exerciseType: ['abs', 'core', 'arms', 'upper'],
  muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back'],
  tags: ['rings'],
  exertionLevel: 'hard',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/dTL8HZmEadk',
  image: 'rings',
}, {
  name: 'russian_twists',
  label: 'Russian Twist',
  plural: 'russian twists',
  exerciseType: ['abs', 'core', 'arms'],
  muscles: ['abs', 'sideabs'],
  tags: ['russian', 'twists'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/wkD8rjkodUI',
  image: 'russian_twists',
}, {
  name: 'walking',
  label: 'Walking',
  plural: 'walking',
  exerciseType: ['cardio'],
  muscles: ['upperlegs', 'lowerlegs'],
  tags: ['walking'],
  exertionLevel: 'easy',
  enabled: true,
}, {
  name: 'yoga',
  label: 'Yoga',
  plural: 'yoga',
  exerciseType: ['cardio'],
  muscles: ['brain'],
  tags: ['yoga', 'meditation', 'mind', 'mental'],
  exertionLevel: 'easy',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/sTANio_2E0Q',
  image: 'meditation_yoga',
}, {
  name: 'clock',
  label: 'Clock',
  plural: 'clock',
  exerciseType: ['cardio'],
  muscles: ['brain'],
  tags: ['clock', 'time'],
  exertionLevel: 'easy',
  enabled: true,
}, {
  name: 'shoulder_raises',
  label: 'Shoulder Rasise',
  plural: 'shoulder raises',
  exerciseType: ['upper'],
  muscles: ['shoulders'],
  tags: ['shoulder', 'raise'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/rxx5KRN8KUE',
}, {
  name: 'soccer_ball_juggles',
  label: 'Soccer Ball Juggle',
  plural: 'soccer ball juggles',
  exerciseType: ['core', 'lower'],
  muscles: ['abs', 'sideabs', 'glutes', 'lowerlegs'],
  tags: ['soccer', 'football'],
  exertionLevel: 'medium',
  enabled: true,
  youtube: 'https://www.youtube.com/embed/SzZ7Ecql-sg',
}];

export default exercises;
