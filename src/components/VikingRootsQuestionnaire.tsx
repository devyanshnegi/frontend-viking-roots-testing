import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/questionaire';

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#fff'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#111'
          }}>
            Viking Roots
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {!hasStarted ? (
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
          }}>
            <p style={{ 
              fontSize: '16px',
              color: '#666',
              margin: 0,
              textAlign: 'center'
            }}>
              Discover and preserve your family's heritage
            </p>
            <button 
              onClick={startInterview}
              disabled={isLoading}
              style={{
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '500',
                backgroundColor: '#111',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {isLoading ? 'Starting...' : 'Begin'}
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#111' : '#f5f5f5',
                    color: msg.role === 'user' ? '#fff' : '#111',
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontSize: '15px'
                  }}>
                    ...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div style={{ 
              padding: '20px 0',
              borderTop: '1px solid #e5e5e5',
              backgroundColor: '#fff'
            }}>
              <form onSubmit={sendMessage} style={{ 
                display: 'flex', 
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e5e5e5',
                    outline: 'none',
                    backgroundColor: '#fff'
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '500',
                    backgroundColor: '#111',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isLoading || !inputMessage.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !inputMessage.trim()) ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VikingRootsQuestionnaire;