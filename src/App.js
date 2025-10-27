// import React, {useState} from "react";
// import {Search, FileText, Loader2, AlertCircle, CheckCircle} from "lucide-react";
// import "./App.css";
// import axios from "axios";

// function App() {
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState(null);
//   const [error, setError] = useState(null);

//   const API_URL = "http://localhost:8000";

//   const exampleQueries = ["What are the main telecommunications laws?", "सञ्चार सम्बन्धी मुख्य कानूनहरू के हुन्?", "Explain media regulations in Nepal", "What are property rights provisions?"];

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     if (!query.trim()) return;

//     setLoading(true);
//     setError(null);
//     setResponse(null);

//     try {
//       const res = await axios.post(`${API_URL}/query`, {
//         query: query,
//         n_results: 5,
//       });

//       setResponse(res.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || "Search failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <div className="container">
//         {/* Header */}
//         <header className="header">
//           <div className="header-icon">
//             <FileText size={48} />
//           </div>
//           <h1>Nepali Legal RAG System</h1>
//           <p>AI-powered legal document search for Nepal</p>
//         </header>

//         {/* Search Box */}
//         <div className="search-box">
//           <form onSubmit={handleSearch}>
//             <div className="search-input-wrapper">
//               <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask a legal question... (English or नेपाली)" className="search-input" disabled={loading} />
//               <button type="submit" className="search-button" disabled={loading || !query.trim()}>
//                 {loading ? (
//                   <>
//                     <Loader2 className="spin" size={20} />
//                     Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Search size={20} />
//                     Search
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           {/* Example Queries */}
//           <div className="examples">
//             <p className="examples-label">Try these examples:</p>
//             <div className="example-buttons">
//               {exampleQueries.map((example, idx) => (
//                 <button key={idx} onClick={() => setQuery(example)} className="example-button">
//                   {example}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="error-box">
//             <AlertCircle size={24} />
//             <div>
//               <h3>Error</h3>
//               <p>{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Results Display */}
//         {response && (
//           <div className="results">
//             {/* Answer Section */}
//             <div className="answer-box">
//               <div className="answer-header">
//                 <CheckCircle size={24} color="#10b981" />
//                 <h2>Answer</h2>
//               </div>
//               <div className="answer-text">{response.answer}</div>
//             </div>

//             {/* Sources Section */}
//             {/* <div className="sources-box">
//               <div className="sources-header">
//                 <FileText size={24} color="#6366f1" />
//                 <h3>Sources ({response.sources.length})</h3>
//               </div>
//               <div className="sources-list">
//                 {response.sources.map((source, idx) => (
//                   <div key={idx} className="source-item">
//                     <div className="source-content">
//                       <div className="source-badge">
//                         Source {idx + 1}
//                       </div>
//                       <div className="source-details">
//                         <div className="source-filename">
//                           {source.filename}
//                         </div>
//                         <div className="source-meta">
//                           <span>Volume: {source.volume}</span>
//                           <span>•</span>
//                           <span>Relevance: {(source.relevance * 100).toFixed(0)}%</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="relevance-bar">
//                       <div 
//                         className="relevance-fill"
//                         style={{ width: `${source.relevance * 100}%` }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div> */}

//             {/* Sources Section - UPDATED */}
//             <div className="sources-box">
//               <div className="sources-header">
//                 <FileText size={24} color="#6366f1" />
//                 <h3>Sources & Citations ({response.sources.length})</h3>
//               </div>
//               <div className="sources-list">
//                 {response.sources.map((source, idx) => (
//                   <div key={idx} className="source-item">
//                     <div className="source-content">
//                       <div className="source-badge">Source {idx + 1}</div>
//                       <div className="source-details">
//                         <div className="source-filename">{source.filename}</div>

//                         {/* Display section info */}
//                         {source.section_type && source.section_number && (
//                           <div className="source-section">
//                             📑 {source.section_type.replace("_nepali", "").charAt(0).toUpperCase() + source.section_type.replace("_nepali", "").slice(1)} {source.section_number}
//                           </div>
//                         )}

//                         {/* Display page numbers */}
//                         {source.page_numbers && source.page_numbers.length > 0 && (
//                           <div className="source-pages">
//                             📄 Page{source.page_numbers.length > 1 ? "s" : ""}: {source.page_numbers.join(", ")}
//                           </div>
//                         )}

//                         {/* Display full citation */}
//                         {source.citation && <div className="source-citation">📖 {source.citation}</div>}

//                         <div className="source-meta">
//                           <span>Volume: {source.volume}</span>
//                           <span>•</span>
//                           <span>Relevance: {(source.relevance * 100).toFixed(0)}%</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="relevance-bar">
//                       <div className="relevance-fill" style={{width: `${source.relevance * 100}%`}} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <footer className="footer">
//           <p>Powered by OpenAI GPT-4 & ChromaDB</p>
//           <p>Legal documents from Nepal Law Commission</p>
//         </footer>
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ExternalLink } from 'lucide-react';
import './App.css';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName] = useState('Suyash'); // You can make this dynamic
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
      
      // Add bot response
      const botMessage = {
        type: 'bot',
        content: response.data.answer,
        sources: response.data.sources,
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            <MessageSquare size={24} />
            <span className="logo-text">VIDHIBOT</span>
          </div>
        </div>
        <div className="header-right">
          <button className="clear-chat-btn" onClick={clearChat}>
            Clear Chat
          </button>
          <div className="user-profile">
            <User size={18} />
            <span>{userName}</span>
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
                  onKeyPress={handleKeyPress}
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
                      <MessageSquare size={20} />
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
                        
                        {message.sources && message.sources.length > 0 && (
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
                onKeyPress={handleKeyPress}
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