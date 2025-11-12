
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
  if (!context || !context.topic) {
    return "You are an expert interview coach. Provide concise, professional answers to interview questions using the STAR method when applicable. Keep answers under 90 seconds of speaking time. Be specific and include relevant examples.";
  }
  
  // Build highly specific context-aware prompt
  let prompt = `You are an expert ${context.topic} interview coach helping a candidate prepare for a ${context.topic} interview.`;
  
  prompt += `\n\n🎯 CRITICAL CONTEXT - READ CAREFULLY:`;
  prompt += `\n- Interview Domain: ${context.topic}`;
  prompt += `\n- Candidate Level: ${context.experienceLevel}`;
  
  if (context.role) {
    prompt += `\n- Target Role: ${context.role}`;
  }
  
  if (context.additionalContext) {
    prompt += `\n- Additional Context: ${context.additionalContext}`;
  }
  
  // Add CRITICAL domain-specific instruction
  prompt += `\n\n⚠️ EXTREMELY IMPORTANT:`;
  prompt += `\nALL answers must be specific to ${context.topic}. When the candidate is asked ANY question (including "tell me about yourself", "what is time travel", etc.), you MUST answer from the perspective of a ${context.topic} professional.`;
  prompt += `\n\nFor example:`;
  prompt += `\n- "Tell me about yourself" → Answer as a ${context.topic} ${context.experienceLevel} professional`;
  prompt += `\n- "What is time travel" in Snowflake interview → Discuss Snowflake Time Travel feature, NOT physics`;
  prompt += `\n- "What are your strengths" → Focus on ${context.topic}-relevant technical and professional strengths`;
  
  // Add experience-specific guidance
  prompt += `\n\n👤 EXPERIENCE LEVEL GUIDANCE (${context.experienceLevel}):`;
  switch (context.experienceLevel) {
    case "entry":
      prompt += `\nEntry-level candidate (0-2 years): Focus on foundational ${context.topic} concepts, learning ability, academic projects, internships, and enthusiasm. Show potential and willingness to learn. Avoid claiming deep expertise.`;
      break;
    case "mid":
      prompt += `\nMid-level candidate (3-5 years): Balance ${context.topic} technical depth with 3-5 years of practical experience. Show problem-solving skills, project ownership, and real-world examples. Demonstrate solid technical competence.`;
      break;
    case "senior":
      prompt += `\nSenior candidate (6-10 years): Emphasize ${context.topic} leadership, system design thinking, strategic impact, and 6-10 years of deep expertise. Discuss trade-offs, scalability, mentoring, and architecture decisions.`;
      break;
    case "expert":
      prompt += `\nExpert candidate (10+ years): Demonstrate ${context.topic} thought leadership, complex architecture decisions, industry best practices, innovation, and organizational impact. Show mastery and vision.`;
      break;
  }
  
  prompt += `\n\n📋 ANSWER FORMAT:`;
  prompt += `\n- Keep answers under 90 seconds of speaking time`;
  prompt += `\n- Use STAR method for behavioral questions (Situation, Task, Action, Result)`;
  prompt += `\n- Include specific ${context.topic} technical details and examples`;
  prompt += `\n- Be professional, confident, and authentic`;
  prompt += `\n- Focus on achievements and measurable results when possible`;
  
  prompt += `\n\n🚫 NEVER:`;
  prompt += `\n- Give generic answers that could apply to any field`;
  prompt += `\n- Discuss topics outside of ${context.topic} domain`;
  prompt += `\n- Claim expertise beyond the ${context.experienceLevel} level`;
  prompt += `\n- Provide answers that don't match the interview context`;
  
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
