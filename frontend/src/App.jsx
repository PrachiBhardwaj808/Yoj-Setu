import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SchemesListPage from './pages/schemes/SchemesListPage';
import SchemeDetailPage from './pages/schemes/SchemeDetailPage';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Assistant from './pages/Assistant';
import NotFoundPage from './pages/NotFoundPage';

function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Outlet />
      </ProfileProvider>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute requireOnboarding={false}>
            <Onboarding />
          </ProtectedRoute>
        ),
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ),
          },
          { path: 'schemes', element: <SchemesListPage /> },
          { path: 'schemes/:id', element: <SchemeDetailPage /> },
          {
            path: 'applications',
            element: (
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            ),
          },
          {
            path: 'documents',
            element: (
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'assistant',
            element: (
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}