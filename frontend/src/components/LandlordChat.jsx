import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User } from 'lucide-react';

const LandlordChat = ({ listing, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [listing.id]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/messages/${listing.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: listing.id,
          message: newMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      } else {
        alert(data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-[#09392D] to-[#389038] text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFC80D] rounded-full flex items-center justify-center">
              <User size={24} className="text-[#09392D]" />
            </div>
            <div>
              <h3 className="font-bold">{listing.ownerName || 'Propriétaire'}</h3>
              <p className="text-sm text-gray-200">{listing.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucun message pour le moment</p>
              <p className="text-sm mt-2">Commencez la conversation avec le propriétaire</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCurrentUser 
                      ? 'bg-[#09392D]' 
                      : 'bg-[#FFC80D]'
                  }`}>
                    <User size={20} className={isCurrentUser ? 'text-white' : 'text-[#09392D]'} />
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <div className={`${
                      isCurrentUser 
                        ? 'bg-[#09392D] text-white ml-auto' 
                        : 'bg-white border border-gray-200'
                    } rounded-2xl p-4 shadow-sm max-w-[80%] ${isCurrentUser ? 'ml-auto' : ''}`}>
                      <p className="text-sm font-medium mb-1">
                        {isCurrentUser ? 'Vous' : message.senderName}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className={`text-xs mt-2 ${
                        isCurrentUser ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {new Date(message.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#FFC80D] rounded-full flex items-center justify-center">
                <User size={20} className="text-[#09392D]" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#389038] resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-[#09392D] text-white px-6 rounded-2xl hover:bg-[#389038] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={20} />
              <span className="font-medium">Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordChat;
