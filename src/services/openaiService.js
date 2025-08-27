import OpenAI from "openai";

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });

    this.model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
    this.maxTokens = 1500;
    this.temperature = 0.8; // Higher for more natural conversation
  }

  // Helper method to determine missing fields
  getMissingFields(userData) {
    const required = [
      "name",
      "email",
      "interests",
      "experience",
      "goals",
      "availability",
    ];
    const optional = ["preferences", "age"];

    const missingRequired = required.filter(
      (field) => !userData[field] || userData[field].trim() === ""
    );
    const missingOptional = optional.filter(
      (field) => !userData[field] || userData[field].trim() === ""
    );

    return [...missingRequired, ...missingOptional];
  }

  // Generate natural conversation starter
  getConversationStarter() {
    const starters = [
      "Hi there! 👋 I'm Maya, your MentorCloud guide. I'm here to help you find an amazing mentor who can support your journey. What should I call you?",
      "Hello! I'm Maya from MentorCloud, and I'm genuinely excited to help you connect with the perfect mentor. What's your name?",
      "Hey! 😊 Maya here from MentorCloud. I love helping people find mentors who can truly make a difference in their growth. What's your name so I can get to know you better?",
    ];

    return starters[Math.floor(Math.random() * starters.length)];
  }

  // Enhanced system prompt for natural conversation
  getSystemPrompt(userData = {}) {
    const collectedInfo =
      Object.keys(userData).length > 0
        ? `\nInformation already collected: ${JSON.stringify(
            userData,
            null,
            2
          )}`
        : "\nThis is the beginning of the conversation.";

    const missingInfo = this.getMissingFields(userData);
    const nextFocus =
      missingInfo.length > 0
        ? `\nNext priority: Focus on collecting ${missingInfo
            .slice(0, 2)
            .join(" and ")}`
        : "\nAll information collected - prepare for completion.";

    return `You are MentorCloud's friendly and intelligent assistant named Maya. Your personality is warm, genuinely curious, and encouraging. You speak like a helpful friend who's excited to help someone find their perfect mentor.

🎯 YOUR MISSION:
Help users share their information naturally through engaging conversation to match them with the perfect mentor.

📋 REQUIRED INFORMATION TO COLLECT:
- name: Their full name
- email: Valid email address for communication
- interests: Skills/areas they want to develop (programming, design, business, etc.)
- experience: Current level (beginner, intermediate, advanced)
- goals: What they hope to achieve through mentoring
- availability: Time they can dedicate to mentoring
- preferences: Any specific mentor preferences (optional)
- age: Their age (optional but helpful)

🗣️ CONVERSATION STYLE:
- Speak naturally like a friendly human, not a formal assistant
- Show genuine curiosity about their journey and aspirations
- Use conversational transitions and acknowledgments
- Ask follow-up questions that flow naturally from their responses
- Share relevant insights or encouragement when appropriate
- Use light emojis to add warmth (but don't overdo it)
- Keep responses concise but meaningful (2-4 sentences max)

💡 CONVERSATION TECHNIQUES:
- Build on what they share: "That's interesting that you mentioned..."
- Use their name once you know it
- Connect their interests to potential mentoring opportunities
- Ask "what" and "why" questions to understand motivation
- Offer examples when they seem uncertain
- Validate their goals and dreams

🚫 CRITICAL - NEVER DO THESE:
- Ask for information you already have (check collected info above!)
- Repeat questions you've already asked
- Ask for their name if you already know it
- Ask for email if you already have it
- Use robotic or overly formal language
- Ask multiple questions at once
- Be pushy about information they haven't shared yet

${collectedInfo}${nextFocus}

IMPORTANT: Always check the information already collected above before asking any questions. If you have their name, use it! If you have their email, don't ask for it again!

Remember: You're having a genuine conversation with someone who's excited about their growth journey. Make them feel heard, understood, and excited about finding their mentor!`;
  }

  // Extract user data from their message using improved pattern matching
  extractUserData(userMessage, currentUserData = {}) {
    try {
      // Simple regex-based extraction for more reliable results
      const extractedData = { ...currentUserData };

      // Extract name (simple patterns)
      if (!extractedData.name) {
        const namePatterns = [
          /(?:name is|i'm|i am|call me)\s+([a-zA-Z\s]{2,30})/i,
          /^([a-zA-Z\s]{2,30})$/,
          /my name is ([a-zA-Z\s]{2,30})/i,
        ];

        for (const pattern of namePatterns) {
          const match = userMessage.match(pattern);
          if (match && match[1]) {
            const name = match[1].trim();
            // Only extract if it looks like a real name (not single words like "hello")
            if (
              name.length > 2 &&
              !["hello", "hi", "hey", "yes", "no", "ok", "okay"].includes(
                name.toLowerCase()
              )
            ) {
              extractedData.name = name;
              break;
            }
          }
        }
      }

      // Extract email
      const emailPattern =
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const emailMatch = userMessage.match(emailPattern);
      if (emailMatch) {
        extractedData.email = emailMatch[0];
      }

      // Extract age
      const agePattern = /\b(\d{2})\b/;
      const ageMatch = userMessage.match(agePattern);
      if (
        ageMatch &&
        parseInt(ageMatch[1]) >= 13 &&
        parseInt(ageMatch[1]) <= 99
      ) {
        extractedData.age = ageMatch[1];
      }

      // Extract experience level
      const expLower = userMessage.toLowerCase();
      if (!extractedData.experience) {
        if (
          expLower.includes("beginner") ||
          expLower.includes("new") ||
          expLower.includes("starting")
        ) {
          extractedData.experience = "beginner";
        } else if (
          expLower.includes("intermediate") ||
          expLower.includes("some experience")
        ) {
          extractedData.experience = "intermediate";
        } else if (
          expLower.includes("advanced") ||
          expLower.includes("expert") ||
          expLower.includes("experienced")
        ) {
          extractedData.experience = "advanced";
        }
      }

      // For interests - look for specific keywords or longer descriptive messages
      if (!extractedData.interests && userMessage.length > 10) {
        const interestKeywords = [
          "programming",
          "coding",
          "design",
          "business",
          "marketing",
          "data",
          "science",
          "management",
          "leadership",
          "writing",
          "art",
          "music",
          "web development",
          "app development",
          "frontend",
          "backend",
          "fullstack",
          "ui",
          "ux",
          "graphic design",
        ];
        const foundInterests = interestKeywords.filter((keyword) =>
          userMessage.toLowerCase().includes(keyword)
        );
        if (foundInterests.length > 0) {
          extractedData.interests = foundInterests.join(", ");
        } else if (
          userMessage.length > 20 &&
          (userMessage.toLowerCase().includes("learn") ||
            userMessage.toLowerCase().includes("develop") ||
            userMessage.toLowerCase().includes("improve") ||
            userMessage.toLowerCase().includes("skill"))
        ) {
          // Store the full message as interests if it seems descriptive
          extractedData.interests = userMessage;
        }
      }

      // Extract goals if message seems goal-oriented
      if (
        !extractedData.goals &&
        (userMessage.toLowerCase().includes("want") ||
          userMessage.toLowerCase().includes("goal") ||
          userMessage.toLowerCase().includes("achieve") ||
          userMessage.toLowerCase().includes("learn") ||
          userMessage.toLowerCase().includes("become") ||
          userMessage.toLowerCase().includes("improve"))
      ) {
        extractedData.goals = userMessage;
      }

      // Extract availability
      if (!extractedData.availability) {
        const availabilityPatterns = [
          /(\d+[-\s]*hours?\s*(per\s*week|weekly))/i,
          /(weekends?|evenings?|mornings?|flexible)/i,
          /(full[- ]?time|part[- ]?time)/i,
        ];

        for (const pattern of availabilityPatterns) {
          const match = userMessage.match(pattern);
          if (match) {
            extractedData.availability = match[0];
            break;
          }
        }
      }

      console.log("Extracted data:", extractedData); // Debug log
      return extractedData;
    } catch (error) {
      console.error("Data extraction error:", error);
      return currentUserData; // Return existing data if extraction fails
    }
  }

  // Generate AI response based on conversation context
  async generateResponse(userMessage, conversationHistory = [], userData = {}) {
    try {
      // First extract any user data from the message
      const updatedUserData = this.extractUserData(userMessage, userData);
      console.log("Updated user data:", updatedUserData); // Debug log

      // Create messages array for OpenAI
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt(updatedUserData),
        },
        // Include last few messages for context (reduced to avoid confusion)
        ...conversationHistory.slice(-4).map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage,
        },
      ];

      console.log(
        "System prompt:",
        this.getSystemPrompt(updatedUserData).substring(0, 200) + "..."
      ); // Debug log

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: false,
      });

      const responseMessage = response.choices[0].message.content.trim();
      const missingFields = this.getMissingFields(updatedUserData);
      const isComplete =
        missingFields.filter((field) =>
          [
            "name",
            "email",
            "interests",
            "experience",
            "goals",
            "availability",
          ].includes(field)
        ).length === 0;

      console.log("Missing fields:", missingFields); // Debug log
      console.log("Is complete:", isComplete); // Debug log

      return {
        success: true,
        message: responseMessage,
        userData: updatedUserData,
        isComplete,
        missingFields,
        usage: response.usage,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return {
        success: false,
        message:
          "I'm having trouble connecting right now. Could you please try again in a moment?",
        userData,
        isComplete: false,
        error: error.message,
      };
    }
  }

  // Build context string from conversation history and user data
  buildContext(conversationHistory, userData) {
    const contextParts = [];

    // Add user data context
    if (Object.keys(userData).length > 0) {
      contextParts.push(
        `User Information: ${JSON.stringify(userData, null, 2)}`
      );
    }

    // Add conversation flow context
    const missingFields = this.getMissingFields(userData);
    if (missingFields.length > 0) {
      contextParts.push(`Still need to collect: ${missingFields.join(", ")}`);
    }

    return contextParts.join("\n");
  }

  // Generate a summary when conversation is complete
  generateCompletionSummary(userData) {
    const summaryParts = [];

    if (userData.name) summaryParts.push(`• Name: ${userData.name}`);
    if (userData.email) summaryParts.push(`• Email: ${userData.email}`);
    if (userData.interests)
      summaryParts.push(`• Interests: ${userData.interests}`);
    if (userData.experience)
      summaryParts.push(`• Experience Level: ${userData.experience}`);
    if (userData.goals) summaryParts.push(`• Goals: ${userData.goals}`);
    if (userData.availability)
      summaryParts.push(`• Availability: ${userData.availability}`);
    if (userData.age) summaryParts.push(`• Age: ${userData.age}`);
    if (userData.preferences)
      summaryParts.push(`• Preferences: ${userData.preferences}`);

    return `Perfect! 🎉 Here's what I've learned about you:\n\n${summaryParts.join(
      "\n"
    )}\n\nThanks for sharing your story with me, ${
      userData.name || "there"
    }! I'm excited to help you find a mentor who can support your ${
      userData.interests || "journey"
    }. Our team will review your information and match you with someone amazing. You'll hear from us soon at ${
      userData.email
    }!`;
  }

  // Validate specific fields
  validateField(fieldName, value) {
    const validations = {
      name: (v) => v && v.trim().length >= 2,
      email: (v) => v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      age: (v) => v && !isNaN(v) && parseInt(v) >= 13 && parseInt(v) <= 100,
      experience: (v) =>
        v && ["beginner", "intermediate", "advanced"].includes(v.toLowerCase()),
      interests: (v) => v && v.trim().length >= 3,
      goals: (v) => v && v.trim().length >= 5,
      availability: (v) => v && v.trim().length >= 3,
      preferences: (v) => !v || v.trim().length >= 3, // Optional field
    };

    const validator = validations[fieldName];
    return validator ? validator(value) : true;
  }

  // Check if all required information is collected
  isConversationComplete(userData) {
    const required = [
      "name",
      "email",
      "interests",
      "experience",
      "goals",
      "availability",
    ];
    return required.every((field) =>
      this.validateField(field, userData[field])
    );
  }
}

export default new OpenAIService();
