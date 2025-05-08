import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!user) {
    toast.error('Вы не авторизованы. Пожалуйста, войдите в систему.', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      theme: 'dark',
    });
    return <Navigate to="/" replace />;
  }

  return children;
};
