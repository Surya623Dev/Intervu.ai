
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Monitor, MonitorOff, Zap, Copy, Check, Save, Lightbulb, Settings, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PracticeMode } from "@/components/PracticeMode";
import { generateSessionId, saveSession, detectQuestion, generateAISuggestion } from "@/lib/interviewHelpers";
import { generateAIAnswer, getConfiguredProvider } from "@/lib/aiService";

interface QuestionAnswer {
  question: string;
  aiAnswer: string;
  suggestion: string;
  timestamp: Date;
}

export default function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>([]);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [error, setError] = useState<string>("");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const processedQuestionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("webkitSpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
            
            if (detectQuestion(finalTranscript)) {
              const question = finalTranscript.trim();
              
              // Only process if we haven't seen this question before
              if (!processedQuestionsRef.current.has(question)) {
                processedQuestionsRef.current.add(question);
                setCurrentQuestion(question);
                const newSuggestion = generateAISuggestion(question);
                
                // Generate AI answer automatically for this specific question
                handleGenerateAIAnswer(question, newSuggestion);
              }
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone access in your browser settings.");
          } else if (event.error === "no-speech") {
            setError("No speech detected. Please try speaking again.");
          }
          setIsRecording(false);
        };
      } else {
        setSpeechSupported(false);
        setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleGenerateAIAnswer = async (question: string, suggestion: string) => {
    const provider = getConfiguredProvider();
    
    if (!provider) {
      setError("AI provider not configured. Please go to Settings to add your API key.");
      return;
    }

    setIsGeneratingAnswer(true);
    setError("");
    
    try {
      const context = transcript.substring(Math.max(0, transcript.length - 500));
      const result = await generateAIAnswer(question, context, provider);
      
      if (result.success && result.answer) {
        // Add this Q&A pair to our collection
        setQuestionAnswers(prev => [...prev, {
          question,
          aiAnswer: result.answer || "",
          suggestion,
          timestamp: new Date()
        }]);
      } else {
        setError(result.error || "Failed to generate AI answer");
      }
    } catch (err) {
      setError("Failed to generate AI answer. Please check your API key.");
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) {
      setError("Speech recognition is not available in your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setError("");
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setError("");
        if (!sessionStartTime) {
          setSessionStartTime(new Date());
          setSessionId(generateSessionId());
        }
      } catch (err) {
        console.error("Error starting recording:", err);
        setError("Failed to start recording. Please try again.");
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
        
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          const ctx = new AudioContext();
          setAudioContext(ctx);
          
          const source = ctx.createMediaStreamSource(stream);
          const destination = ctx.createMediaStreamDestination();
          source.connect(destination);
          
          if (!isRecording) {
            toggleRecording();
          }
        } else {
          setError("No audio captured. Make sure to check 'Share audio' when sharing your screen.");
        }
        
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
          }
        };
      } catch (err) {
        console.error("Error sharing screen:", err);
        setError("Failed to share screen. Make sure to select 'Share audio' checkbox when sharing.");
      }
    }
  };

  const saveCurrentSession = () => {
    if (!sessionStartTime || !transcript) return;

    const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000);
    
    saveSession({
      id: sessionId || generateSessionId(),
      date: sessionStartTime.toISOString(),
      duration: duration,
      questionsCount: questionAnswers.length,
      transcript: transcript,
      questions: questionAnswers.map(qa => qa.question)
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormattedTranscript = () => {
    if (!transcript) return "No transcript available yet...";
    
    let formatted = "# Interview Transcript\n\n";
    
    if (questionAnswers.length > 0) {
      formatted += "## Questions Asked:\n\n";
      questionAnswers.forEach((qa, index) => {
        formatted += `**${index + 1}. ${qa.question}**\n\n`;
        formatted += `*AI Answer Suggestion:*\n${qa.aiAnswer}\n\n`;
        formatted += "---\n\n";
      });
    }
    
    formatted += "## Full Transcript:\n\n";
    formatted += transcript;
    
    return formatted;
  };

  // Get the most recent Q&A pair
  const currentQA = questionAnswers[questionAnswers.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AI Co-Pilot
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {sessionStartTime && (
                <Badge variant="secondary" className="text-sm">
                  Session Active • {questionAnswers.length} Questions
                </Badge>
              )}
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 animate-slide-up-fade">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-600 dark:text-red-400 text-sm">{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="live">Live Interview</TabsTrigger>
            <TabsTrigger value="practice">Practice Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Controls</CardTitle>
                    <CardDescription>Manage your interview session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={toggleRecording}
                      className={`w-full ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"}`}
                      size="lg"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={toggleScreenShare}
                      variant={isScreenSharing ? "destructive" : "outline"}
                      className="w-full"
                      size="lg"
                    >
                      {isScreenSharing ? (
                        <>
                          <MonitorOff className="w-5 h-5 mr-2" />
                          Stop Sharing
                        </>
                      ) : (
                        <>
                          <Monitor className="w-5 h-5 mr-2" />
                          Share Screen + Audio
                        </>
                      )}
                    </Button>

                    {transcript && (
                      <Button
                        onClick={saveCurrentSession}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        {saved ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Session
                          </>
                        )}
                      </Button>
                    )}

                    {isRecording && (
                      <div className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording Active</span>
                      </div>
                    )}
                    
                    {isScreenSharing && (
                      <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Screen Sharing Active</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audio Capture Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-900 dark:text-white">To capture meeting audio:</p>
                    <p>1. Click "Share Screen + Audio"</p>
                    <p>2. Select your meeting window/tab</p>
                    <p>3. ✓ Check "Share audio" option</p>
                    <p>4. Click "Share"</p>
                    <p className="pt-2 text-xs text-slate-500">
                      Need help? Visit Settings for alternative options.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p>• Speak clearly and at a moderate pace</p>
                    <p>• Keep answers structured and concise</p>
                    <p>• Use the STAR method for behavioral questions</p>
                    <p>• Make eye contact with the interviewer</p>
                    <p>• Ask clarifying questions if needed</p>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Question</CardTitle>
                    <CardDescription>What the interviewer is asking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentQuestion ? (
                      <div className="relative">
                        <p className="text-lg font-medium text-slate-900 dark:text-white mb-2 pr-12">
                          {currentQuestion}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(currentQuestion)}
                          className="absolute top-0 right-0"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        {isRecording ? "Listening for questions..." : "Start recording to detect questions"}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-200 dark:border-emerald-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <CardTitle>AI-Generated Answer</CardTitle>
                      </div>
                      {currentQuestion && (
                        <Button
                          onClick={() => handleGenerateAIAnswer(currentQuestion, generateAISuggestion(currentQuestion))}
                          size="sm"
                          disabled={isGeneratingAnswer}
                        >
                          {isGeneratingAnswer ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Regenerate"
                          )}
                        </Button>
                      )}
                    </div>
                    <CardDescription>Personalized answer suggestion from AI</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isGeneratingAnswer ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                      </div>
                    ) : currentQA?.aiAnswer ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border-l-4 border-emerald-600">
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentQA.aiAnswer}</p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(currentQA.aiAnswer)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          Copy Answer
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500 dark:text-slate-400 italic mb-4">
                          AI answers will appear here when questions are detected
                        </p>
                        {!getConfiguredProvider() && (
                          <Link href="/settings">
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Configure AI Provider
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle>Answer Framework</CardTitle>
                    </div>
                    <CardDescription>Structure your response effectively</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentQA?.suggestion ? (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-600">
                        <p className="text-slate-700 dark:text-slate-300">{currentQA.suggestion}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        Answer frameworks will appear here based on question type
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Interview Transcript</CardTitle>
                        <CardDescription>Formatted conversation log with Q&A</CardDescription>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(getFormattedTranscript())}
                        variant="outline"
                        size="sm"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        Copy Full Transcript
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {questionAnswers.length > 0 && (
                      <div className="space-y-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Questions & Answers:</h3>
                        {questionAnswers.map((qa, index) => (
                          <div key={index} className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {index + 1}. {qa.question}
                            </p>
                            <div className="pl-4 text-sm text-slate-600 dark:text-slate-400">
                              <p className="italic mb-1">AI Suggestion:</p>
                              <p className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded border-l-2 border-emerald-600">
                                {qa.aiAnswer}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Full transcript will appear here as you speak..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice">
            <PracticeMode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
