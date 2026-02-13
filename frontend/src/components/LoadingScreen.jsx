import { useState, useEffect } from 'react';
import { Home as HomeIcon } from 'lucide-react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simule le chargement progressif
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Commence le fade out après un court délai
      setTimeout(() => {
        setFadeOut(true);
        // Notifie le parent que le chargement est terminé
        setTimeout(() => {
          onLoadingComplete();
        }, 500);
      }, 300);
    }
  }, [progress, onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-[#09392D] via-[#0d4d3a] to-[#389038] z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC80D] opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#94D358] opacity-10 rounded-full blur-3xl animate-pulse"></div>

      <div className="text-center">
        {/* Logo animé */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#FFC80D] opacity-20 rounded-3xl blur-xl animate-pulse"></div>
          <div className="relative w-24 h-24 bg-[#FFC80D] rounded-3xl flex items-center justify-center mx-auto animate-bounce-slow shadow-2xl">
            <HomeIcon size={48} className="text-[#09392D]" />
          </div>
        </div>

        {/* Nom de l'application */}
        <h1 className="text-5xl font-bold text-white mb-2 animate-fade-in">
          Uni<span className="text-[#FFC80D]">Logi</span>
        </h1>
        <p className="text-gray-300 text-lg mb-8 animate-fade-in-delay">
          Ton logement étudiant au Cameroun
        </p>

        {/* Barre de progression */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFC80D] to-[#94D358] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white text-sm mt-3 font-medium">{progress}%</p>
        </div>

        {/* Points de chargement animés */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-[#FFC80D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#FFC80D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#FFC80D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 1s ease-out 0.2s backwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
