import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageSection, Title, Button, Flex, Spinner } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import WorkoutHistory from '../components/workouts/WorkoutHistory';
import { useWorkoutData } from '../hooks/useWorkoutData';

const Workouts: React.FC = () => {
  const navigate = useNavigate();
  const { history, loading, error } = useWorkoutData();

  return (
    <PageSection>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsCenter' }}
        style={{ marginBottom: '1.5rem' }}
      >
        <Title headingLevel="h1" size="2xl">Workouts</Title>

        <Button
          variant="primary"
          icon={<PlusIcon />}
          onClick={() => navigate('/workouts/new')}
        >
          New Workout
        </Button>
      </Flex>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Spinner />
          <p>Loading workouts...</p>
        </div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '3rem 0' }}>
          Error loading workouts: {error}
        </div>
      ) : (
        <WorkoutHistory sessions={history} loading={loading} error={error} />
      )}
    </PageSection>
  );
};

export default Workouts;