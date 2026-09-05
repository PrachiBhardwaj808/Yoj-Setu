import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,               element: <Home /> },
      { path: 'login',             element: <Login /> },
      { path: 'register',          element: <Register /> },
      { path: 'dashboard',         element: <Dashboard /> },
      { path: 'schemes',           element: <Schemes /> },
      { path: 'schemes/:id',       element: <SchemeDetails /> },
      { path: 'applications',      element: <Applications /> },
      { path: 'documents',         element: <Documents /> },
      { path: 'notifications',     element: <Notifications /> },
      { path: 'profile',           element: <Profile /> },
      { path: 'assistant',         element: <Assistant /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
