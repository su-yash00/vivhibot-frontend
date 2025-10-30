import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ExternalLink } from 'lucide-react';
import './App.css';
import axios from 'axios';
import logo from './assets/logo.png';
import backgroundGradient from './assets/background-gradient.png';
import botAvatar from './assets/bot-avatar.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName] = useState('User'); // You can make this dynamic
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:8000';

  const exampleQuestions = [
    "Which law protects the fundamental rights of citizens?",
    "राज्यका मुख्य कर्तव्यहरू के हुन्?",
    "नागरिकहरूका मौलिक अधिकारहरू कुन कानूनले सुरक्षा गर्दछ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (queryText = null) => {
    const query = queryText || inputValue.trim();
    if (!query) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/query`, {
        query: query,
        n_results: 5
      });

      console.log("Bot response:", response.data); // debug log

      // Add bot response
      const botMessage = {
        type: 'bot',
        content: response.data.answer || "क्षमा गर्नुहोस्, उत्तर उपलब्ध छैन।",
        sources: response.data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: 'क्षमा गर्नुहोस्, केही गलत भयो। कृपया फेरि प्रयास गर्नुहोस्।',
        error: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <img src={logo} alt="VIDHIBOT Logo" className="logo-image" />
          </div>
        </div>
        <div className="header-right">
          <button className="clear-chat-btn" onClick={clearChat}>
            Clear Chat
          </button>
          <div className="divider"></div>
          <div className="user-profile">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <span className="user-name">{userName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        <div className="chat-container">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="welcome-screen">
              <h1 className="welcome-title">Welcome back, {userName}</h1>
              <p className="welcome-subtitle">
                AI-powered search across thousands of Nepali legal documents. Get instant answers with verified sources.
              </p>
              <div className="search-box-large">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="नेपालका कानूनी दस्तावेजहरू खोज्नुहोस् |"
                  className="search-input-large"
                />
                <button
                  className="send-button-large"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                >
                  <Send size={20} />
                </button>
              </div>

              <div className="example-questions">
                {exampleQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="example-question-btn"
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="messages-container">
              {messages.map((message, idx) => (
                <div key={idx} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'user' ? (
                      <User size={20} />
                    ) : (
                      <img src={botAvatar} alt="Bot Avatar" className="avatar-image" />
                    )}
                  </div>
                  <div className="message-content">
                    {message.type === 'user' ? (
                      <p className="message-text">{message.content}</p>
                    ) : (
                      <>
                        <div className="bot-response">
                          <p className="message-text">{message.content}</p>
                        </div>

                        {message.sources && message.sources.length > 0 ? (
                          <div className="sources-section">
                            <p className="sources-label">स्रोतहरू:</p>
                            <div className="sources-list">
                              {message.sources.map((source, sIdx) => (
                                <div key={sIdx} className="source-card">
                                  <div className="source-header">
                                    <span className="source-number">Source {sIdx + 1}</span>
                                    {source.citation && (
                                      <button className="view-source-btn">
                                        <ExternalLink size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <div className="source-details">
                                    <p className="source-filename">{source.filename}</p>
                                    {source.section_type && source.section_number && (
                                      <p className="source-section">
                                        📑 {source.section_type.charAt(0).toUpperCase() + source.section_type.slice(1)} {source.section_number}
                                      </p>
                                    )}
                                    {source.page_numbers && source.page_numbers.length > 0 && (
                                      <p className="source-pages">
                                        📄 Pages: {source.page_numbers.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="no-sources-text">No sources available</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message bot">
                  <div className="message-avatar">
                    <MessageSquare size={20} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (shown when there are messages) */}
        {messages.length > 0 && (
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your legal question here......"
                className="chat-input"
                disabled={loading}
              />
              <button
                className="send-button"
                onClick={() => handleSend()}
                disabled={loading || !inputValue.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
