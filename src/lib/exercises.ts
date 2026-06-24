export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio",
  "full_body",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full body",
};

export const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  machine: "Machine",
  cable: "Cable",
  bodyweight: "Bodyweight",
  kettlebell: "Kettlebell",
  band: "Resistance band",
  other: "Other",
};

export type Exercise = {
  id: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
};

export const EXERCISES: Exercise[] = [
  // Chest
  { id: "bench-press", name: "Barbell bench press", muscle: "chest", equipment: "barbell" },
  { id: "db-bench-press", name: "Dumbbell bench press", muscle: "chest", equipment: "dumbbell" },
  { id: "incline-db-press", name: "Incline dumbbell press", muscle: "chest", equipment: "dumbbell" },
  { id: "cable-fly", name: "Cable chest fly", muscle: "chest", equipment: "cable" },
  { id: "push-up", name: "Push-up", muscle: "chest", equipment: "bodyweight" },

  // Back
  { id: "deadlift", name: "Barbell deadlift", muscle: "back", equipment: "barbell" },
  { id: "pull-up", name: "Pull-up", muscle: "back", equipment: "bodyweight" },
  { id: "lat-pulldown", name: "Lat pulldown", muscle: "back", equipment: "cable" },
  { id: "barbell-row", name: "Barbell row", muscle: "back", equipment: "barbell" },
  { id: "db-row", name: "Single-arm dumbbell row", muscle: "back", equipment: "dumbbell" },

  // Shoulders
  { id: "ohp", name: "Overhead press", muscle: "shoulders", equipment: "barbell" },
  { id: "db-shoulder-press", name: "Dumbbell shoulder press", muscle: "shoulders", equipment: "dumbbell" },
  { id: "lateral-raise", name: "Lateral raise", muscle: "shoulders", equipment: "dumbbell" },
  { id: "face-pull", name: "Face pull", muscle: "shoulders", equipment: "cable" },

  // Arms
  { id: "barbell-curl", name: "Barbell curl", muscle: "arms", equipment: "barbell" },
  { id: "db-curl", name: "Dumbbell curl", muscle: "arms", equipment: "dumbbell" },
  { id: "tricep-pushdown", name: "Tricep pushdown", muscle: "arms", equipment: "cable" },
  { id: "skullcrusher", name: "Skullcrusher", muscle: "arms", equipment: "barbell" },

  // Legs
  { id: "back-squat", name: "Back squat", muscle: "legs", equipment: "barbell" },
  { id: "front-squat", name: "Front squat", muscle: "legs", equipment: "barbell" },
  { id: "romanian-deadlift", name: "Romanian deadlift", muscle: "legs", equipment: "barbell" },
  { id: "leg-press", name: "Leg press", muscle: "legs", equipment: "machine" },
  { id: "walking-lunge", name: "Walking lunge", muscle: "legs", equipment: "dumbbell" },
  { id: "leg-curl", name: "Leg curl", muscle: "legs", equipment: "machine" },
  { id: "calf-raise", name: "Standing calf raise", muscle: "legs", equipment: "machine" },

  // Core
  { id: "plank", name: "Plank", muscle: "core", equipment: "bodyweight" },
  { id: "hanging-leg-raise", name: "Hanging leg raise", muscle: "core", equipment: "bodyweight" },
  { id: "ab-wheel", name: "Ab wheel rollout", muscle: "core", equipment: "other" },
  { id: "russian-twist", name: "Russian twist", muscle: "core", equipment: "dumbbell" },

  // Cardio
  { id: "rowing", name: "Rowing machine", muscle: "cardio", equipment: "machine" },
  { id: "treadmill", name: "Treadmill run", muscle: "cardio", equipment: "machine" },
  { id: "kb-swing", name: "Kettlebell swing", muscle: "cardio", equipment: "kettlebell" },
  { id: "burpee", name: "Burpee", muscle: "full_body", equipment: "bodyweight" },
];

const byId = new Map(EXERCISES.map((e) => [e.id, e]));
export function getExercise(id: string): Exercise | undefined {
  return byId.get(id);
}
