import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apartments } from '../data';
import { Phone, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import LandlordChat from '../components/LandlordChat.jsx';

const ApartmentDetails = () => {
  const { id } = useParams();
  const [showChat, setShowChat] = useState(false);
  
  const apt = apartments.find(item => item.id === parseInt(id));

  if (!apt) return <div className="p-10 text-center">Appartement non trouvé 😅</div>;

  // Enrichir l'appartement avec les données nécessaires pour le chat
  const listingWithOwner = {
    ...apt,
    ownerName: apt.ownerName || 'Propriétaire',
    ownerEmail: apt.ownerEmail || 'owner@example.com',
  };

  return (
    <div className="pb-24">
      <img src={apt.image} alt={apt.title} className="w-full h-72 object-cover" />
      
      <div className="p-6 bg-white -mt-6 rounded-t-3xl relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-900">{apt.title}</h1>
          {apt.isCertified && <CheckCircle className="text-green-500" />}
        </div>

        <div className="flex items-center text-gray-500 mb-6">
          <MapPin size={18} className="mr-2" /> {apt.location}
        </div>

        <p className="text-gray-600 leading-relaxed mb-8">
          {apt.description}
        </p>

        {/* 📱 Boutons fixes en bas pour contacter */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-[480px] mx-auto">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-400 font-medium">Prix mensuel</p>
              <p className="text-xl font-bold text-blue-600">{apt.price.toLocaleString()} FCFA</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChat(true)}
                className="bg-[#09392D] text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-[#389038] transition"
              >
                <MessageCircle size={20} /> Discuter
              </button>
              <a 
                href={`tel:${apt.contact}`} 
                className="bg-orange-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-200"
              >
                <Phone size={20} /> Appeler
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de chat avec le bailleur */}
      {showChat && (
        <LandlordChat 
          listing={listingWithOwner} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
};

export default ApartmentDetails;