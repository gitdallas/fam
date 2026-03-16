import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Expenses from './pages/Expenses';
import Chores from './pages/Chores';
import Workouts from './pages/Workouts';
import NewWorkout from './pages/NewWorkout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Expenses /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'chores', element: <Chores /> },
      {
        path: 'workouts',
        children: [
          { index: true, element: <Workouts /> },
          { path: 'new', element: <NewWorkout /> }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;