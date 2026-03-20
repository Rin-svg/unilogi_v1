import { Home, MessageSquare, PlusSquare, User, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  
  // Fonction pour vérifier si l'onglet est actif
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[480px] mx-auto">
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 px-6 py-3 flex justify-between items-center rounded-t-[32px] shadow-[0_-10px_25px_rgba(0,0,0,0.08)]">
        
        {/* Accueil */}
        <Link 
          to="/home" 
          className={`flex flex-col items-center gap-1 transition-all ${isActive('/home') ? 'scale-110' : 'scale-100'}`}
        >
          <Home 
            size={24} 
            color={isActive('/home') ? '#09392D' : '#9CA3AF'} 
            fill={isActive('/home') ? '#94D358' : 'none'} 
          />
          <span className={`text-[10px] font-bold ${isActive('/home') ? 'text-[#09392D]' : 'text-gray-400'}`}>
            Accueil
          </span>
        </Link>

        {/* Carte / Campus */}
        <Link 
          to="/map" 
          className={`flex flex-col items-center gap-1 transition-all ${isActive('/map') ? 'scale-110' : 'scale-100'}`}
        >
          <Map 
            size={24} 
            color={isActive('/map') ? '#09392D' : '#9CA3AF'} 
            fill={isActive('/map') ? '#94D358' : 'none'}
          />
          <span className={`text-[10px] font-bold ${isActive('/map') ? 'text-[#09392D]' : 'text-gray-400'}`}>
            Campus
          </span>
        </Link>

        {/* Bouton Central : Ajouter un appart (en Jaune FFC80D) */}
        <Link 
          to="/add" 
          className={`bg-[#FFC80D] p-3 rounded-2xl shadow-lg -mt-8 border-4 border-white transform active:scale-90 transition-transform ${isActive('/add') ? 'scale-100' : 'hover:scale-105'}`}
        >
          <PlusSquare size={28} className="text-[#09392D]" />
        </Link>

        {/* Communauté / Messages */}
        <Link 
          to="/community" 
          className={`flex flex-col items-center gap-1 transition-all ${isActive('/community') ? 'scale-110' : 'scale-100'}`}
        >
          <MessageSquare 
            size={24} 
            color={isActive('/community') ? '#09392D' : '#9CA3AF'}
            fill={isActive('/community') ? '#94D358' : 'none'}
          />
          <span className={`text-[10px] font-bold ${isActive('/community') ? 'text-[#09392D]' : 'text-gray-400'}`}>
            Communauté
          </span>
        </Link>

        {/* Profil */}
        <Link 
          to="/profile" 
          className={`flex flex-col items-center gap-1 transition-all ${isActive('/profile') ? 'scale-110' : 'scale-100'}`}
        >
          <User 
            size={24} 
            color={isActive('/profile') ? '#09392D' : '#9CA3AF'}
            fill={isActive('/profile') ? '#94D358' : 'none'}
          />
          <span className={`text-[10px] font-bold ${isActive('/profile') ? 'text-[#09392D]' : 'text-gray-400'}`}>
            Profil
          </span>
        </Link>
        
      </div>
    </div>
  );
};

export default BottomNav;