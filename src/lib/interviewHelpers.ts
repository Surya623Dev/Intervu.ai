export interface InterviewSession {
  id: string;
  date: string;
  duration: number;
  questionsCount: number;
  transcript: string;
  questions: string[];
}

export interface TranscriptEntry {
  text: string;
  timestamp: string;
  isQuestion: boolean;
}

export const saveSession = (session: InterviewSession): void => {
  if (typeof window === "undefined") return;
  
  try {
    const sessions = getSessions();
    sessions.unshift(session);
    localStorage.setItem("interview_sessions", JSON.stringify(sessions.slice(0, 50)));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
};

export const getSessions = (): InterviewSession[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem("interview_sessions");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return [];
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const detectQuestion = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim();
  
  const questionPatterns = [
    /\?$/,
    /^(what|when|where|who|why|how|can you|could you|would you|will you|do you|did you|have you|are you|is there)/i,
    /^tell (me|us) about/i,
    /^describe/i,
    /^explain/i,
    /^give (me|us) an example/i,
    /^walk (me|us) through/i,
    /^share/i,
    /^discuss/i
  ];
  
  return questionPatterns.some(pattern => pattern.test(lowerText));
};

export const generateAISuggestion = (question: string): string => {
  const lowerQ = question.toLowerCase();
  
  // Behavioral questions - STAR method
  if (
    lowerQ.includes("tell me about a time") ||
    lowerQ.includes("describe a situation") ||
    lowerQ.includes("give an example") ||
    lowerQ.includes("when have you")
  ) {
    return "Use the STAR method: Situation (set context), Task (your role), Action (steps you took), Result (outcome & learnings). Be specific with metrics.";
  }
  
  // Strengths/weaknesses
  if (lowerQ.includes("strength") && lowerQ.includes("weakness")) {
    return "For strengths: Pick 2-3 relevant to the role with examples. For weaknesses: Choose a real one you're actively improving, show self-awareness and growth.";
  }
  
  if (lowerQ.includes("strength")) {
    return "Choose 2-3 strengths directly relevant to this role. Back each with a specific example showing impact. Connect them to how you'll add value.";
  }
  
  if (lowerQ.includes("weakness")) {
    return "Pick a genuine area for improvement (not disguised strength). Explain steps you're taking to improve. Show self-awareness and commitment to growth.";
  }
  
  // About yourself
  if (
    lowerQ.includes("tell me about yourself") ||
    lowerQ.includes("introduce yourself") ||
    lowerQ.includes("background")
  ) {
    return "Present-Past-Future format: Current role/status (30 sec), relevant background (45 sec), why you're excited about this opportunity (15 sec). Keep under 90 seconds total.";
  }
  
  // Why this company
  if (
    lowerQ.includes("why do you want to work here") ||
    lowerQ.includes("why this company") ||
    lowerQ.includes("interested in our company")
  ) {
    return "Show you've researched them: Company values alignment, specific products/initiatives that excite you, how your skills match their needs. Be genuine and specific.";
  }
  
  // Conflict/disagreement
  if (
    lowerQ.includes("conflict") ||
    lowerQ.includes("disagree") ||
    lowerQ.includes("difficult person")
  ) {
    return "Use STAR to show emotional intelligence: Focus on resolution, not blame. Highlight communication, empathy, and finding common ground. End with positive outcome.";
  }
  
  // Leadership
  if (lowerQ.includes("lead") || lowerQ.includes("manage")) {
    return "Share example with: Team size/context, your leadership approach, how you motivated others, measurable results. Show you can both lead and collaborate.";
  }
  
  // Failure/mistake
  if (lowerQ.includes("fail") || lowerQ.includes("mistake")) {
    return "Choose a real failure (not disguised success). Own it completely. Focus on what you learned and how you've applied those lessons. Show resilience and growth.";
  }
  
  // Technical skills
  if (
    lowerQ.includes("technical") ||
    lowerQ.includes("technology") ||
    lowerQ.includes("tools") ||
    lowerQ.includes("programming")
  ) {
    return "List relevant technologies/tools with proficiency levels. Give brief example of recent project using them. Mention what you're currently learning.";
  }
  
  // Future goals
  if (
    lowerQ.includes("5 years") ||
    lowerQ.includes("career goals") ||
    lowerQ.includes("future")
  ) {
    return "Show ambition aligned with company growth. Mention skills you want to develop, impact you want to make. Balance personal goals with how you'll contribute to team.";
  }
  
  // Questions for interviewer
  if (
    lowerQ.includes("questions for me") ||
    lowerQ.includes("questions for us") ||
    lowerQ.includes("any questions")
  ) {
    return "Ask about: Team dynamics, success metrics for this role, challenges the team faces, growth opportunities, company culture. Avoid salary/benefits in first round.";
  }
  
  // Problem-solving
  if (
    lowerQ.includes("solve") ||
    lowerQ.includes("approach") ||
    lowerQ.includes("handle")
  ) {
    return "Walk through your process: Understand the problem, gather information, consider options, choose solution, implement, measure results. Show logical thinking.";
  }
  
  // Default suggestion
  return "Structure your answer: Brief context, your specific actions/role, concrete results/impact. Use numbers when possible. Keep it concise (1-2 minutes) and relevant to the role.";
};

export const getCommonQuestions = (): string[] => {
  return [
    "Tell me about yourself",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Why do you want to work here?",
    "Where do you see yourself in 5 years?",
    "Tell me about a time you faced a challenge at work",
    "Describe a situation where you had to work with a difficult person",
    "Give me an example of a goal you set and how you achieved it",
    "Tell me about a time you failed",
    "Why should we hire you?",
    "What's your leadership style?",
    "How do you handle stress and pressure?",
    "Describe a time you had to learn something new quickly",
    "Tell me about a time you went above and beyond",
    "How do you prioritize tasks when everything is urgent?"
  ];
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
