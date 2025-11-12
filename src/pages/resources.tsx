
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, FileText, Lightbulb, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
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
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/interview">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                  Start Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Interview Resources
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Master interview skills with our comprehensive guides and tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 hover:border-blue-400 transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>STAR Method Guide</CardTitle>
              </div>
              <CardDescription>
                Master the Situation-Task-Action-Result framework for behavioral interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">Situation (S)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Set the context by describing the situation or challenge you faced
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">Task (T)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Explain your role and what you needed to accomplish
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">Action (A)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detail the specific steps you took to address the situation
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">Result (R)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Share the outcomes and what you learned
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-cyan-400 transition-all">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <CardTitle>Common Questions</CardTitle>
              </div>
              <CardDescription>
                Prepare for the most frequently asked interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">1</Badge>
                  <span className="text-slate-700 dark:text-slate-300">Tell me about yourself</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">2</Badge>
                  <span className="text-slate-700 dark:text-slate-300">What are your strengths and weaknesses?</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">3</Badge>
                  <span className="text-slate-700 dark:text-slate-300">Why do you want to work here?</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">4</Badge>
                  <span className="text-slate-700 dark:text-slate-300">Describe a challenging situation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">5</Badge>
                  <span className="text-slate-700 dark:text-slate-300">Where do you see yourself in 5 years?</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Badge variant="secondary" className="mt-0.5">6</Badge>
                  <span className="text-slate-700 dark:text-slate-300">Tell me about a time you failed</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-blue-400 transition-all">
            <CardHeader>
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle className="text-lg">Body Language Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>• Maintain eye contact</p>
              <p>• Sit up straight</p>
              <p>• Use hand gestures naturally</p>
              <p>• Smile genuinely</p>
              <p>• Avoid crossed arms</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-cyan-400 transition-all">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-2" />
              <CardTitle className="text-lg">Follow-Up Strategy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>• Send thank-you within 24h</p>
              <p>• Reference specific topics</p>
              <p>• Reiterate your interest</p>
              <p>• Keep it professional</p>
              <p>• Follow up after 1 week</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-400 transition-all">
            <CardHeader>
              <Video className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <CardTitle className="text-lg">Virtual Interview Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>• Test tech beforehand</p>
              <p>• Proper lighting setup</p>
              <p>• Neutral background</p>
              <p>• Dress professionally</p>
              <p>• Eliminate distractions</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
            <p className="text-lg mb-8 text-blue-50 max-w-2xl mx-auto">
              Put these resources to work with our AI-powered interview co-pilot
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/interview">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Practice Session
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
