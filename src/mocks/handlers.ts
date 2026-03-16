import { http, HttpResponse } from 'msw';
import type { WorkoutSession } from '../hooks/useWorkoutData'; // ← import the type!

let mockWorkouts: WorkoutSession[] = [];
let mockLastWeights: Record<number, number> = {};

// Hardcoded exercise types (match what you'll insert in DB)
const exerciseTypes = [
  { id: 1, name: 'Squat' },
  { id: 2, name: 'Row' },
  { id: 3, name: 'Chest' },
  { id: 4, name: 'Bicep' },
  { id: 5, name: 'Leg Ext' },
  { id: 6, name: 'Tricep' },
  { id: 7, name: 'Calf' },
  { id: 8, name: 'Pec' },
  { id: 9, name: 'Leg Curl' },
  { id: 10, name: 'Shoulder' },
  { id: 11, name: 'Torso Rotation' }
];

export const handlers = [
  // GET /api/workouts - return all workouts with joined exercise names
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

  // POST /api/workouts - add new workout, update last weights
  http.post('/api/workouts', async ({ request }) => {
    const body = await request.json();

    // Null/undefined check
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

    mockWorkouts.unshift(savedWorkout); // newest first

    // Update last used weights
    savedWorkout.exercises.forEach(ex => {
      mockLastWeights[ex.exercise_type_id] = ex.weight_lbs;
    });

    return HttpResponse.json({ success: true, id: savedWorkout.id }, { status: 201 });
  }),

  // GET /api/exercise-types - list of all exercise types
  http.get('/api/exercise-types', () => {
    return HttpResponse.json(exerciseTypes);
  }),

  // GET /api/last-weights - last used weights
  http.get('/api/last-weights', () => {
    return HttpResponse.json(mockLastWeights);
  })
];