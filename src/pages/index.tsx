import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Video, FileText, Zap, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AI Co-Pilot
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/resources">
                <Button variant="ghost">Resources</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/interview">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Start Interview
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                100% Free & Privacy-First
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-slate-900 dark:text-white">Ace Your Next</span>
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Interview with AI
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300">
            Your intelligent interview companion that provides real-time assistance,
            answer suggestions, and helps you perform your best in any interview.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/interview">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-lg px-8 py-6">
                <Mic className="w-5 h-5 mr-2" />
                Start Practice Interview
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Everything you need to excel in interviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Real-Time Transcription</CardTitle>
              <CardDescription>
                Automatically transcribe interview questions and your responses in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>AI Answer Suggestions</CardTitle>
              <CardDescription>
                Get intelligent answer suggestions based on the questions asked
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Screen & Audio Capture</CardTitle>
              <CardDescription>
                Capture interview audio and screen content for comprehensive assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>
                Review past interviews, questions, and your responses for improvement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                All processing happens locally. Your data never leaves your device
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>
                Practice with common interview questions and get instant feedback
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Excel?</h2>
            <p className="text-xl mb-8 text-blue-50">
              Start your first practice interview now and experience the power of AI assistance
            </p>
            <Link href="/interview">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Mic className="w-5 h-5 mr-2" />
                Launch Interview Co-Pilot
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>© {new Date().getFullYear()} AI Co-Pilot. Free forever, privacy-first interview assistance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
