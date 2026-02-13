import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Erreur lors de la vérification');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erreur de connexion au serveur');
        console.error('Erreur:', error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09392D] to-[#389038] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader size={40} className="text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#09392D] mb-4">
              Vérification en cours...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#09392D] mb-4">
              Email vérifié ! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Vous allez être redirigé vers la page de connexion dans quelques secondes...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#09392D] mb-4">
              Échec de la vérification
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                Le lien de vérification a peut-être expiré ou est invalide.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#09392D] text-white py-3 rounded-xl font-bold hover:bg-[#0d4d3a] transition"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
