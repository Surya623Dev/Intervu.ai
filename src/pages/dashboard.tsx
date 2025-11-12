
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, TrendingUp, Award, Zap, Trash2 } from "lucide-react";
import Link from "next/link";

interface InterviewSession {
  id: string;
  date: string;
  duration: number;
  questionsCount: number;
  transcript: string;
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem("interviewSessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      calculateStats(parsedSessions);
    }
  }, []);

  const calculateStats = (sessionData: InterviewSession[]) => {
    const totalSessions = sessionData.length;
    const totalDuration = sessionData.reduce((acc, session) => acc + session.duration, 0);
    const totalQuestions = sessionData.reduce((acc, session) => acc + session.questionsCount, 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    setStats({
      totalSessions,
      totalDuration,
      averageDuration,
      totalQuestions
    });
  };

  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem("interviewSessions", JSON.stringify(updatedSessions));
    calculateStats(updatedSessions);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Header */}
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
              <Link href="/interview">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Start Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Interview Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Track your progress and review past interviews
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Sessions
              </CardTitle>
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalSessions}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Practice interviews completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Time
              </CardTitle>
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatDuration(stats.totalDuration)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Time spent practicing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg. Duration
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatDuration(stats.averageDuration)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Per interview session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Questions Answered
              </CardTitle>
              <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalQuestions}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Total questions practiced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interview History */}
        <Card>
          <CardHeader>
            <CardTitle>Interview History</CardTitle>
            <CardDescription>Review your past practice sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Sessions</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <Card key={session.id} className="border-2 hover:border-blue-400 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">
                                {new Date(session.date).toLocaleDateString()}
                              </Badge>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {formatDuration(session.duration)}
                              </span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {session.questionsCount} questions
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                              {session.transcript || "No transcript available"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No interviews yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Start your first practice interview to see your history here
                    </p>
                    <Link href="/interview">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                        Start First Interview
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                {sessions.slice(0, 5).length > 0 ? (
                  sessions.slice(0, 5).map((session) => (
                    <Card key={session.id} className="border-2 hover:border-blue-400 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary">
                                {new Date(session.date).toLocaleDateString()}
                              </Badge>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {formatDuration(session.duration)}
                              </span>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {session.questionsCount} questions
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                              {session.transcript || "No transcript available"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-600 dark:text-slate-400">
                      No recent interviews to display
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
