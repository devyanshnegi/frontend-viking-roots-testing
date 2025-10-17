import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/questionaire';
// const API_BASE_URL = "https://backend-viking-roots-testing-production.up.railway.app/api/questionaire";

const VikingRootsQuestionnaire = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/start/`);
      
      setMessages([{
        role: 'model',
        content: response.data.message,
        timestamp: new Date()
      }]);
      setHasStarted(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/message/`, {
        message: inputMessage,
        chat_history: newMessages
      });

      const aiMessage: Message = {
        role: 'model',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#8B4513' }}>
        Viking Roots - Heritage Interview
      </h1>

      {!hasStarted ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            Begin your journey to discover and preserve your family's saga
          </p>
          <button 
            onClick={startInterview}
            disabled={isLoading}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: '#8B4513',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Starting...' : 'Begin Your Saga'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            border: '2px solid #8B4513',
            borderRadius: '10px',
            padding: '20px',
            height: '500px',
            overflowY: 'auto',
            marginBottom: '20px',
            backgroundColor: '#fafaf8'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '15px',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff3e0',
                  marginLeft: msg.role === 'user' ? '20%' : '0',
                  marginRight: msg.role === 'user' ? '0' : '20%'
                }}
              >
                <strong style={{ color: msg.role === 'user' ? '#1976d2' : '#8B4513' }}>
                  {msg.role === 'user' ? 'You' : 'Digital Skald'}
                </strong>
                <p style={{ margin: '8px 0 0 0', lineHeight: '1.5' }}>
                  {msg.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div style={{ 
                textAlign: 'center', 
                color: '#8B4513',
                fontStyle: 'italic',
                padding: '20px'
              }}>
                The Skald is weaving your tale...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share your story..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #8B4513',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                backgroundColor: '#8B4513',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (isLoading || !inputMessage.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !inputMessage.trim()) ? 0.6 : 1
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VikingRootsQuestionnaire;