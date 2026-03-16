import { useState, useEffect } from 'react';

export interface Exercise {
  exercise_type_id: number;
  exercise_type?: { name: string }; // populated by mock / future backend
  weight_lbs: number;
  sets: number[];
  total_reps: number;
  total_volume: number;
}

export interface WorkoutSession {
  id: number;
  workout_date: string;
  total_volume: number;
  exercises: Exercise[];
}

export const useWorkoutData = () => {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [lastUsedWeights, setLastUsedWeights] = useState<Record<number, number>>({});
  const [exerciseTypes, setExerciseTypes] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workoutsRes = await fetch('/api/workouts');
        if (workoutsRes.ok) {
          const data = await workoutsRes.json();
          setHistory(data);
        }

        const weightsRes = await fetch('/api/last-weights');
        if (weightsRes.ok) {
          const weights = await weightsRes.json();
          setLastUsedWeights(weights);
        }

        const typesRes = await fetch('/api/exercise-types');
        if (typesRes.ok) {
          const types = await typesRes.json();
          setExerciseTypes(types);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    fetchData();
  }, []);

  const addWorkoutSession = async (session: { exercises: Omit<Exercise, 'total_reps' | 'total_volume' | 'exercise_type'>[] }) => {
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (res.ok) {
        // Refresh history
        const updated = await fetch('/api/workouts').then(r => r.json());
        setHistory(updated);
      }
    } catch (err) {
      console.error('Failed to save workout', err);
    }
  };

  const updateLastUsedWeight = (exercise_type_id: number, weight: number) => {
    setLastUsedWeights(prev => ({ ...prev, [exercise_type_id]: weight }));
  };

  return {
    history,
    lastUsedWeights,
    exerciseTypes,
    addWorkoutSession,
    updateLastUsedWeight
  };
};