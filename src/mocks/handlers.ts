import { http, HttpResponse } from 'msw';
import type { WorkoutSession } from '../hooks/useWorkoutData';

let mockWorkouts: WorkoutSession[] = [];
let mockLastWeights: Record<number, number> = {};

// Hardcoded exercise types (match your DB)
const exerciseTypes = [
  { id: 1, name: 'Squat', default_sets: 3, default_reps: 10, category_id: 1 },
  { id: 2, name: 'Row', default_sets: 3, default_reps: 10, category_id: 2 },
  { id: 3, name: 'Chest', default_sets: 3, default_reps: 10, category_id: 3 },
  { id: 4, name: 'Bicep', default_sets: 3, default_reps: 10, category_id: 4 },
  { id: 5, name: 'Leg Ext', default_sets: 3, default_reps: 10, category_id: 1 },
  { id: 6, name: 'Tricep', default_sets: 3, default_reps: 10, category_id: 4 },
  { id: 7, name: 'Calf', default_sets: 3, default_reps: 15, category_id: 1 },
  { id: 8, name: 'Pec', default_sets: 3, default_reps: 10, category_id: 3 },
  { id: 9, name: 'Leg Curl', default_sets: 3, default_reps: 10, category_id: 1 },
  { id: 10, name: 'Shoulder', default_sets: 3, default_reps: 10, category_id: 3 },
  { id: 11, name: 'Torso Rotation', default_sets: 3, default_reps: 10, category_id: 5 }
];

export const handlers = [
  // GET /api/workouts
  http.get('/api/workouts', () => {
    const workoutsWithNames = mockWorkouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        exercise_type: exerciseTypes.find(et => et.id === ex.exercise_type_id) || { name: 'Unknown' }
      }))
    }));
    return HttpResponse.json(workoutsWithNames);
  }),

  // GET /api/workouts.php
  http.get('/api/workouts.php', () => {
    const workoutsWithNames = mockWorkouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        exercise_type: exerciseTypes.find(et => et.id === ex.exercise_type_id) || { name: 'Unknown' }
      }))
    }));
    return HttpResponse.json(workoutsWithNames);
  }),

  // POST /api/workouts
  http.post('/api/workouts', async ({ request }) => {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !('exercises' in body)) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const newWorkout = body as { exercises: { exercise_type_id: number; weight_lbs: number; sets: number[] }[] };

    if (!Array.isArray(newWorkout.exercises)) {
      return HttpResponse.json({ error: 'Exercises must be an array' }, { status: 400 });
    }

    const savedWorkout: WorkoutSession = {
      id: Date.now(),
      workout_date: new Date().toISOString().split('T')[0],
      total_volume: 0,
      exercises: newWorkout.exercises.map(ex => {
        const totalReps = ex.sets.reduce((sum: number, r: number) => sum + r, 0);
        const volume = ex.weight_lbs * totalReps;
        return {
          exercise_type_id: ex.exercise_type_id,
          weight_lbs: ex.weight_lbs,
          sets: ex.sets,
          total_reps: totalReps,
          total_volume: volume
        };
      })
    };

    savedWorkout.total_volume = savedWorkout.exercises.reduce((sum: number, ex) => sum + ex.total_volume, 0);

    mockWorkouts.unshift(savedWorkout);

    savedWorkout.exercises.forEach(ex => {
      mockLastWeights[ex.exercise_type_id] = ex.weight_lbs;
    });

    return HttpResponse.json({ success: true, id: savedWorkout.id }, { status: 201 });
  }),

  // POST /api/workouts.php
  http.post('/api/workouts.php', async ({ request }) => {
    const body = await request.json();

    if (!body || typeof body !== 'object' || !('exercises' in body)) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const newWorkout = body as { exercises: { exercise_type_id: number; weight_lbs: number; sets: number[] }[] };

    if (!Array.isArray(newWorkout.exercises)) {
      return HttpResponse.json({ error: 'Exercises must be an array' }, { status: 400 });
    }

    const savedWorkout: WorkoutSession = {
      id: Date.now(),
      workout_date: new Date().toISOString().split('T')[0],
      total_volume: 0,
      exercises: newWorkout.exercises.map(ex => {
        const totalReps = ex.sets.reduce((sum: number, r: number) => sum + r, 0);
        const volume = ex.weight_lbs * totalReps;
        return {
          exercise_type_id: ex.exercise_type_id,
          weight_lbs: ex.weight_lbs,
          sets: ex.sets,
          total_reps: totalReps,
          total_volume: volume
        };
      })
    };

    savedWorkout.total_volume = savedWorkout.exercises.reduce((sum: number, ex) => sum + ex.total_volume, 0);

    mockWorkouts.unshift(savedWorkout);

    savedWorkout.exercises.forEach(ex => {
      mockLastWeights[ex.exercise_type_id] = ex.weight_lbs;
    });

    return HttpResponse.json({ success: true, id: savedWorkout.id }, { status: 201 });
  }),

  // GET /api/exercise-types
  http.get('/api/exercise-types', () => {
    const enrichedTypes = exerciseTypes.map(type => ({
      ...type,
      last_weight_lbs: mockLastWeights[type.id] ?? null
    }));
    return HttpResponse.json(enrichedTypes);
  }),

  // GET /api/exercise-types.php
  http.get('/api/exercise-types.php', () => {
    const enrichedTypes = exerciseTypes.map(type => ({
      ...type,
      last_weight_lbs: mockLastWeights[type.id] ?? null
    }));
    return HttpResponse.json(enrichedTypes);
  }),

  // GET /api/last-weights
  http.get('/api/last-weights', () => {
    return HttpResponse.json(mockLastWeights);
  }),

  // GET /api/last-weights.php
  http.get('/api/last-weights.php', () => {
    return HttpResponse.json(mockLastWeights);
  })
];