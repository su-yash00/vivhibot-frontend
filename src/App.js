import React, {useState, useRef, useEffect} from "react";
import {Send, User, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Sparkles} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName] = useState("Suyash");
  const messagesEndRef = useRef(null);
console.log("messages",messages);

  const API_URL = "http://localhost:8000";

  const exampleQuestions = ["Which law protects the fundamental rights of citizens?", "राज्यका मुख्य कर्तव्यहरू के हुन्?", "नागरिकहरूका मौलिक अधिकारहरू कुन कानूनले सुरक्षा गर्दछ?"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText = null) => {
    const query = queryText || inputValue.trim();

    if (!query) return;

    const userMessage = {
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          n_results_per_query: 3,
          use_reformulation: true,
          include_summary: true,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      // Detect if response indicates no relevant information found
      const noInfoPatterns = [
        "do not contain any information",
        "don't contain any information",
        "does not contain information",
        "doesn't contain information",
        "no information",
        "unable to provide",
        "cannot find",
        "not mentioned in the provided documents",
        "couldn't find any relevant information",
        "not explicitly mentioned"
      ];

      const isNoInfoResponse = noInfoPatterns.some((pattern) => data.answer.toLowerCase().includes(pattern.toLowerCase()));

      // If no sources or detected as no-info response, mark as out of context
      const isOutOfContext = data.out_of_context || data.total_sources === 0 || (isNoInfoResponse && data.total_sources < 3);

      const botMessage = {
        type: "bot",
        content: isOutOfContext
          ? "I couldn't find relevant information in the Nepali legal documents database for your query. Please ask questions about Nepali laws, acts, regulations, or legal procedures."
          : data.answer,
        summary: isOutOfContext ? null : data.summary,
        queryVariations: data.query_variations,
        sources: isOutOfContext ? [] : data.sources,
        totalSources: isOutOfContext ? 0 : data.total_sources,
        outOfContext: isOutOfContext,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        type: "bot",
        content: "क्षमा गर्नुहोस्, केही गलत भयो। कृपया फेरि प्रयास गर्नुहोस्।",
        error: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <MessageSquare size={24} color="#2c7a7b" />
            <span style={styles.logoText}>VIDHIBOT</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.clearBtn} onClick={clearChat}>
            Clear Chat
          </button>
          <div style={styles.userProfile}>
            <User size={18} />
            <span>{userName}</span>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.chatContainer}>
          {messages.length === 0 && (
            <div style={styles.welcomeScreen}>
              <h1 style={styles.welcomeTitle}>Welcome back, {userName}</h1>
              <p style={styles.welcomeSubtitle}>AI-powered search across thousands of Nepali legal documents. Get instant answers with verified sources.</p>

              <div style={styles.searchBoxLarge}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="नेपालका कानूनी दस्तावेजहरू खोज्नुहोस् |"
                  style={styles.searchInputLarge}
                />
                <button style={{...styles.sendBtnLarge, opacity: inputValue.trim() ? 1 : 0.5}} onClick={() => handleSend()} disabled={!inputValue.trim()}>
                  <Send size={20} />
                </button>
              </div>

              <div style={styles.exampleQuestions}>
                {exampleQuestions.map((question, idx) => (
                  <button key={idx} style={styles.exampleBtn} onClick={() => handleSend(question)}>
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div style={styles.messagesContainer}>
              {messages.map((message, idx) => (
                <MessageComponent key={idx} message={message} />
              ))}

              {loading && (
                <div style={styles.messageWrapper}>
                  <div style={styles.messageAvatar}>
                    <MessageSquare size={20} color="#2c7a7b" />
                  </div>
                  <div style={styles.messageContent}>
                    <div style={styles.typingIndicator}>
                      <span style={styles.dot}></span>
                      <span style={{...styles.dot, animationDelay: "0.2s"}}></span>
                      <span style={{...styles.dot, animationDelay: "0.4s"}}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div style={styles.inputContainer}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your legal question here......"
                style={styles.chatInput}
                disabled={loading}
              />
              <button style={{...styles.sendBtn, opacity: loading || !inputValue.trim() ? 0.5 : 1}} onClick={() => handleSend()} disabled={loading || !inputValue.trim()}>
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageComponent({message}) {
  const [showVariations, setShowVariations] = useState(false);
  const [expandedSources, setExpandedSources] = useState(false);

  if (message.type === "user") {
    return (
      <div style={styles.messageWrapper}>
        <div style={{...styles.messageAvatar, backgroundColor: "#667eea"}}>
          <User size={20} color="white" />
        </div>
        <div style={styles.messageContent}>
          <p style={styles.messageText}>{message.content}</p>
        </div>
      </div>
    );
  }

  // Handle out of context messages
  if (message.outOfContext) {
    return (
      <div style={styles.messageWrapper}>
        <div style={{...styles.messageAvatar, backgroundColor: "#e53e3e"}}>
          <MessageSquare size={20} color="white" />
        </div>
        <div style={styles.messageContent}>
          <div style={styles.outOfContextBox}>
            <p style={styles.outOfContextText}> {message.content}</p>
            <p style={styles.outOfContextHint}>Please ask questions related to Nepali legal documents, laws, acts, regulations, or legal procedures.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.messageWrapper}>
      <div style={{...styles.messageAvatar, backgroundColor: "#2c7a7b"}}>
        <MessageSquare size={20} color="white" />
      </div>
      <div style={styles.messageContent}>
        {message.queryVariations && message.queryVariations.length > 1 && (
          <div style={styles.variationsSection}>
            <button style={styles.variationsToggle} onClick={() => setShowVariations(!showVariations)}>
              <Sparkles size={14} />
              <span>Query Variations Used ({message.queryVariations.length})</span>
              {showVariations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showVariations && (
              <div style={styles.variationsList}>
                {message.queryVariations.map((v, i) => (
                  <div key={i} style={styles.variationItem}>
                    <span style={styles.variationNumber}>{i + 1}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {message.summary && (
          <div style={styles.summaryBox}>
            <div style={styles.summaryHeader}>
              <Sparkles size={16} color="#2c7a7b" />
              <span style={styles.summaryTitle}>Key Points</span>
            </div>
            <div style={styles.summaryContent}>
              {message.summary
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <p key={i} style={styles.summaryLine}>
                    {line}
                  </p>
                ))}
            </div>
          </div>
        )}

        <div style={styles.botResponse}>
          <p style={styles.messageText}>{message.content}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div style={styles.sourcesSection}>
            <div style={styles.sourcesHeader}>
              <p style={styles.sourcesLabel}>स्रोतहरू: ({message.totalSources || message.sources.length} sources)</p>
              {message.sources.length > 3 && (
                <button style={styles.expandBtn} onClick={() => setExpandedSources(!expandedSources)}>
                  {expandedSources ? "Show Less" : "Show All"}
                </button>
              )}
            </div>
            <div style={styles.sourcesList}>
              {(expandedSources ? message.sources : message.sources.slice(0, 3)).map((source, sIdx) => (
                <SourceCard key={sIdx} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({source}) {
  return (
    <div style={styles.sourceCard}>
      <div style={styles.sourceHeader}>
        <span style={styles.sourceNumber}>Source {source.index}</span>
        <div style={styles.sourceHeaderRight}>
          <span style={styles.relevanceScore}>{(source.relevance * 100).toFixed(0)}% match</span>
          {/* {source.citation && (
            <button style={styles.viewSourceBtn}>
              <ExternalLink size={14} />
            </button>
          )} */}
        </div>
      </div>

      {source.document_title && <p style={styles.documentTitle}>{source.document_title}</p>}

      <div style={styles.sourceDetails}>
        <p style={styles.sourceFilename}>{source.filename}</p>

        {source.section_type && source.section_number && (
          <div style={styles.sourceMetaItem}>
            {/* <span style={styles.metaIcon}>📑</span> */}
            <span style={styles.metaText}>
              {source.section_type.charAt(0).toUpperCase() + source.section_type.slice(1).replace("_", " ")} {source.section_number}
            </span>
          </div>
        )}

        {source.page_numbers && source.page_numbers.length > 0 && (
          <div style={styles.sourceMetaItem}>
            {/* <span style={styles.metaIcon}>📄</span> */}
            <span style={styles.metaText}>
              Page{source.page_numbers.length > 1 ? "s" : ""}: {source.page_numbers.join(", ")}
            </span>
          </div>
        )}

        {source.volume && source.volume !== "Unknown" && (
          <div style={styles.sourceMetaItem}>
            {/* <span style={styles.metaIcon}>📚</span> */}
            <span style={styles.metaText}>{source.volume}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#f7fafc",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "white",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#2c7a7b",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  clearBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#e6fffa",
    borderRadius: "0.5rem",
    color: "#2c7a7b",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatContainer: {
    flex: 1,
    overflow: "auto",
    padding: "2rem",
  },
  welcomeScreen: {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
    paddingTop: "4rem",
  },
  welcomeTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "1rem",
  },
  welcomeSubtitle: {
    fontSize: "1.125rem",
    color: "#718096",
    marginBottom: "3rem",
    lineHeight: "1.6",
  },
  searchBoxLarge: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    backgroundColor: "white",
    padding: "0.75rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    border: "2px solid #e2e8f0",
  },
  searchInputLarge: {
    flex: 1,
    padding: "1rem",
    border: "none",
    fontSize: "1rem",
    outline: "none",
    backgroundColor: "transparent",
  },
  sendBtnLarge: {
    padding: "1rem 1.5rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  exampleQuestions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  exampleBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#4a5568",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  messagesContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  messageWrapper: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  messageAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  messageContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  variationsSection: {
    backgroundColor: "#f7fafc",
    borderRadius: "0.5rem",
    padding: "0.75rem",
    border: "1px solid #e2e8f0",
  },
  variationsToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#4a5568",
    fontWeight: "500",
    width: "100%",
    justifyContent: "flex-start",
    padding: "0.25rem",
  },
  variationsList: {
    marginTop: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  variationItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.875rem",
    color: "#718096",
    padding: "0.75rem",
    backgroundColor: "white",
    borderRadius: "0.375rem",
  },
  variationNumber: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#2c7a7b",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "600",
    flexShrink: 0,
  },
  summaryBox: {
    backgroundColor: "#e6fffa",
    borderLeft: "4px solid #2c7a7b",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  summaryTitle: {
    fontWeight: "600",
    color: "#2c7a7b",
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  summaryContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  summaryLine: {
    fontSize: "0.875rem",
    color: "#2d3748",
    margin: 0,
    lineHeight: "1.6",
  },
  botResponse: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
  },
  messageText: {
    fontSize: "1rem",
    color: "#2d3748",
    lineHeight: "1.7",
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  sourcesSection: {
    marginTop: "0.5rem",
  },
  sourcesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  sourcesLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#4a5568",
    margin: 0,
  },
  expandBtn: {
    padding: "0.375rem 0.75rem",
    backgroundColor: "#e2e8f0",
    border: "none",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    cursor: "pointer",
    color: "#4a5568",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
  sourcesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  sourceCard: {
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  sourceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  sourceNumber: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#2c7a7b",
    backgroundColor: "#e6fffa",
    padding: "0.375rem 0.75rem",
    borderRadius: "0.375rem",
  },
  sourceHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  relevanceScore: {
    fontSize: "0.75rem",
    color: "#718096",
    fontWeight: "600",
    backgroundColor: "#f7fafc",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
  },
  viewSourceBtn: {
    padding: "0.375rem",
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "0.25rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#2c7a7b",
    transition: "all 0.2s",
  },
  documentTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "0.75rem",
    lineHeight: "1.4",
  },
  sourceDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  sourceFilename: {
    fontSize: "0.875rem",
    color: "#4a5568",
    margin: 0,
    fontFamily: "monospace",
    backgroundColor: "#f7fafc",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    display: "inline-block",
  },
  sourceMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#718096",
  },
  metaIcon: {
    fontSize: "1rem",
  },
  metaText: {
    fontSize: "0.875rem",
  },
  outOfContextBox: {
    backgroundColor: "#fff5f5",
    border: "2px solid #fc8181",
    borderRadius: "0.75rem",
    padding: "1.5rem",
  },
  outOfContextText: {
    fontSize: "1rem",
    color: "#c53030",
    fontWeight: "600",
    margin: "0 0 0.75rem 0",
  },
  outOfContextHint: {
    fontSize: "0.875rem",
    color: "#742a2a",
    margin: 0,
    lineHeight: "1.5",
  },
  typingIndicator: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "white",
    borderRadius: "0.75rem",
    width: "fit-content",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2c7a7b",
    animation: "bounce 1.4s infinite ease-in-out",
  },
  inputContainer: {
    padding: "1rem 2rem",
    backgroundColor: "white",
    borderTop: "1px solid #e2e8f0",
    boxShadow: "0 -1px 3px rgba(0,0,0,0.05)",
  },
  inputWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    gap: "1rem",
    backgroundColor: "#f7fafc",
    padding: "0.75rem",
    borderRadius: "0.75rem",
    border: "2px solid #e2e8f0",
  },
  chatInput: {
    flex: 1,
    padding: "0.75rem",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "1rem",
    outline: "none",
  },
  sendBtn: {
    padding: "0.75rem 1rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  
  button:hover {
    transform: translateY(-1px);
  }
  
  .sourceCard:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
    transform: translateY(-2px) !important;
  }
`;
document.head.appendChild(styleSheet);

export default App;
