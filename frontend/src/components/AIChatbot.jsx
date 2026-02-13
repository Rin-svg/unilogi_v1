import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

// Réponses intelligentes locales (sans backend)
const getLocalResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('prix') || msg.includes('combien') || msg.includes('coût') || msg.includes('loyer')) {
    return 'Les prix autour des campus camerounais varient généralement entre **25 000 FCFA** pour une chambre simple et **80 000 FCFA** pour un appartement 2 pièces meublé. Les studios à Ngoa-Ekellé ou SOA se trouvent autour de 40 000–55 000 FCFA/mois. 🏠';
  }
  if (msg.includes('ngoa') || msg.includes('soa') || msg.includes('ekele')) {
    return 'Le quartier Ngoa-Ekellé est directement adjacent à l\'Université de Yaoundé I, très prisé des étudiants. SOA abrite les campus FASA et ENSP. Les deux zones ont une offre locative dense avec des prix compétitifs entre 30 000 et 65 000 FCFA. 🎓';
  }
  if (msg.includes('keyce') || msg.includes('douala') || msg.includes('bonamoussadi')) {
    return 'KEYCE Academy se situe à Bonamoussadi, Douala. C\'est un quartier résidentiel avec de nombreux studios disponibles entre 45 000 et 60 000 FCFA/mois. Résidences sécurisées avec Wi-Fi fibre optique disponibles. 📡';
  }
  if (msg.includes('buea') || msg.includes('molyko') || msg.includes('ub')) {
    return 'L\'Université de Buea se trouve à Molyko. Le quartier offre des logements entre 35 000 et 65 000 FCFA/mois. Idéal pour les étudiants anglophones avec une ambiance campus animée. 🌿';
  }
  if (msg.includes('visit') || msg.includes('conseil')) {
    return '🔍 **Conseils pour visiter un logement :**\n• Vérifiez l\'état de la plomberie et du réseau électrique\n• Demandez si l\'eau et l\'électricité sont incluses dans le loyer\n• Confirmez la présence d\'un groupe électrogène\n• Évaluez la distance exacte du campus\n• Rencontrez les voisins pour évaluer la sécurité';
  }
  if (msg.includes('droit') || msg.includes('locataire') || msg.includes('bail') || msg.includes('contrat')) {
    return '📋 **Vos droits en tant que locataire :**\n• Exigez un contrat de bail écrit\n• Le bailleur ne peut pas augmenter le loyer sans préavis\n• Vous avez droit à un logement en bon état\n• Conservez toujours les reçus de paiement\n• En cas de litige, contactez le service de l\'habitat de votre commune';
  }
  if (msg.includes('trouver') || msg.includes('chercher') || msg.includes('comment')) {
    return '🏠 **Comment trouver un logement sur UniLogi :**\n1. Parcourez les annonces sur la page d\'accueil\n2. Filtrez par campus ou quartier\n3. Consultez les détails de chaque logement\n4. Cliquez "Appeler" pour contacter directement le propriétaire\n5. Visitez le logement avant de signer quoi que ce soit';
  }
  if (msg.includes('coloc') || msg.includes('colocation') || msg.includes('partager')) {
    return '👥 La colocation est très populaire autour des campus ! Avantages :\n• Loyer partagé (économies de 30-50%)\n• Compagnie et sécurité\n• Partage des charges (eau, électricité, internet)\nConsultez nos annonces de colocation à Melen, SOA et Bonamoussadi !';
  }
  if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('bonsoir')) {
    return 'Bonjour ! 😊 Je suis l\'assistant UniLogi. Je peux vous aider à trouver un logement près de votre campus au Cameroun, vous donner des conseils sur les prix, les quartiers et vos droits. Quelle est votre question ?';
  }
  if (msg.includes('merci') || msg.includes('thanks')) {
    return 'Avec plaisir ! 🙏 N\'hésitez pas si vous avez d\'autres questions. Bonne recherche de logement ! 🏠✨';
  }
  return '🤔 Je ne suis pas sûr de comprendre votre question. Voici ce sur quoi je peux vous aider :\n• **Prix** des logements par campus\n• **Quartiers** (Ngoa-Ekellé, SOA, Molyko, Bonamoussadi...)\n• **Conseils** pour visiter un logement\n• **Droits** du locataire\n• **Colocation**\n\nPosez votre question !';
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! 👋 Je suis votre assistant UniLogi. Comment puis-je vous aider aujourd\'hui ?', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    "Comment trouver un logement ?",
    "Quels sont les prix moyens ?",
    "Conseils pour visiter un logement",
    "Mes droits en tant que locataire",
  ];

  const sendMessage = async (msg) => {
    const text = (msg || inputMessage).trim();
    if (!text || isLoading) return;
    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    // Simule un délai de réponse naturel
    setTimeout(() => {
      const response = getLocalResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setIsLoading(false);
    }, 700);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Formater le texte avec du markdown simple (bold)
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 bg-gradient-to-r from-[#09392D] to-[#389038] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50"
          style={{ animation: 'bounceSlow 2s ease-in-out infinite' }}>
          <MessageCircle size={26} />
          <style>{`@keyframes bounceSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[340px] h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#09392D] to-[#389038] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FFC80D] rounded-full flex items-center justify-center">
                <Bot size={20} className="text-[#09392D]" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant UniLogi</h3>
                <p className="text-xs text-green-300">● En ligne</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-[#09392D]' : 'bg-[#FFC80D]'}`}>
                  {message.role === 'user' ? <User size={15} className="text-white" /> : <Bot size={15} className="text-[#09392D]" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${message.role === 'user' ? 'bg-[#09392D] text-white' : 'bg-white border border-gray-200'}`}>
                  <div className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
                    {formatMessage(message.content)}
                  </div>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-[#FFC80D] rounded-full flex items-center justify-center">
                  <Bot size={15} className="text-[#09392D]" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-3">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 mb-2">Questions fréquentes :</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="text-xs bg-gray-100 hover:bg-[#FFC80D] hover:text-[#09392D] px-2.5 py-1.5 rounded-full transition font-medium">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress} placeholder="Posez votre question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#389038]"
                disabled={isLoading} />
              <button onClick={() => sendMessage()} disabled={!inputMessage.trim() || isLoading}
                className="bg-[#09392D] text-white p-2 rounded-full hover:bg-[#389038] transition disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
