import { useState, useEffect } from 'react';

export interface Exercise {
  exercise_type_id: number;
  exercise_type?: { name: string };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const workoutsRes = await fetch('/api/workouts.php');
        if (!workoutsRes.ok) throw new Error(`HTTP ${workoutsRes.status}`);
        const data = await workoutsRes.json();
        setHistory(data.workouts || []);

        const weightsRes = await fetch('/api/last-weights.php');
        if (!weightsRes.ok) throw new Error(`HTTP ${weightsRes.status}`);
        const weights = await weightsRes.json();
        setLastUsedWeights(weights);

        const typesRes = await fetch('/api/exercise-types.php');
        if (!typesRes.ok) throw new Error(`HTTP ${typesRes.status}`);
        const types = await typesRes.json();
        setExerciseTypes(types || []);
      } catch (err) {
        setError((err as Error).message || 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addWorkoutSession = async (session: { exercises: Omit<Exercise, 'total_reps' | 'total_volume' | 'exercise_type'>[] }) => {
    try {
      const res = await fetch('/api/workouts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refresh
      const updated = await fetch('/api/workouts.php').then(r => r.json());
      setHistory(updated.workouts || []);
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
    updateLastUsedWeight,
    loading,
    error
  };
};