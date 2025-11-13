
// AI Service for generating interview answers
// Supports multiple AI providers: OpenAI, Groq (free), Anthropic, and Google Gemini (free)

export interface InterviewContext {
  topic: string;
  experienceLevel: "entry" | "mid" | "senior" | "expert";
  role?: string;
  additionalContext?: string;
}

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

// Get API key from localStorage (user can configure in settings)
const getAPIKey = (provider: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${provider}_api_key`);
};

// Build context-aware system prompt
const buildSystemPrompt = (context?: InterviewContext): string => {
  let prompt = `You are a covert AI Interview Assistant providing real-time, high-quality, undetectable answer suggestions to a job candidate. Your primary role is to ensure the candidate sounds professional, confident, and highly qualified.`;
  
  // Add context if provided
  if (context && context.topic) {
    prompt += `\n\n🎯 CANDIDATE CONTEXT:`;
    prompt += `\n- Domain: ${context.topic}`;
    prompt += `\n- Experience Level: ${context.experienceLevel}`;
    
    if (context.role) {
      prompt += `\n- Target Role: ${context.role}`;
    }
    
    if (context.additionalContext) {
      prompt += `\n- Additional Info: ${context.additionalContext}`;
    }
    
    prompt += `\n\n⚠️ CRITICAL: ALL answers must be specific to ${context.topic}. When asked ANY question (including "tell me about yourself"), answer from the perspective of a ${context.topic} professional.`;
  }
  
  prompt += `\n\n📋 RESPONSE FORMAT REQUIREMENTS:`;
  prompt += `\n• Keep responses SHORT (max 3-5 sentences)`;
  prompt += `\n• Use bullet points or scannable format`;
  prompt += `\n• Do NOT include conversational filler like "Hello," "That's a great question," or introductory phrases`;
  prompt += `\n• Start directly with the core points`;
  prompt += `\n• For Behavioral Questions: Use STAR method (Situation, Task, Action, Result) structure`;
  prompt += `\n• For Technical Questions: Provide direct definition and one real-world application`;
  prompt += `\n• NEVER apologize or mention that you are an AI assistant`;
  prompt += `\n• Be confident, professional, and strategic`;
  
  prompt += `\n\n✅ GOOD EXAMPLE (Technical):`;
  prompt += `\n"Snowflake Time Travel allows querying historical data up to 90 days back. I used it to recover accidentally deleted customer records and audit data changes during a compliance review."`;
  
  prompt += `\n\n✅ GOOD EXAMPLE (Behavioral - STAR):`;
  prompt += `\n"Led migration of 50TB data warehouse to Snowflake (S). Needed zero downtime (T). Implemented incremental sync with validation checkpoints (A). Completed 2 weeks early, reduced query costs 40% (R)."`;
  
  prompt += `\n\n❌ BAD EXAMPLE:`;
  prompt += `\n"That's a great question! Thank you for asking. Well, let me think about this. Snowflake Time Travel is actually quite interesting..."`;
  
  return prompt;
};

// OpenAI API call
const callOpenAI = async (question: string, context: string, interviewContext?: InterviewContext): Promise<AIResponse> => {
  const apiKey = getAPIKey("openai");
  if (!apiKey) {
    return { success: false, error: "OpenAI API key not configured" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(interviewContext)
          },
          {
            role: "user",
            content: `Interview Question: ${question}\n\nConversation Context: ${context}\n\nProvide a strong, professional answer that would impress an interviewer.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.choices[0].message.content
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate answer"
    };
  }
};

