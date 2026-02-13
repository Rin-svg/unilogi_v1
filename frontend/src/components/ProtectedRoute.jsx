import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Si pas de token ou pas d'utilisateur, rediriger vers la page de connexion
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ⚠️ VERSION TEST: Vérification d'email désactivée
  // const userData = JSON.parse(user);
  // if (!userData.emailVerified) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
};

export default ProtectedRoute;
