import { Mail, Phone, MapPin, Edit2, LogOut, Heart, Home, Settings, Shield, Navigation, School } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  
  // Récupérer les infos utilisateur du localStorage
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [user, setUser] = useState({
    name: storedUser.name || 'Knisley Ngaha',
    email: storedUser.email || 'knisley@example.com',
    phone: '+237 6XX XXX XXX',
    location: 'Yaoundé, Cameroun',
    bio: 'Étudiant en informatique | Cherche un logement confortable',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedUser.name || 'User'}`,
    joinDate: 'Janvier 2024',
    verified: storedUser.emailVerified || true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setUser(editData);
    }
  };

  const handleLogout = () => {
    // Confirmation avant déconnexion
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Supprimer les données du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion
      navigate('/login');
    }
  };

  const stats = [
    { label: 'Favoris', value: 12, icon: Heart },
    { label: 'Visites', value: 48, icon: Home },
    { label: 'Avis', value: 5, icon: Shield },
  ];

  return (
    <div className="pb-24 bg-gray-50">
      {/* Couverture */}
      <div className="h-32 bg-gradient-to-r from-[#09392D] to-[#389038] relative">
        <div className="absolute -bottom-16 left-6 flex items-end gap-4">
          <img 
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Infos principales */}
      <div className="px-6 pt-20 pb-6 bg-white border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#09392D] flex items-center gap-2">
              {user.name}
              {user.verified && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">✓ Vérifié</span>
              )}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Membre depuis {user.joinDate}</p>
          </div>
          <button
            onClick={handleEdit}
            className="bg-[#FFC80D] text-[#09392D] p-2.5 rounded-full shadow-md hover:bg-[#e6b40b] transition flex items-center gap-1"
          >
            <Edit2 size={18} />
          </button>
        </div>

        {/* Détails de contact */}
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-[#389038]" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-[#389038]" />
              <span className="text-gray-700">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-[#389038]" />
              <span className="text-gray-700">{user.location}</span>
            </div>
            <p className="text-sm text-gray-600 italic mt-4">"{user.bio}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFC80D]"
              placeholder="Nom"
            />
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFC80D]"
              placeholder="Email"
            />
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFC80D]"
              placeholder="Téléphone"
            />
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFC80D]"
              placeholder="Localisation"
            />
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFC80D]"
              placeholder="Bio"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex-1 bg-[#09392D] text-white py-2 rounded-lg font-bold hover:bg-[#0d4d3a] transition"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <Icon size={24} className="text-[#389038] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#09392D]">{stat.value}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Menu Settings */}
      <div className="bg-white divide-y divide-gray-100">
        <button 
          onClick={() => navigate('/favorites')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-[#389038]" />
            <span className="font-medium text-gray-700">Mes Favoris</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>
        
        <button 
          onClick={() => navigate('/add')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <Home size={20} className="text-[#389038]" />
            <span className="font-medium text-gray-700">Mes Annonces</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button 
          onClick={() => navigate('/schools')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <School size={20} className="text-[#389038]" />
            <span className="font-medium text-gray-700">Recherche d'écoles</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button 
          onClick={() => navigate('/directions')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <Navigation size={20} className="text-[#389038]" />
            <span className="font-medium text-gray-700">Itinéraires</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button 
          onClick={() => navigate('/privacy')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-[#389038]" />
            <span className="font-medium text-gray-700">Confidentialité & Sécurité</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-red-500" />
            <span className="font-medium text-red-500">Déconnexion</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