// Groq API call (FREE alternative)
const callGroq = async (question: string, context: string, interviewContext?: InterviewContext): Promise<AIResponse> => {
  const apiKey = getAPIKey("groq");
  if (!apiKey) {
    return { success: false, error: "Groq API key not configured" };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(interviewContext)
          },
          {
            role: "user",
            content: `Interview Question: ${question}\n\nConversation Context: ${context}\n\nProvide a strong, professional answer that would impress an interviewer.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.choices[0].message.content
    };
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate answer"
    };
  }
};

// Anthropic API call
const callAnthropic = async (question: string, context: string, interviewContext?: InterviewContext): Promise<AIResponse> => {
  const apiKey = getAPIKey("anthropic");
  if (!apiKey) {
    return { success: false, error: "Anthropic API key not configured" };
  }

  try {
    const systemPrompt = buildSystemPrompt(interviewContext);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nInterview Question: ${question}\n\nConversation Context: ${context}\n\nProvide a strong, professional answer that would impress an interviewer.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.content[0].text
    };
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate answer"
    };
  }
};

// Google Gemini API call (FREE with generous limits)
const callGemini = async (question: string, context: string, interviewContext?: InterviewContext): Promise<AIResponse> => {
  const apiKey = getAPIKey("gemini");
  if (!apiKey) {
    return { success: false, error: "Google Gemini API key not configured" };
  }

  try {
    const systemPrompt = buildSystemPrompt(interviewContext);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nInterview Question: ${question}\n\nConversation Context: ${context}\n\nProvide a strong, professional answer that would impress an interviewer.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    return {
      success: true,
      answer: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate answer"
    };
  }
};

// Main function to generate AI answer with context
export const generateAIAnswer = async (
  question: string,
  context: string = "",
  provider: "openai" | "groq" | "anthropic" | "gemini" = "gemini",
  interviewContext?: InterviewContext
): Promise<AIResponse> => {
  switch (provider) {
    case "openai":
      return await callOpenAI(question, context, interviewContext);
    case "groq":
      return await callGroq(question, context, interviewContext);
    case "anthropic":
      return await callAnthropic(question, context, interviewContext);
    case "gemini":
      return await callGemini(question, context, interviewContext);
    default:
      return { success: false, error: "Invalid AI provider" };
  }
};

// Save API key to localStorage
export const saveAPIKey = (provider: string, apiKey: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${provider}_api_key`, apiKey);
};

// Get configured provider
export const getConfiguredProvider = (): "openai" | "groq" | "anthropic" | "gemini" | null => {
  if (typeof window === "undefined") return null;
  
  const saved = localStorage.getItem("ai_provider");
  if (saved) return saved as "openai" | "groq" | "anthropic" | "gemini";
  
  // Auto-detect based on available keys
  if (getAPIKey("gemini")) return "gemini";
  if (getAPIKey("groq")) return "groq";
  if (getAPIKey("openai")) return "openai";
  if (getAPIKey("anthropic")) return "anthropic";
  
  return null;
};

// Save provider preference
export const saveProviderPreference = (provider: "openai" | "groq" | "anthropic" | "gemini"): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai_provider", provider);
};

// Context management functions
export const saveInterviewContext = (context: InterviewContext): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("interview_context", JSON.stringify(context));
};

export const getInterviewContext = (): InterviewContext | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem("interview_context");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Context presets
export const getContextPresets = (): InterviewContext[] => {
  return [
    {
      topic: "Snowflake",
      experienceLevel: "mid",
      role: "Data Engineer",
      additionalContext: "Focus on data warehousing, SQL, and cloud architecture"
    },
    {
      topic: "Python",
      experienceLevel: "senior",
      role: "Backend Engineer",
      additionalContext: "Emphasis on scalable systems and best practices"
    },
    {
      topic: "React",
      experienceLevel: "mid",
      role: "Frontend Developer",
      additionalContext: "Modern React patterns, hooks, and performance"
    },
    {
      topic: "AWS",
      experienceLevel: "senior",
      role: "Cloud Architect",
      additionalContext: "Infrastructure, security, and cost optimization"
    },
    {
      topic: "Data Science",
      experienceLevel: "entry",
      role: "Data Analyst",
      additionalContext: "Statistics, visualization, and basic ML concepts"
    },
    {
      topic: "SQL",
      experienceLevel: "mid",
      role: "Database Developer",
      additionalContext: "Query optimization, indexing, and database design"
    }
  ];
};
