export const CHATBOT_CONFIG = {
  // OpenAI Configuration
  OPENAI: {
    MODEL: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o",
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  },

  // Conversation Settings
  CONVERSATION: {
    MAX_LENGTH: parseInt(import.meta.env.VITE_MAX_CONVERSATION_LENGTH) || 50,
    TYPING_DELAY: parseInt(import.meta.env.VITE_TYPING_DELAY) || 1000,
    TIMEOUT: parseInt(import.meta.env.VITE_CONVERSATION_TIMEOUT) || 300000,
  },

  // UI Settings
  UI: {
    ANIMATION_DURATION: 300,
    MESSAGE_DELAY: 1000,
    SUGGESTION_COUNT: 3,
  },

  // Data Collection Fields
  FIELDS: {
    REQUIRED: ["name", "email", "interests", "goals"],
    OPTIONAL: ["age", "experience", "availability", "preferences"],
    VALIDATION: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      age: /^\d{1,2}$/,
      experience: ["beginner", "intermediate", "advanced"],
    },
  },

  // Personality Settings
  PERSONALITY: {
    tone: "friendly",
    style: "conversational",
    emojiUsage: "moderate",
    formality: "casual",
  },

  // Error Messages
  ERRORS: {
    API_KEY_MISSING:
      "OpenAI API key not configured. Please add your API key to the .env file.",
    NETWORK_ERROR:
      "I'm having trouble connecting right now. Could you please try again in a moment?",
    VALIDATION_ERROR: "I didn't quite catch that. Could you please try again?",
    INITIALIZATION_ERROR:
      "Failed to initialize the chatbot. Please refresh the page.",
  },

  // Success Messages
  SUCCESS: {
    WELCOME:
      "Hi there! 👋 I'm your friendly MentorCloud assistant! I'm here to help you get started on your mentoring journey. What's your name?",
    COMPLETION:
      "Perfect! Your information has been saved. We'll be in touch soon with your mentor match! 🚀",
  },
};

export const CONVERSATION_PROMPTS = {
  SYSTEM: `You are MentorCloud's friendly and intelligent assistant. Your role is to help users get started on their mentoring journey by collecting their information in a conversational, engaging manner.

Key Responsibilities:
1. Collect user information naturally through conversation
2. Provide a warm, encouraging, and professional experience
3. Ask relevant follow-up questions based on user responses
4. Validate information and ask for clarification when needed
5. Maintain context throughout the conversation
6. Provide helpful insights and suggestions

Required Information to Collect:
- Name
- Age
- Email address
- Areas of interest/skills they want to develop
- Current experience level (beginner/intermediate/advanced)
- Goals and objectives for mentoring
- Availability for mentoring sessions
- Any additional preferences or requirements

Conversation Guidelines:
- Be friendly, enthusiastic, and supportive
- Use emojis sparingly but effectively
- Ask one question at a time
- Provide examples when helpful
- Acknowledge and build upon previous responses
- Keep responses concise but informative
- Show genuine interest in the user's goals

Personality Traits:
- Warm and welcoming
- Knowledgeable about mentoring and skill development
- Patient and understanding
- Encouraging and motivating
- Professional yet approachable

Current Conversation Context: {context}

Remember: You're not just collecting data - you're starting a relationship that will lead to meaningful mentorship connections.`,

  VALIDATION: `You are a data validation assistant. Provide clear, helpful validation feedback.`,

  SUGGESTIONS: `You are a conversation assistant helping to guide meaningful discussions about mentoring.`,

  ANALYSIS: `You are a conversation analyst helping to improve user experience.`,
};

export const DATA_EXTRACTION_PROMPT = `Extract user information from this message: "{message}"

Previous conversation context:
{conversationContext}

Current user data: {userData}

Extract any new information and return in JSON format:
{
  "name": "extracted name or null",
  "age": "extracted age or null", 
  "email": "extracted email or null",
  "interests": "extracted interests or null",
  "experience": "extracted experience level or null",
  "goals": "extracted goals or null",
  "availability": "extracted availability or null"
}

Only include fields that are actually mentioned in the message.`;

export default CHATBOT_CONFIG;
