
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
  let prompt = "You are an expert interview coach. Provide concise, professional answers to interview questions using the STAR method when applicable. Keep answers under 90 seconds of speaking time. Be specific and include relevant examples.";
  
  if (context) {
    prompt += `\n\nIMPORTANT CONTEXT:`;
    prompt += `\n- Interview Topic/Domain: ${context.topic}`;
    prompt += `\n- Candidate Experience Level: ${context.experienceLevel}`;
    
    if (context.role) {
      prompt += `\n- Target Role: ${context.role}`;
    }
    
    if (context.additionalContext) {
      prompt += `\n- Additional Context: ${context.additionalContext}`;
    }
    
    // Add experience-specific guidance
    switch (context.experienceLevel) {
      case "entry":
        prompt += `\n\nFor an entry-level candidate: Focus on foundational concepts, learning ability, and potential. Include enthusiasm and willingness to learn. Avoid overly complex technical jargon.`;
        break;
      case "mid":
        prompt += `\n\nFor a mid-level candidate: Balance technical depth with practical experience. Show problem-solving skills and project ownership. Include specific examples from past work.`;
        break;
      case "senior":
        prompt += `\n\nFor a senior-level candidate: Emphasize leadership, system design thinking, and strategic impact. Discuss trade-offs, scalability, and mentoring experience. Show depth of expertise.`;
        break;
      case "expert":
        prompt += `\n\nFor an expert-level candidate: Demonstrate thought leadership, architecture decisions, and industry best practices. Discuss complex technical challenges, innovation, and organizational impact.`;
        break;
    }
    
    prompt += `\n\nIMPORTANT: All answers must be specific to the "${context.topic}" domain. For example, if asked about "time travel" in a Snowflake interview, discuss Snowflake Time Travel feature, not science fiction. Always interpret questions within the context of ${context.topic}.`;
  }
  
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
