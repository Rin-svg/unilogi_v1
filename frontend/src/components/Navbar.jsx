import { Home, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pages qui n'ont pas besoin du logo/titre complet
  const isDetailPage = location.pathname.includes('/apartment/');
  const isProfilePage = location.pathname === '/profile';
  const isCommunityPage = location.pathname === '/community';
  const isAddPage = location.pathname === '/add';
  const isMapPage = location.pathname === '/map';
  const isFavoritesPage = location.pathname === '/favorites';
  const isSchoolsPage = location.pathname === '/schools';
  const isPrivacyPage = location.pathname === '/privacy';
  const isDirectionsPage = location.pathname === '/directions';
  const isHomePage = location.pathname === '/';

  // Titres dynamiques
  const getPageTitle = () => {
    if (isDetailPage) return 'Détails du logement';
    if (isProfilePage) return 'Mon Profil';
    if (isCommunityPage) return 'Communauté';
    if (isAddPage) return 'Ajouter un logement';
    if (isMapPage) return 'Carte Interactive';
    if (isFavoritesPage) return 'Mes Favoris';
    if (isSchoolsPage) return 'Recherche d\'écoles';
    if (isPrivacyPage) return 'Confidentialité';
    if (isDirectionsPage) return 'Itinéraires';
    return '';
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
      {/* Logo ou Bouton Retour */}
      {isHomePage ? (
        <Link to="/">
          <img src="/logo-hackathon.png" alt="Logo" className="h-10 w-auto" />
        </Link>
      ) : (
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#09392D] hover:bg-gray-100 p-2 rounded-lg transition"
        >
          <ArrowLeft size={24} />
          <span className="text-sm font-semibold">{getPageTitle()}</span>
        </button>
      )}
      
      {/* Icônes à droite */}
      <div className="flex gap-4 items-center">
        {!isProfilePage && !isAddPage && (
          <>
            <Link to="/community" className="text-gray-600 hover:text-[#09392D] transition">
              <MessageCircle size={24} />
            </Link>
            <Link to="/profile" className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition">
              <User className="text-orange-500 w-5 h-5" />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;