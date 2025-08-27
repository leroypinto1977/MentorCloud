import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Sparkles } from "lucide-react";
import OpenAIService from "../services/openaiService";

// Simple UI components to replace shadcn/ui components
const Avatar = ({ className, children }) => (
  <div className={`rounded-full ${className}`}>{children}</div>
);

const AvatarFallback = ({ className, children }) => (
  <div
    className={`flex items-center justify-center w-full h-full rounded-full ${className}`}
  >
    {children}
  </div>
);

const Button = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center ${className} ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
    }`}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-4 py-3 border outline-none transition-all ${className}`}
    {...props}
  />
);

const ScrollArea = ({ className, children, ...props }) => (
  <div className={`overflow-y-auto ${className}`} {...props}>
    {children}
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      content:
        "Hello! Welcome to MentorCloud! 👋 I'm Maya, your personal mentoring assistant. I'm here to help you find the perfect mentor for your journey. To get started, I'd love to know a bit about you. What's your name?",
      timestamp: new Date(),
      typing: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [conversationComplete, setConversationComplete] = useState(false);

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isTyping) return;

    const userInput = newMessage.trim();
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: userInput,
      timestamp: new Date(),
      typing: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Use OpenAI service to generate response
      const result = await OpenAIService.generateResponse(
        userInput,
        messages,
        userData
      );

      if (result.success) {
        // Update user data with extracted information
        setUserData(result.userData || userData);

        // Add bot response after typing delay
        setTimeout(() => {
          const botMessage = {
            id: messages.length + 2,
            sender: "bot",
            content: result.message,
            timestamp: new Date(),
            typing: false,
          };

          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);

          // Check if conversation is complete
          if (result.isComplete) {
            setConversationComplete(true);
            setTimeout(() => {
              const summaryMessage = OpenAIService.generateCompletionSummary(
                result.userData
              );
              const completionMsg = {
                id: messages.length + 3,
                sender: "bot",
                content: summaryMessage,
                timestamp: new Date(),
                typing: false,
              };
              setMessages((prev) => [...prev, completionMsg]);
            }, 1500);
          }
        }, 1200 + Math.random() * 800);
      } else {
        setTimeout(() => {
          const errorMessage = {
            id: messages.length + 2,
            sender: "bot",
            content: result.message,
            timestamp: new Date(),
            typing: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setTimeout(() => {
        const errorMessage = {
          id: messages.length + 2,
          sender: "bot",
          content:
            "I'm having trouble processing your message right now. Could you please try again in a moment?",
          timestamp: new Date(),
          typing: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer =
        scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) || scrollAreaRef.current;
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, isTyping]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressPercentage = () => {
    const totalFields = 6; // name, email, interests, experience, goals, availability
    const completedFields = [
      "name",
      "email",
      "interests",
      "experience",
      "goals",
      "availability",
    ].filter(
      (field) => userData[field] && userData[field].trim() !== ""
    ).length;
    return Math.min((completedFields / totalFields) * 100, 100);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Maya - MentorCloud Assistant
                </h1>
                <div className="flex items-center space-x-2">
                  {conversationComplete ? (
                    <>
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-slate-500">
                        Profile Complete
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-500">Online</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white border-x border-slate-200 shadow-sm">
          {/* Messages Area */}
          <ScrollArea className="h-96 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.sender === "user" ? (
                      <AvatarFallback className="bg-slate-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div
                    className={`flex-1 ${
                      message.sender === "user" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[85%] p-4 rounded-3xl shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">
                        Maya is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  conversationComplete
                    ? "Conversation complete - thank you!"
                    : "Type your response here..."
                }
                className="pr-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-full"
                disabled={isTyping || conversationComplete}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isTyping || conversationComplete}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all rounded-full h-12 w-12 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {conversationComplete && (
            <div className="flex items-center justify-center mt-4 p-3 bg-green-50 rounded-full border border-green-200">
              <Sparkles className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700 font-medium">
                Profile Complete - Ready for Mentor Matching!
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chatbot;
