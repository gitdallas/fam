import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  FlexItem,
  NumberInput,
  Label,
  Card,
  CardBody,
  CardTitle,
  Spinner
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';
import { useWorkoutData } from '../hooks/useWorkoutData';

const NewWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { exerciseTypes, lastUsedWeights, addWorkoutSession, updateLastUsedWeight, loading, error } = useWorkoutData();

  const [currentSession, setCurrentSession] = useState<any[]>([]);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [weight, setWeight] = useState(225);
  const [reps, setReps] = useState(10);
  const [sets, setSets] = useState<number[]>([]);

  // Reset on mount and when exerciseTypes load
  useEffect(() => {
    if (exerciseTypes.length > 0) {
      setRemaining(exerciseTypes.map(et => et.id));
      setCurrentSession([]);
      setSelectedId(null);
      setSets([]);
    }
  }, [exerciseTypes]);

  const selectedName = exerciseTypes.find(et => et.id === selectedId)?.name || '';

  const startExercise = (typeId: number) => {
    setSelectedId(typeId);
    setWeight(lastUsedWeights[typeId] || 225);
    setReps(10); // fallback; can pull from DB later
    setSets([]);
  };

  const addSet = () => {
    if (reps > 0) setSets(prev => [...prev, reps]);
  };

  const finishExercise = () => {
    if (!selectedId || sets.length === 0) return;
    const exercise = {
      exercise_type_id: selectedId,
      weight_lbs: weight,
      sets: [...sets]
    };
    setCurrentSession(prev => [...prev, exercise]);
    updateLastUsedWeight(selectedId, weight);
    setRemaining(prev => prev.filter(id => id !== selectedId));
    setSelectedId(null);
    setSets([]);
  };

  const cancelExercise = () => {
    setSelectedId(null);
    setSets([]);
  };

  const finishWorkout = () => {
    if (currentSession.length === 0) return;
    addWorkoutSession({ exercises: currentSession });
    navigate('/workouts');
  };

  const cancelWorkout = () => {
    navigate('/workouts');
  };

  const handleWeightChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    setWeight(Number(value));
  };

  const handleRepsChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    setReps(Number(value));
  };

  const handleWeightMinus = () => setWeight(prev => Math.max(0, prev - 5));
  const handleWeightPlus = () => setWeight(prev => prev + 5);

  const handleRepsMinus = () => setReps(prev => Math.max(1, prev - 1));
  const handleRepsPlus = () => setReps(prev => prev + 1);

  return (
    <PageSection>
      <Breadcrumb>
        <BreadcrumbItem to="/workouts">Workouts</BreadcrumbItem>
        <BreadcrumbItem isActive>New Workout</BreadcrumbItem>
      </Breadcrumb>

      <Title headingLevel="h1" size="2xl" style={{ margin: '1rem 0' }}>
        New Workout
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner />
          <p style={{ marginTop: '1rem' }}>Loading exercises...</p>
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '4rem 0' }}>
          Error loading exercises: {error}
        </div>
      ) : selectedId ? (
        <div>
          <Card isCompact isPlain>
            <CardTitle>{selectedName}</CardTitle>
            <CardBody>
              <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                <FlexItem>
                  <label>Weight (lbs)</label>
                  <NumberInput
                    value={weight}
                    onChange={handleWeightChange}
                    onMinus={handleWeightMinus}
                    onPlus={handleWeightPlus}
                    min={0}
                    step={5}
                  />
                </FlexItem>

                <FlexItem>
                  <label>Reps for next set</label>
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <NumberInput
                      value={reps}
                      onChange={handleRepsChange}
                      onMinus={handleRepsMinus}
                      onPlus={handleRepsPlus}
                      min={1}
                      step={1}
                    />
                    <Button variant="secondary" onClick={addSet}>
                      Add Set
                    </Button>
                  </Flex>
                </FlexItem>

                <FlexItem>
                  <Label color="blue">
                    Sets added: {sets.length > 0 ? sets.join(' ') : '—'}
                  </Label>
                </FlexItem>

                <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} gap={{ default: 'gapMd' }}>
                  <Button variant="link" onClick={cancelExercise}>
                    Cancel {selectedName}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={finishExercise}
                    isDisabled={sets.length === 0}
                    icon={<ArrowRightIcon />}
                    iconPosition="right"
                  >
                    Done with {selectedName}
                  </Button>
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '1rem' }}>Choose next exercise:</p>

          {exerciseTypes.length === 0 ? (
            <p>No exercises available. Contact admin to add some!</p>
          ) : (
            <Flex wrap="wrap" gap={{ default: 'gapMd' }}>
              {remaining.map(typeId => {
                const type = exerciseTypes.find(et => et.id === typeId);
                return type ? (
                  <Button key={typeId} variant="secondary" onClick={() => startExercise(typeId)}>
                    {type.name}
                  </Button>
                ) : null;
              })}
            </Flex>
          )}

          {remaining.length === 0 && exerciseTypes.length > 0 && (
            <p style={{ marginTop: '1rem', color: 'var(--pf-v6-global--success-color--100)' }}>
              All exercises completed! Ready to finish.
            </p>
          )}

          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} gap={{ default: 'gapMd' }} style={{ marginTop: '2rem' }}>
            <Button variant="link" onClick={cancelWorkout}>
              Cancel Workout
            </Button>
            <Button
              variant="primary"
              onClick={finishWorkout}
              isDisabled={currentSession.length === 0}
            >
              Finish Workout
            </Button>
          </Flex>
        </div>
      )}
    </PageSection>
  );
};

export default NewWorkout;