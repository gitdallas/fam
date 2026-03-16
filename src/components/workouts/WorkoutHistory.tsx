import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@patternfly/react-table';
import type { WorkoutSession } from '../../hooks/useWorkoutData';

interface Props {
  sessions: WorkoutSession[];
}

const WorkoutHistory: React.FC<Props> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <p style={{ marginTop: '2rem', color: '#888', textAlign: 'center' }}>
        No workouts logged yet. Start one with the button above!
      </p>
    );
  }

  return (
    <>
      {sessions.map(session => (
        <Card key={session.id} isCompact isPlain style={{ marginTop: '1.5rem' }}>
          <CardHeader>
            <CardTitle>{session.workout_date}</CardTitle>
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
                {session.exercises.map((ex, i) => (
                  <Tr key={i}>
                    <Td>{ex.exercise_type?.name || 'Unknown'}</Td>
                    <Td>{ex.weight_lbs}</Td>
                    <Td>{ex.sets.join(' ')}</Td>
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