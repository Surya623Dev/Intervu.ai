import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, User, Briefcase, Target, MessageCircle, Code } from "lucide-react";
import { generateAISuggestion } from "@/lib/interviewHelpers";

interface Question {
  id: string;
  question: string;
  category: string;
}

export function PracticeMode() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const questionsByCategory = {
    behavioral: [
      { id: "b1", question: "Tell me about a time you faced a significant challenge at work", category: "behavioral" },
      { id: "b2", question: "Describe a situation where you had to work with a difficult team member", category: "behavioral" },
      { id: "b3", question: "Give me an example of a goal you set and how you achieved it", category: "behavioral" },
      { id: "b4", question: "Tell me about a time you failed and what you learned", category: "behavioral" },
      { id: "b5", question: "Describe a time you went above and beyond your job duties", category: "behavioral" },
      { id: "b6", question: "Tell me about a time you had to adapt to change quickly", category: "behavioral" },
    ],
    introduction: [
      { id: "i1", question: "Tell me about yourself", category: "introduction" },
      { id: "i2", question: "Walk me through your resume", category: "introduction" },
      { id: "i3", question: "What interests you about this role?", category: "introduction" },
      { id: "i4", question: "Why are you looking for a new opportunity?", category: "introduction" },
    ],
    strengths: [
      { id: "s1", question: "What are your greatest strengths?", category: "strengths" },
      { id: "s2", question: "What is your biggest weakness?", category: "strengths" },
      { id: "s3", question: "Why should we hire you?", category: "strengths" },
      { id: "s4", question: "What makes you unique compared to other candidates?", category: "strengths" },
    ],
    leadership: [
      { id: "l1", question: "Describe your leadership style", category: "leadership" },
      { id: "l2", question: "Tell me about a time you had to motivate a team", category: "leadership" },
      { id: "l3", question: "How do you handle conflicts within your team?", category: "leadership" },
      { id: "l4", question: "Give an example of a difficult decision you had to make", category: "leadership" },
    ],
    technical: [
      { id: "t1", question: "What technologies are you most comfortable with?", category: "technical" },
      { id: "t2", question: "Describe your development process", category: "technical" },
      { id: "t3", question: "How do you stay updated with new technologies?", category: "technical" },
      { id: "t4", question: "Tell me about a complex technical problem you solved", category: "technical" },
    ],
    future: [
      { id: "f1", question: "Where do you see yourself in 5 years?", category: "future" },
      { id: "f2", question: "What are your career goals?", category: "future" },
      { id: "f3", question: "What do you hope to accomplish in your first 90 days?", category: "future" },
      { id: "f4", question: "What questions do you have for me?", category: "future" },
    ],
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "behavioral": return <MessageCircle className="w-4 h-4" />;
      case "introduction": return <User className="w-4 h-4" />;
      case "strengths": return <Target className="w-4 h-4" />;
      case "leadership": return <Briefcase className="w-4 h-4" />;
      case "technical": return <Code className="w-4 h-4" />;
      case "future": return <Lightbulb className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "behavioral": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "introduction": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "strengths": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case "leadership": return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      case "technical": return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300";
      case "future": return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300";
      default: return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Practice Interview Questions</CardTitle>
          <CardDescription>
            Select a question category and practice your responses with AI-powered suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="behavioral" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto">
              <TabsTrigger value="behavioral" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Behavioral</span>
              </TabsTrigger>
              <TabsTrigger value="introduction" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Intro</span>
              </TabsTrigger>
              <TabsTrigger value="strengths" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Strengths</span>
              </TabsTrigger>
              <TabsTrigger value="leadership" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Leadership</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Technical</span>
              </TabsTrigger>
              <TabsTrigger value="future" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Future</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(questionsByCategory).map(([category, questions]) => (
              <TabsContent key={category} value={category} className="space-y-3 mt-6">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border-2 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer bg-white dark:bg-slate-900"
                    onClick={() => setSelectedQuestion(q)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{q.question}</p>
                      </div>
                      <Badge className={getCategoryColor(category)}>
                        {getCategoryIcon(category)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {selectedQuestion && (
        <Card className="border-2 border-blue-400 dark:border-blue-600 animate-slide-up-fade">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl mb-2">{selectedQuestion.question}</CardTitle>
                <Badge className={getCategoryColor(selectedQuestion.category)}>
                  {getCategoryIcon(selectedQuestion.category)}
                  <span className="ml-2 capitalize">{selectedQuestion.category}</span>
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuestion(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    AI Suggestion
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {generateAISuggestion(selectedQuestion.question)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
