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
        // Fetch workouts
        const workoutsRes = await fetch('/api/workouts');
        if (!workoutsRes.ok) throw new Error(`Failed to fetch workouts: HTTP ${workoutsRes.status}`);
        const workoutsData = await workoutsRes.json();
        const workoutsArray = Array.isArray(workoutsData) ? workoutsData : (workoutsData.workouts || []);
        setHistory(workoutsArray);

        // Fetch exercise types (enriched with last_weight_lbs)
        const typesRes = await fetch('/api/workouts/exercise-types.php');
        if (!typesRes.ok) throw new Error(`Failed to fetch exercise types: HTTP ${typesRes.status}`);
        const types = await typesRes.json();

        // Extract last used weights from the enriched types
        const weights: Record<number, number> = {};
        types.forEach((t: any) => {
          if (t.last_weight_lbs !== null && t.last_weight_lbs !== undefined) {
            weights[t.id] = Number(t.last_weight_lbs);
          }
        });
        setLastUsedWeights(weights);

        // Store clean exercise types for UI (only id and name)
        setExerciseTypes(types.map((t: any) => ({
          id: t.id,
          name: t.name
        })));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Data fetch failed:', err);
      } finally {
        setLoading(false);
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

      if (!res.ok) throw new Error(`Failed to save workout: HTTP ${res.status}`);

      // Refresh history after save
      const updatedRes = await fetch('/api/workouts');
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        const updatedArray = Array.isArray(updatedData) ? updatedData : (updatedData.workouts || []);
        setHistory(updatedArray);
      }
    } catch (err) {
      console.error('Failed to add workout session:', err);
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