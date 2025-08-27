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
        "Hey there! 👋 I'm Maya, and I'm genuinely excited to help you find an amazing mentor who can make a real difference in your journey. Think of me as your friendly guide through this process.\n\nLet's start with something simple - what should I call you? Just your first name is perfect!",
      timestamp: new Date(),
      typing: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userStep, setUserStep] = useState(0);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [showingOptions, setShowingOptions] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    postalCode: "",
    country: "",
    state: "",
    city: "",
    jobTitle: "",
    company: "",
    professionalSummary: "",
    timeZone: "",
    humanValues: [],
    careerGrowthTopics: [],
    diversityEquityTopics: [],
    leadershipTopics: [],
    projectManagementTopics: [],
  });

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  // More natural, conversational question flow
  const questionFlow = [
    {
      field: "firstName",
      question: "Nice to meet you, {firstName}! 😊 And what's your last name?",
      type: "text",
    },
    {
      field: "lastName",
      question:
        "Perfect! Now I'll need your email so we can keep you updated on your mentor matching journey. What's your email address?",
      type: "text",
    },
    {
      field: "email",
      question:
        "Great! Just in case we need to reach you quickly, could you share your phone number too?",
      type: "text",
    },
    {
      field: "phone",
      question:
        "Awesome! Now let me get a sense of where you're located. What's your postal code?",
      type: "text",
    },
    {
      field: "postalCode",
      question: "Thanks! Which country do you call home?",
      type: "text",
    },
    {
      field: "country",
      question: "Nice! And which state or province are you in?",
      type: "text",
    },
    {
      field: "state",
      question: "Cool! What city do you live in?",
      type: "text",
    },
    {
      field: "city",
      question:
        "Perfect! Now let's talk about your professional life. What's your current job title?",
      type: "text",
    },
    {
      field: "jobTitle",
      question:
        "Interesting! And which company or organization do you work with?",
      type: "text",
    },
    {
      field: "company",
      question:
        "Wonderful! Here's where I'd love to learn more about you. Could you tell me about your professional journey? I'm curious about your line of work, what interests you most, your experience level, and what truly gets you excited in your field. Don't worry about making it perfect - just share what feels authentic to you!",
      type: "text",
    },
    {
      field: "professionalSummary",
      question:
        "Thank you for sharing that with me! 🌟 Now, let's dive into something really important - your core values. These help me understand what kind of mentor relationship would feel right for you.\n\nI'd love for you to pick up to 5 values that truly resonate with who you are. Just click on the ones that speak to you:",
      type: "multi-select",
      options: [
        "Accountability",
        "Commitment",
        "Compassion",
        "Empathy",
        "Family",
        "Hard Work",
        "Honesty",
        "Humility",
        "Integrity",
        "Mutual Respect",
        "Punctuality",
        "Quality",
        "Responsibility",
        "Service",
        "Teamwork",
        "Truth",
        "Win-Win",
      ],
      maxSelections: 5,
    },
    {
      field: "humanValues",
      question:
        "I love your choices! Those values really paint a picture of who you are. 🎯\n\nNow let's talk about your career aspirations. What areas would you like to focus on for your growth in the near term? Pick up to 5 that excite you most:",
      type: "multi-select",
      options: [
        "Building Mentorship Skills",
        "Getting Promoted",
        "Negotiating Compensation",
        "Networking & Relationships",
        "Personal Branding",
        "Personal Development",
        "Pivoting",
        "Powerful Conversations",
        "Presentation Skills",
        "Thought Leadership",
      ],
      maxSelections: 5,
    },
    {
      field: "careerGrowthTopics",
      question:
        "Excellent selections! 🌈 I really appreciate that you're thinking about diversity, equity, and inclusion too. These topics are so important in today's world.\n\nWhich of these DEI areas would you like to explore with a mentor? Choose up to 5:",
      type: "multi-select",
      options: [
        "Awareness of Unconscious Bias",
        "Encouraging Allyship",
        "Having Empathy",
        "Having Honest Conversations",
        "Inclusive Leadership",
        "Managing Diverse Teams",
        "Recognizing & Addressing Microaggressions",
        "Understanding DEI",
        "Understanding Diverse Cultures",
      ],
      maxSelections: 5,
    },
    {
      field: "diversityEquityTopics",
      question:
        "Fantastic! 👨‍💼👩‍💼 Leadership is such a journey, isn't it? Whether you're already in a leadership role or aspiring to be, these skills are game-changers.\n\nWhich leadership areas would you most like to develop? Pick your top 5:",
      type: "multi-select",
      options: [
        "Attracting Talent",
        "Communication",
        "Conflict Management",
        "DEI (Diversity, Equity & Inclusion)",
        "Effective Team Management",
        "Giving and Receiving Feedback",
        "Innovation",
        "Leading Virtual Teams",
        "Managing Team Morale",
        "Managing Upwards",
        "Motivating Teams",
        "Talent Management",
      ],
      maxSelections: 5,
    },
    {
      field: "leadershipTopics",
      question:
        "Perfect! 📋 Last but definitely not least - project management. Even if it's not your main role, these skills are incredibly valuable in almost any career.\n\nWhich project management areas would be most helpful for you? Choose your final 5:",
      type: "multi-select",
      options: [
        "Budgeting",
        "Change Management & Communication",
        "Customer & Stakeholder Management",
        "Driving Change",
        "Large-scale Programs",
        "Managing Resource Constraints",
        "Planning & Execution",
        "Problem Solving",
        "Scoping & Deadlines",
      ],
      maxSelections: 5,
    },
  ];

  // Options component for bubble selections
  const OptionBubbles = ({
    options,
    selectedValues,
    onOptionSelect,
    onSubmit,
    maxSelections,
  }) => {
    return (
      <div className="mt-4 mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {options.map((option, index) => {
            const isSelected = selectedValues.includes(option);
            const canSelect =
              selectedValues.length < maxSelections || isSelected;

            return (
              <button
                key={index}
                onClick={() => canSelect && onOptionSelect(option)}
                disabled={!canSelect}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                    : canSelect
                    ? "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                {option}
                {isSelected && " ✓"}
              </button>
            );
          })}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Selected: {selectedValues.length}/{maxSelections}
        </div>
        {selectedValues.length > 0 && (
          <button
            onClick={() => onSubmit(selectedValues)}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 shadow-md"
          >
            Continue with {selectedValues.length} selection
            {selectedValues.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    );
  };

  const handleOptionSelect = (option) => {
    setSelectedValues((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        const currentQuestion = questionFlow[userStep];
        if (prev.length < currentQuestion.maxSelections) {
          return [...prev, option];
        }
        return prev;
      }
    });
  };

  const handleOptionSubmit = (selections) => {
    // Create user message showing selections
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: `Selected: ${selections.join(", ")}`,
      timestamp: new Date(),
      typing: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowingOptions(false);
    setSelectedValues([]);
    setIsTyping(true);

    // Update user details
    const currentField = questionFlow[userStep]?.field;
    if (currentField) {
      setUserDetails((prev) => ({
        ...prev,
        [currentField]: selections,
      }));
    }

    // Continue to next question
    setTimeout(() => {
      let botResponse = "";

      if (userStep < questionFlow.length - 1) {
        const nextQuestion = questionFlow[userStep + 1];
        botResponse = nextQuestion.question.replace(
          "{firstName}",
          userDetails.firstName
        );
        setUserStep((prev) => prev + 1);

        // Check if next question has options
        if (nextQuestion.type === "multi-select") {
          setTimeout(() => {
            setShowingOptions(true);
            setCurrentOptions(nextQuestion.options);
          }, 500);
        }
      } else {
        // Final step - create completion card
        setConversationComplete(true);
        botResponse = generateCompletionCard();
        setUserStep((prev) => prev + 1);
      }

      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        content: botResponse,
        timestamp: new Date(),
        typing: false,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  // Helper function to calculate timezone based on country and state
  const calculateTimeZone = (country, state) => {
    const timezones = {
      "United States": {
        California: "PST (UTC-8)",
        "New York": "EST (UTC-5)",
        Texas: "CST (UTC-6)",
        Florida: "EST (UTC-5)",
        Illinois: "CST (UTC-6)",
        // Add more states as needed
      },
      Canada: {
        Ontario: "EST (UTC-5)",
        "British Columbia": "PST (UTC-8)",
        Quebec: "EST (UTC-5)",
        // Add more provinces
      },
      "United Kingdom": "GMT (UTC+0)",
      Australia: "AEST (UTC+10)",
      Germany: "CET (UTC+1)",
      France: "CET (UTC+1)",
      India: "IST (UTC+5:30)",
      Japan: "JST (UTC+9)",
      // Add more countries
    };

    if (timezones[country]) {
      if (typeof timezones[country] === "object") {
        return timezones[country][state] || "Please specify timezone manually";
      }
      return timezones[country];
    }
    return "Please specify timezone manually";
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isTyping || showingOptions) return;

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

    // Update user details based on current step
    const currentField = questionFlow[userStep]?.field;
    if (currentField && userStep < questionFlow.length) {
      setUserDetails((prev) => {
        const updated = {
          ...prev,
          [currentField]: userInput,
        };

        // Calculate timezone when we have country and state
        if (currentField === "state" && updated.country) {
          updated.timeZone = calculateTimeZone(updated.country, updated.state);
        }

        return updated;
      });
    }

    // Generate bot response
    setTimeout(() => {
      let botResponse = "";

      if (userStep < questionFlow.length - 1) {
        const nextQuestion = questionFlow[userStep + 1];
        botResponse = nextQuestion.question.replace(
          "{firstName}",
          userDetails.firstName || userInput
        );
        setUserStep((prev) => prev + 1);

        // Check if next question has options
        if (nextQuestion.type === "multi-select") {
          setTimeout(() => {
            setShowingOptions(true);
            setCurrentOptions(nextQuestion.options);
          }, 500);
        }
      } else if (userStep === questionFlow.length - 1) {
        // Final step - create completion card
        setConversationComplete(true);
        botResponse = generateCompletionCard();
        setUserStep((prev) => prev + 1);
      } else {
        botResponse = "Is there anything else I can help you with today?";
      }

      const botMessage = {
        id: messages.length + 2,
        sender: "bot",
        content: botResponse,
        timestamp: new Date(),
        typing: false,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const generateCompletionCard = () => {
    const details = userDetails;
    return `🎉 Wow, ${
      details.firstName
    }! Thank you so much for taking the time to share all of this with me. I feel like I really know you now, and I'm genuinely excited about finding you the perfect mentor match!

✨ **Here's your beautiful profile:**

**About You:**
👤 ${details.firstName} ${details.lastName}
📧 ${details.email}
📱 ${details.phone}
📍 ${details.city}, ${details.state}, ${details.country} (${details.postalCode})
🕐 ${details.timeZone}

**Your Professional World:**
💼 ${details.jobTitle} at ${details.company}
📝 ${details.professionalSummary}

**What Drives You:**
💎 Core Values: ${
      details.humanValues.length > 0
        ? details.humanValues.join(", ")
        : "To be updated"
    }

**Your Growth Journey:**
🚀 Career Focus: ${
      details.careerGrowthTopics.length > 0
        ? details.careerGrowthTopics.join(", ")
        : "To be updated"
    }

🌈 DEI Interests: ${
      details.diversityEquityTopics.length > 0
        ? details.diversityEquityTopics.join(", ")
        : "To be updated"
    }

👨‍💼 Leadership Goals: ${
      details.leadershipTopics.length > 0
        ? details.leadershipTopics.join(", ")
        : "To be updated"
    }

📋 Project Management: ${
      details.projectManagementTopics.length > 0
        ? details.projectManagementTopics.join(", ")
        : "To be updated"
    }

---

💝 **Thank you for providing your details, this will be helpful when assigning a mentor!**

I can already think of some amazing mentors who would be thrilled to work with someone with your background and aspirations. Our matching team will carefully review your profile, and you'll hear from us very soon with some fantastic mentor options!

Keep being awesome, ${details.firstName}! 🌟`;
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
    const totalSteps = questionFlow.length;
    return Math.min((userStep / totalSteps) * 100, 100);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto h-screen flex flex-col p-14">
        {/* Header */}
        <div className="bg-white rounded-t-3xl border border-slate-200 p-6 shadow-sm flex-shrink-0">
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
        <div className="bg-white border-x border-slate-200 shadow-sm flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
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

              {/* Option Bubbles */}
              {showingOptions && currentOptions.length > 0 && (
                <div className="mt-4">
                  <OptionBubbles
                    options={currentOptions}
                    selectedValues={selectedValues}
                    onOptionSelect={handleOptionSelect}
                    onSubmit={handleOptionSubmit}
                    maxSelections={5}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-3xl border border-slate-200 p-6 shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  conversationComplete
                    ? "Profile completed - thank you!"
                    : userStep < questionFlow.length
                    ? "Type your response here..."
                    : "Chat with Maya..."
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
