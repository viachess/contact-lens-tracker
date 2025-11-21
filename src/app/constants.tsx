import {
  ConfirmEmailPage,
  DataPage,
  HomePage,
  LoginPage,
  ProfilePage,
  SettingsPage,
  SignUpPage
} from '@/pages';
import { FC } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import { RootLayout } from './layout/root-layout';
import { ProtectedRoute } from './providers/ProtectedRoute';

export const routes: {
  title: string;
  path: string;
  element: FC;
}[] = [
  { title: 'Линзы', path: '/lenses', element: SettingsPage },
  { title: 'Данные', path: '/data', element: DataPage }
];

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route
        index
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {routes.map((route) => {
        return (
          <Route
            key={route.title}
            path={route.path}
            element={
              <ProtectedRoute>
                <route.element />
              </ProtectedRoute>
            }
          />
        );
      })}
    </Route>
  )
);
