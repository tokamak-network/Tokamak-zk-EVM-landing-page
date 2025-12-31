"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, CheckCircle, UserCircle } from "lucide-react";
import { useBlogContext } from "./BlogContext";

type ConversationStep = "greeting" | "blogQuestion" | "name" | "email" | "message" | "sending" | "success" | "error";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface StoredUserData {
  name: string;
  email: string;
}

const STORAGE_KEY = "tokamak_chat_user";

// Helper functions for localStorage
const getStoredUser = (): StoredUserData | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.name && data.email) {
        return data as StoredUserData;
      }
    }
  } catch (e) {
    console.error("Error reading stored user data:", e);
  }
  return null;
};

const saveUserToStorage = (name: string, email: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email }));
  } catch (e) {
    console.error("Error saving user data:", e);
  }
};

const clearStoredUser = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing user data:", e);
  }
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ConversationStep>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "", message: "" });
  const [isTyping, setIsTyping] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isBlogRelatedQuestion, setIsBlogRelatedQuestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  
  // Get blog context (will be null if not on a blog page)
  const blogContext = useBlogContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, step]);

  const addBotMessage = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        isBot: false,
        timestamp: new Date(),
      },
    ]);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      const storedUser = getStoredUser();
      
      setTimeout(() => {
        // Check if we're on a blog page (blogContext exists when on a blog page)
        if (blogContext) {
          // On a blog page - ask if question is about the blog
          addBotMessage(`Hi there! 👋 I see you're reading "${blogContext.title}". Is your question related to this blog post, or is it a general question?`);
          setStep("blogQuestion");
        } else if (storedUser) {
          // Returning user - skip name and email steps
          setUserData({ name: storedUser.name, email: storedUser.email, message: "" });
          setIsReturningUser(true);
          addBotMessage(`Welcome back, ${storedUser.name}! 👋 What can we help you with today?`);
          setStep("message");
        } else {
          // New user - start from the beginning
          addBotMessage("Hi there! 👋 I'm here to help. What's your name?");
          setStep("name");
        }
      }, 300);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const resetChat = () => {
    setMessages([]);
    setStep("greeting");
    setInputValue("");
    setIsBlogRelatedQuestion(false);
    
    const storedUser = getStoredUser();
    
    setTimeout(() => {
      // Check if we're on a blog page
      if (blogContext) {
        addBotMessage(`Hi there! 👋 I see you're reading "${blogContext.title}". Is your question related to this blog post, or is it a general question?`);
        setStep("blogQuestion");
      } else if (storedUser) {
        // Returning user - keep their info and go directly to message
        setUserData({ name: storedUser.name, email: storedUser.email, message: "" });
        setIsReturningUser(true);
        addBotMessage(`Hi again, ${storedUser.name}! 👋 What else can we help you with?`);
        setStep("message");
      } else {
        // New user - start from beginning
        setUserData({ name: "", email: "", message: "" });
        setIsReturningUser(false);
        addBotMessage("Hi there! 👋 I'm here to help. What's your name?");
        setStep("name");
      }
    }, 300);
  };
  
  // Function to clear stored user and start fresh
  const startFresh = () => {
    clearStoredUser();
    setMessages([]);
    setStep("greeting");
    setUserData({ name: "", email: "", message: "" });
    setInputValue("");
    setIsReturningUser(false);
    setIsBlogRelatedQuestion(false);
    
    setTimeout(() => {
      if (blogContext) {
        addBotMessage(`Hi there! 👋 I see you're reading "${blogContext.title}". Is your question related to this blog post, or is it a general question?`);
        setStep("blogQuestion");
      } else {
        addBotMessage("Hi there! 👋 I'm here to help. What's your name?");
        setStep("name");
      }
    }, 300);
  };

  // Handle blog question response
  const handleBlogQuestionResponse = (isBlogRelated: boolean) => {
    setIsBlogRelatedQuestion(isBlogRelated);
    addUserMessage(isBlogRelated ? "About this blog post" : "General question");
    
    const storedUser = getStoredUser();
    
    setTimeout(() => {
      if (isBlogRelated) {
        addBotMessage(`Great! I'll send your question to the blog author${blogContext?.author ? ` (${blogContext.author})` : ""}. `);
      }
      
      setTimeout(() => {
        if (storedUser) {
          setUserData({ name: storedUser.name, email: storedUser.email, message: "" });
          setIsReturningUser(true);
          addBotMessage(`Welcome back, ${storedUser.name}! 👋 What would you like to ask?`);
          setStep("message");
        } else {
          addBotMessage("What's your name?");
          setStep("name");
        }
      }, isBlogRelated ? 600 : 0);
    }, 600);
  };

  const sendContactEmail = async (data: { name: string; email: string; message: string }) => {
    console.log("📧 [ChatWidget] Sending contact email with data:", data);
    console.log("📧 [ChatWidget] Blog related:", isBlogRelatedQuestion);
    console.log("📧 [ChatWidget] Blog context:", blogContext);
    
    setStep("sending");
    try {
      // Build the request payload
      const payload: {
        name: string;
        email: string;
        message: string;
        authorEmails?: string;
        blogTitle?: string;
      } = { ...data };
      
      // Add blog-related fields if this is a blog question
      if (isBlogRelatedQuestion && blogContext) {
        payload.blogTitle = blogContext.title;
        // Only add authorEmails if it's configured
        if (blogContext.authorEmail) {
          payload.authorEmails = blogContext.authorEmail;
        }
      }
      
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("📧 [ChatWidget] API error:", errorData);
        throw new Error("Failed to send message");
      }

      // Save user data for next time
      saveUserToStorage(data.name, data.email);
      
      setStep("success");
      
      let successMessage: string;
      if (isBlogRelatedQuestion && blogContext?.authorEmail && blogContext?.author) {
        // Blog question with author email configured
        successMessage = `Thanks ${data.name}! 🎉 Your question has been sent to the blog author (${blogContext.author}). They'll get back to you at ${data.email} soon.`;
      } else if (isBlogRelatedQuestion && blogContext) {
        // Blog question but no author email (sent to default recipients)
        successMessage = `Thanks ${data.name}! 🎉 Your question about "${blogContext.title}" has been received. We'll get back to you at ${data.email} soon.`;
      } else {
        // General question
        successMessage = `Thanks ${data.name}! 🎉 We've received your message and will get back to you at ${data.email} soon.`;
      }
      
      addBotMessage(successMessage);
    } catch (error) {
      console.error("📧 [ChatWidget] Error:", error);
      setStep("error");
      addBotMessage("Oops! Something went wrong. Please try again or contact us directly.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || step === "sending" || step === "success") return;

    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue("");

    switch (step) {
      case "name":
        setUserData((prev) => ({ ...prev, name: value }));
        setTimeout(() => {
          addBotMessage(
            `Nice to meet you, ${value}! 😊 What's your email address so we can get back to you?`
          );
          setStep("email");
        }, 600);
        break;

      case "email":
        if (!validateEmail(value)) {
          setTimeout(() => {
            addBotMessage(
              "Hmm, that doesn't look like a valid email. Could you please enter a valid email address?"
            );
          }, 600);
          return;
        }
        setUserData((prev) => ({ ...prev, email: value }));
        setTimeout(() => {
          addBotMessage("Perfect! ✨ Now, what would you like to ask or tell us about? (Please write your message in one line.)");
          setStep("message");
        }, 600);
        break;

      case "message":
        // Create the complete data object and pass it directly to avoid state timing issues
        const completeData = { ...userData, message: value };
        setUserData(completeData);
        setTimeout(() => {
          sendContactEmail(completeData);
        }, 600);
        break;

      case "error":
        // Allow retry - create complete data with new message
        const retryData = { ...userData, message: value };
        setUserData(retryData);
        setTimeout(() => {
          sendContactEmail(retryData);
        }, 600);
        break;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          background: "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
          boxShadow: "0 4px 20px rgba(79, 195, 247, 0.4)",
        }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border-2"
          style={{
            background: "linear-gradient(180deg, #0a1930 0%, #1a2347 100%)",
            borderColor: "#4fc3f7",
            boxShadow: "0 8px 40px rgba(79, 195, 247, 0.25)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Tokamak Support</h3>
                <p className="text-white/80 text-xs">We typically reply in a few hours</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* User indicator for returning users */}
          {isReturningUser && userData.name && (
            <div 
              className="px-4 py-2 flex items-center justify-between text-xs"
              style={{ 
                background: "rgba(79, 195, 247, 0.1)",
                borderBottom: "1px solid rgba(79, 195, 247, 0.2)"
              }}
            >
              <div className="flex items-center gap-2 text-white/80">
                <UserCircle className="w-4 h-4" />
                <span>Chatting as <strong className="text-white">{userData.name}</strong></span>
              </div>
              <button
                onClick={startFresh}
                className="text-[#4fc3f7] hover:text-white transition-colors text-xs"
              >
                Not you?
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div
            className="h-[350px] overflow-y-auto p-4 space-y-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4fc3f7 #0a1930",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.isBot
                      ? "rounded-bl-md"
                      : "rounded-br-md"
                  }`}
                  style={{
                    background: message.isBot
                      ? "rgba(79, 195, 247, 0.15)"
                      : "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
                    border: message.isBot ? "1px solid rgba(79, 195, 247, 0.3)" : "none",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: message.isBot ? "#ffffff" : "#ffffff",
                      fontFamily: '"IBM Plex Mono", monospace',
                    }}
                  >
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md"
                  style={{
                    background: "rgba(79, 195, 247, 0.15)",
                    border: "1px solid rgba(79, 195, 247, 0.3)",
                  }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#4fc3f7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {step === "success" && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Message sent!</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="p-4 border-t"
            style={{
              borderColor: "rgba(79, 195, 247, 0.3)",
              background: "rgba(10, 25, 48, 0.8)",
            }}
          >
            {step === "success" ? (
              <button
                onClick={resetChat}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
                  color: "#ffffff",
                }}
              >
                Start New Conversation
              </button>
            ) : step === "blogQuestion" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBlogQuestionResponse(true)}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
                    color: "#ffffff",
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                >
                  About this blog
                </button>
                <button
                  onClick={() => handleBlogQuestionResponse(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
                  style={{
                    background: "rgba(79, 195, 247, 0.2)",
                    border: "1px solid rgba(79, 195, 247, 0.5)",
                    color: "#ffffff",
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                >
                  General question
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type={step === "email" ? "email" : "text"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    step === "name"
                      ? "Enter your name..."
                      : step === "email"
                      ? "Enter your email..."
                      : step === "message" || step === "error"
                      ? "Type your message..."
                      : "Type a message..."
                  }
                  disabled={step === "sending" || step === "greeting"}
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(79, 195, 247, 0.1)",
                    border: "1px solid rgba(79, 195, 247, 0.3)",
                    color: "#ffffff",
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || step === "sending" || step === "greeting"}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #028bee 0%, #4fc3f7 100%)",
                  }}
                  aria-label="Send message"
                >
                  {step === "sending" ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

