import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apartments as staticApartments } from '../data';
import { Phone, MapPin, CheckCircle, MessageCircle, Share2, Heart, Home, Bed, Maximize } from 'lucide-react';
import LandlordChat from '../components/LandlordChat.jsx';

// Cherche un appartement dans data.js ET dans le localStorage
const findApartment = (id) => {
  // 1. Chercher dans les données statiques (IDs numériques 1-8)
  const staticMatch = staticApartments.find(
    (item) => String(item.id) === String(id)
  );
  if (staticMatch) return staticMatch;

  // 2. Chercher dans les annonces postées (localStorage)
  try {
    const local = JSON.parse(localStorage.getItem('unilogi_apartments') || '[]');
    const localMatch = local.find((item) => String(item.id) === String(id));
    if (localMatch) return localMatch;
  } catch { /* ignore */ }

  // 3. Chercher dans "mes annonces"
  try {
    const mine = JSON.parse(localStorage.getItem('unilogi_my_apartments') || '[]');
    return mine.find((item) => String(item.id) === String(id)) || null;
  } catch {
    return null;
  }
};

const ApartmentDetails = () => {
  const { id } = useParams();
  const [showChat, setShowChat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const apt = findApartment(id);

  if (!apt) {
    return (
      <div className="p-10 text-center">
        <div className="text-6xl mb-4">😅</div>
        <p className="text-xl font-bold text-gray-600 mb-2">Appartement non trouvé</p>
        <p className="text-sm text-gray-400">Ce logement n'existe plus ou l'ID est incorrect.</p>
      </div>
    );
  }

  const listingWithOwner = {
    ...apt,
    ownerName: apt.ownerName || apt.author_name || 'Propriétaire',
    ownerEmail: apt.ownerEmail || 'owner@example.com',
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: apt.title, text: `Découvrez cet appartement: ${apt.title}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  return (
    <div className="pb-36">
      {/* Image principale */}
      <div className="relative">
        <img
          src={apt.image || apt.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
          alt={apt.title}
          className="w-full h-80 object-cover"
        />

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-full backdrop-blur-md shadow-lg transition ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'
            }`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white"
          >
            <Share2 size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-6 bg-white -mt-6 rounded-t-3xl relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#09392D] mb-2">{apt.title}</h1>
            {apt.isCertified && (
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                <CheckCircle size={14} /> Certifié UNILOGIS
              </div>
            )}
            {apt._localOnly && (
              <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold ml-2">
                📱 Annonce locale
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-6">
          <MapPin size={18} className="mr-2 text-[#389038]" />
          <span className="font-medium">{apt.location}</span>
        </div>

        {apt.description && (
          <p className="text-gray-600 leading-relaxed mb-8">{apt.description}</p>
        )}

        {/* Caractéristiques */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gradient-to-br from-[#09392D] to-[#389038] text-white p-4 rounded-2xl text-center">
            <Home size={24} className="mx-auto mb-2" />
            <p className="text-xs opacity-80">Chambres</p>
            <p className="font-bold">{apt.rooms || '—'}</p>
          </div>
          <div className="bg-gradient-to-br from-[#09392D] to-[#389038] text-white p-4 rounded-2xl text-center">
            <Maximize size={24} className="mx-auto mb-2" />
            <p className="text-xs opacity-80">Surface</p>
            <p className="font-bold">{apt.surface ? `${apt.surface} m²` : '—'}</p>
          </div>
          <div className="bg-gradient-to-br from-[#09392D] to-[#389038] text-white p-4 rounded-2xl text-center">
            <Bed size={24} className="mx-auto mb-2" />
            <p className="text-xs opacity-80">Statut</p>
            <p className="font-bold text-xs">{apt.status || 'Disponible'}</p>
          </div>
        </div>

        {/* Commodités */}
        <div className="mb-8">
          <h3 className="font-bold text-lg text-[#09392D] mb-4">Commodités</h3>
          <div className="grid grid-cols-2 gap-3">
            {['WiFi', 'Climatisation', 'Parking', 'Sécurité 24/7', 'Cuisine équipée', 'Eau courante'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-[#389038] rounded-full" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boutons fixes en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-[#FFC80D] shadow-2xl z-50">
        <div className="max-w-[480px] mx-auto px-4 py-5">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 font-medium">Prix mensuel</p>
            <p className="text-3xl font-black text-[#09392D]">
              {Number(apt.price).toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-1">FCFA</span>
            </p>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setShowChat(true)}
              className="flex-1 bg-gradient-to-r from-[#09392D] to-[#389038] text-white px-6 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all text-lg"
              style={{ boxShadow: '0 10px 30px rgba(9, 57, 45, 0.4)' }}
            >
              <MessageCircle size={26} strokeWidth={3} />
              <span>DISCUTER</span>
            </button>

            <a
              href={`tel:${apt.contact || '+237600000000'}`}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all text-lg"
              style={{ boxShadow: '0 10px 30px rgba(255, 107, 0, 0.4)' }}
            >
              <Phone size={26} strokeWidth={3} />
              <span>APPELER</span>
            </a>
          </div>

          <div className="bg-[#FFC80D] rounded-xl p-3 text-center">
            <p className="text-[#09392D] font-bold text-sm">
              👆 Contactez le propriétaire MAINTENANT
            </p>
          </div>
        </div>
      </div>

      {showChat && (
        <LandlordChat listing={listingWithOwner} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default ApartmentDetails;
