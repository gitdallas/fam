import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  EmptyState,
  EmptyStateVariant,
  Title,
  Spinner
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@patternfly/react-table';
import { CubesIcon } from '@patternfly/react-icons';
import type { WorkoutSession } from '../../hooks/useWorkoutData';

interface Props {
  sessions: WorkoutSession[];
  loading?: boolean;
  error?: string | null;
}

const WorkoutHistory: React.FC<Props> = ({ sessions, loading = false, error = null }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <Spinner />
        <p>Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyState icon={CubesIcon} />
        <Title headingLevel="h4" size="lg">Error loading workouts</Title>
        <p>{error}</p>
      </EmptyState>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyState icon={CubesIcon} />
        <Title headingLevel="h4" size="lg">No workouts logged yet</Title>
        <p>Start one with the button above!</p>
      </EmptyState>
    );
  }

  return (
    <>
      {sessions.map(session => (
        <Card key={session.id} isCompact isPlain style={{ marginTop: '1.5rem' }}>
          <CardHeader>
            <CardTitle>{session.workout_date || 'Unknown date'}</CardTitle>
          </CardHeader>
          <CardBody>
            <Table aria-label={`Workout on ${session.workout_date}`} variant="compact">
              <Thead>
                <Tr>
                  <Th>Exercise</Th>
                  <Th>Weight (lbs)</Th>
                  <Th>Sets (reps)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(session.exercises || []).map((ex, i) => (
                  <Tr key={i}>
                    <Td>{ex.exercise_type?.name || 'Unknown'}</Td>
                    <Td>{ex.weight_lbs ?? '-'}</Td>
                    <Td>{(ex.sets || []).join(' ') || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      ))}
    </>
  );
};

export default WorkoutHistory;