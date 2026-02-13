import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, MapPin, Users, Shield, ArrowRight, Star } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen.jsx';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const features = [
    {
      icon: MapPin,
      title: 'Localisation précise',
      description: 'Trouvez des logements près de votre campus universitaire',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Shield,
      title: 'Annonces vérifiées',
      description: 'Tous les logements sont vérifiés pour votre sécurité',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Users,
      title: 'Communauté étudiante',
      description: 'Échangez avec d\'autres étudiants et trouvez des colocataires',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Star,
      title: 'Avis authentiques',
      description: 'Consultez les avis d\'autres étudiants avant de décider',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const stats = [
    { value: '500+', label: 'Logements disponibles' },
    { value: '2000+', label: 'Étudiants inscrits' },
    { value: '15+', label: 'Universités partenaires' },
  ];

  return (
    <>
      {isLoading && (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      )}
      
      <div className={`min-h-screen bg-white transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#09392D] via-[#0d4d3a] to-[#389038] text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC80D] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#94D358] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#FFC80D] rounded-2xl flex items-center justify-center">
                <HomeIcon size={32} className="text-[#09392D]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">UniLogi</h1>
            </div>

            {/* Tagline */}
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Trouve ton logement idéal<br />
              <span className="text-[#FFC80D]">près de ton campus</span>
            </h2>

            <p className="text-lg lg:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              La plateforme dédiée aux étudiants pour trouver, comparer et réserver des logements à proximité de leur université au Cameroun.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/login')}
              className="group bg-[#FFC80D] text-[#09392D] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e6b40b] transition shadow-2xl inline-flex items-center gap-3"
            >
              Commencer maintenant
              <ArrowRight size={24} className="group-hover:translate-x-1 transition" />
            </button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold text-[#FFC80D] mb-2">{stat.value}</p>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-[#09392D] mb-4">
            Pourquoi choisir UniLogi ?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une solution complète pour faciliter votre recherche de logement étudiant
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition group"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-[#09392D] mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works Section */}
      <div className="bg-gradient-to-br from-gray-50 to-green-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-[#09392D] mb-4">
              Comment ça marche ?
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#09392D] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h4 className="text-xl font-bold text-[#09392D] mb-3">
                Créez votre compte
              </h4>
              <p className="text-gray-600">
                Inscrivez-vous gratuitement en quelques secondes
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#389038] text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h4 className="text-xl font-bold text-[#09392D] mb-3">
                Cherchez votre logement
              </h4>
              <p className="text-gray-600">
                Filtrez par campus, prix, type de logement et plus encore
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC80D] text-[#09392D] rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h4 className="text-xl font-bold text-[#09392D] mb-3">
                Contactez le propriétaire
              </h4>
              <p className="text-gray-600">
                Visitez et réservez votre futur logement en toute sécurité
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-[#09392D] to-[#389038] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Prêt à trouver votre logement idéal ?
          </h3>
          <p className="text-lg text-gray-200 mb-8">
            Rejoignez des milliers d'étudiants qui ont déjà trouvé leur chez-eux grâce à UniLogi
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#FFC80D] text-[#09392D] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e6b40b] transition shadow-2xl inline-flex items-center gap-3"
          >
            Commencer gratuitement
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#09392D] text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 UniLogi. Tous droits réservés. | Fait avec ❤️ pour les étudiants camerounais
          </p>
        </div>
      </div>
      </div>
    </>
  );
};

export default Landing;
