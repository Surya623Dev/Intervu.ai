
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Key, Check, AlertCircle, ExternalLink, Mic } from "lucide-react";
import Link from "next/link";
import { saveAPIKey, saveProviderPreference, getConfiguredProvider } from "@/lib/aiService";

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "groq" | "anthropic" | "gemini">("gemini");
  const [saved, setSaved] = useState(false);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOpenaiKey(localStorage.getItem("openai_api_key") || "");
      setGroqKey(localStorage.getItem("groq_api_key") || "");
      setAnthropicKey(localStorage.getItem("anthropic_api_key") || "");
      setGeminiKey(localStorage.getItem("gemini_api_key") || "");
      
      const savedProvider = getConfiguredProvider();
      if (savedProvider) setProvider(savedProvider);
    }

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInputs = devices.filter(device => device.kind === "audioinput");
      setAudioInputDevices(audioInputs);
    });
  }, []);

  const handleSave = () => {
    if (openaiKey) saveAPIKey("openai", openaiKey);
    if (groqKey) saveAPIKey("groq", groqKey);
    if (anthropicKey) saveAPIKey("anthropic", anthropicKey);
    if (geminiKey) saveAPIKey("gemini", geminiKey);
    saveProviderPreference(provider);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
            <Link href="/interview">
              <Button>Back to Interview</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure your AI provider and audio settings</p>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="audio">Audio Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  <CardTitle>AI Provider Setup</CardTitle>
                </div>
                <CardDescription>
                  Configure your AI API key to get personalized interview answer suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Recommended:</strong> Google Gemini offers free API access with generous limits. Get your free API key at{" "}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">
                      aistudio.google.com <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider">AI Provider</Label>
                    <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini (Free & Fast) 🌟</SelectItem>
                        <SelectItem value="groq">Groq (Free & Fast) ⚡</SelectItem>
                        <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {provider === "gemini" && (
                    <div className="space-y-2">
                      <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                      <Input
                        id="gemini-key"
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="AIza..."
                      />
                      <p className="text-sm text-slate-500">
                        Free tier: 1500 requests/day. Get your key at{" "}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          aistudio.google.com/app/apikey
                        </a>
                      </p>
                    </div>
                  )}

                  {provider === "groq" && (
                    <div className="space-y-2">
                      <Label htmlFor="groq-key">Groq API Key</Label>
                      <Input
                        id="groq-key"
                        type="password"
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="gsk_..."
                      />
                      <p className="text-sm text-slate-500">
                        Free tier: 30 requests/min. Get your key at{" "}
                        <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          console.groq.com/keys
                        </a>
                      </p>
                    </div>
                  )}

                  {provider === "openai" && (
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                      <p className="text-sm text-slate-500">
                        Get your API key from{" "}
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          platform.openai.com/api-keys
                        </a>
                      </p>
                    </div>
                  )}

                  {provider === "anthropic" && (
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <Input
                        id="anthropic-key"
                        type="password"
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        placeholder="sk-ant-..."
                      />
                      <p className="text-sm text-slate-500">
                        Get your API key from{" "}
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          console.anthropic.com
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                <Button onClick={handleSave} className="w-full" size="lg">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Saved Successfully!
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <CardTitle>Audio Capture Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure audio input for capturing interview questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>System Audio Limitation:</strong> Browsers cannot directly capture system audio (like Zoom/Teams) for security reasons.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Options for Capturing Meeting Audio:</h3>
                  
                  <div className="space-y-3">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Option 1: Screen Share with Audio (Recommended)</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          When you click "Share Screen", select the "Share audio" checkbox. This captures audio from the shared tab/window.
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          ✓ Works in most browsers • ✓ No extra software needed
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Option 2: Virtual Audio Cable (Advanced)</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Install virtual audio cable software to route system audio as a microphone input:
                        </p>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-disc">
                          <li>Windows: VB-Audio Virtual Cable</li>
                          <li>Mac: BlackHole or Loopback</li>
                          <li>Linux: PulseAudio Virtual Sink</li>
                        </ul>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                          ⚙️ Requires software installation • ⚙️ More setup needed
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Option 3: External Microphone</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Place a microphone near your speakers to capture audio output. Simple but may capture background noise.
                        </p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                          🎤 Simplest solution • ⚠️ Lower audio quality
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="pt-4">
                    <Label htmlFor="audio-device">Microphone Device</Label>
                    <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                      <SelectTrigger id="audio-device">
                        <SelectValue placeholder="Select audio device" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioInputDevices.map(device => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
