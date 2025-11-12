
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Monitor, MonitorOff, Zap, Copy, Check, Save, Lightbulb, Settings, Loader2, AlertCircle, Volume2 } from "lucide-react";
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
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectionLog, setDetectionLog] = useState<string[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const processedQuestionsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio level monitoring for visual feedback
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 255) * 100);
    setAudioLevel(normalizedLevel);

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("webkitSpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.maxAlternatives = 1;

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
            const newText = finalTranscript.trim();
            setTranscript(prev => prev + finalTranscript);
            
            // Add to detection log for debugging
            addToDetectionLog(`Heard: "${newText}"`);
            
            // Check if this is a question
            const isQuestion = detectQuestion(newText);
            
            if (isQuestion) {
              const question = newText;
              addToDetectionLog(`✅ QUESTION DETECTED: "${question}"`);
              
              // Only process if we haven't seen this exact question before
              if (!processedQuestionsRef.current.has(question)) {
                processedQuestionsRef.current.add(question);
                setCurrentQuestion(question);
                const newSuggestion = generateAISuggestion(question);
                
                addToDetectionLog(`🤖 Generating AI answer...`);
                // Generate AI answer automatically for this specific question
                handleGenerateAIAnswer(question, newSuggestion);
              } else {
                addToDetectionLog(`⚠️ Question already processed, skipping`);
              }
            } else {
              addToDetectionLog(`ℹ️ Not a question`);
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          addToDetectionLog(`❌ Error: ${event.error}`);
          
          if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone access in your browser settings.");
          } else if (event.error === "no-speech") {
            // Don't show error for no-speech, just log it
            addToDetectionLog(`⚠️ No speech detected (timeout)`);
          } else if (event.error === "network") {
            setError("Network error. Please check your connection.");
          }
        };

        recognitionRef.current.onend = () => {
          // Auto-restart if still supposed to be recording
          if (isRecording) {
            try {
              recognitionRef.current?.start();
              addToDetectionLog(`🔄 Recognition restarted`);
            } catch (err) {
              console.error("Failed to restart recognition:", err);
            }
          }
        };
      } else {
        setSpeechSupported(false);
        setError("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Auto-restart recognition if it stops unexpectedly
  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      const checkInterval = setInterval(() => {
        try {
          // Recognition might have stopped, try to restart
          if (isRecording) {
            recognitionRef.current.start();
          }
        } catch (err) {
          // If it's already running, this will error - that's fine
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }
  }, [isRecording]);

  const addToDetectionLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDetectionLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const handleGenerateAIAnswer = async (question: string, suggestion: string) => {
    const provider = getConfiguredProvider();
    
    if (!provider) {
      setError("AI provider not configured. Please go to Settings to add your API key.");
      addToDetectionLog(`❌ AI provider not configured`);
      return;
    }

    setIsGeneratingAnswer(true);
    setError("");
    addToDetectionLog(`🤖 Generating AI answer for: "${question.substring(0, 50)}..."`);
    
    try {
      const context = transcript.substring(Math.max(0, transcript.length - 500));
      const result = await generateAIAnswer(question, context, provider);
      
      if (result.success && result.answer) {
        // Add this Q&A pair to our collection
        const newQA = {
          question,
          aiAnswer: result.answer,
          suggestion,
          timestamp: new Date()
        };
        
        setQuestionAnswers(prev => [...prev, newQA]);
        addToDetectionLog(`✅ AI answer generated successfully`);
      } else {
        const errorMsg = result.error || "Failed to generate AI answer";
        setError(errorMsg);
        addToDetectionLog(`❌ ${errorMsg}`);
      }
    } catch (err) {
      const errorMsg = "Failed to generate AI answer. Please check your API key.";
      setError(errorMsg);
      addToDetectionLog(`❌ ${errorMsg}`);
      console.error("AI generation error:", err);
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
      try {
        recognitionRef.current?.stop();
        setIsRecording(false);
        setError("");
        addToDetectionLog(`🛑 Recording stopped`);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setError("");
        addToDetectionLog(`🎤 Recording started`);
        
        if (!sessionStartTime) {
          setSessionStartTime(new Date());
          setSessionId(generateSessionId());
        }
      } catch (err) {
        console.error("Error starting recording:", err);
        setError("Failed to start recording. Please try again.");
        addToDetectionLog(`❌ Failed to start recording`);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsScreenSharing(false);
      setAudioLevel(0);
      addToDetectionLog(`🛑 Screen sharing stopped`);
    } else {
      try {
        addToDetectionLog(`📺 Requesting screen share...`);
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 2
          }
        });
        
        screenStreamRef.current = stream;
        setIsScreenSharing(true);
        addToDetectionLog(`✅ Screen sharing started`);
        
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          addToDetectionLog(`🔊 Audio track detected: ${audioTracks[0].label}`);
          
          // Setup audio monitoring
          const ctx = new AudioContext({ sampleRate: 48000 });
          audioContextRef.current = ctx;
          
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;
          
          source.connect(analyser);
          
          // Start monitoring audio levels
          monitorAudioLevel();
          
          // Start recording if not already
          if (!isRecording) {
            addToDetectionLog(`🎤 Auto-starting recording for screen audio`);
            toggleRecording();
          }
          
          addToDetectionLog(`✅ Audio monitoring initialized`);
        } else {
          setError("No audio captured. Make sure to check 'Share audio' when sharing your screen.");
          addToDetectionLog(`⚠️ No audio track in stream - make sure 'Share audio' is checked`);
        }
        
        // Handle when user stops sharing
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setAudioLevel(0);
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          addToDetectionLog(`🛑 Screen sharing ended by user`);
        };
      } catch (err: any) {
        console.error("Error sharing screen:", err);
        const errorMsg = err.name === "NotAllowedError" 
          ? "Screen sharing was cancelled. Please try again and select 'Share audio'."
          : "Failed to share screen. Make sure to select 'Share audio' checkbox when sharing.";
        setError(errorMsg);
        addToDetectionLog(`❌ ${errorMsg}`);
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
    addToDetectionLog(`💾 Session saved`);
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
      formatted += "## Questions & AI Answers:\n\n";
      questionAnswers.forEach((qa, index) => {
        formatted += `**${index + 1}. ${qa.question}**\n\n`;
        formatted += `*AI Answer Suggestion:*\n${qa.aiAnswer}\n\n`;
        formatted += `*Framework:* ${qa.suggestion}\n\n`;
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
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
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
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Recording Active</span>
                          </div>
                        </div>
                        
                        {/* Audio Level Indicator */}
                        {audioLevel > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Volume2 className="w-3 h-3" />
                                Audio Level
                              </span>
                              <span>{Math.round(audioLevel)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-150"
                                style={{ width: `${audioLevel}%` }}
                              />
                            </div>
                          </div>
                        )}
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
                      Look for the audio level bar above to confirm audio is being captured.
                    </p>
                  </CardContent>
                </Card>

                {/* Detection Log for Debugging */}
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Detection Log</CardTitle>
                    <CardDescription className="text-xs">Real-time debugging info</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
                      {detectionLog.length > 0 ? (
                        detectionLog.map((log, i) => (
                          <div key={i} className="text-slate-600 dark:text-slate-400 break-words">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No activity yet...</div>
                      )}
                    </div>
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
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Badge variant="secondary">{questionAnswers.length}</Badge>
                          Questions & AI Answers:
                        </h3>
                        {questionAnswers.map((qa, index) => (
                          <div key={index} className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {index + 1}. {qa.question}
                            </p>
                            <div className="pl-4 space-y-2 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                                  AI Answer:
                                </p>
                                <p className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded border-l-2 border-emerald-600 text-slate-700 dark:text-slate-300">
                                  {qa.aiAnswer}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                  Framework:
                                </p>
                                <p className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border-l-2 border-blue-600 text-slate-700 dark:text-slate-300">
                                  {qa.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Full Transcript:</h3>
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Full transcript will appear here as you speak..."
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
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
