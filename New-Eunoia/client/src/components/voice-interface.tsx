import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Pause, 
  Lightbulb, 
  User, 
  UserCheck 
} from "lucide-react";
import { useSpeech } from "@/hooks/use-speech";
import type { Message } from "@shared/schema";

interface VoiceInterfaceProps {
  therapistName: string;
  onSendMessage: (content: string, isVoice: boolean) => void;
  messages: Message[];
  isLoading: boolean;
  sessionEnded?: boolean;
}

export default function VoiceInterface({ 
  therapistName, 
  onSendMessage, 
  messages, 
  isLoading,
  sessionEnded = false 
}: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [lastAIResponse, setLastAIResponse] = useState("");
  
  const { 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking,
    isListening, 
    isSupported 
  } = useSpeech();

  // Get latest AI response
  useEffect(() => {
    const latestAIMessage = messages
      .filter(m => m.role === 'assistant')
      .slice(-1)[0];
    
    if (latestAIMessage && latestAIMessage.content !== lastAIResponse) {
      setLastAIResponse(latestAIMessage.content);
      // Auto-speak the response
      speak(latestAIMessage.content);
    }
  }, [messages, lastAIResponse, speak]);

  // Stop all speech when session ends
  useEffect(() => {
    if (sessionEnded) {
      stopSpeaking();
      stopListening();
    }
  }, [sessionEnded, stopSpeaking, stopListening]);

  // Cleanup effect when component unmounts or mode changes
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  const handleStartRecording = async () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    setIsRecording(true);
    setCurrentTranscript("");
    
    try {
      const transcript = await startListening();
      setCurrentTranscript(transcript);
      
      if (transcript.trim()) {
        onSendMessage(transcript, true);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopListening();
    
    if (currentTranscript.trim()) {
      onSendMessage(currentTranscript, true);
    }
  };

  const handleRepeatResponse = () => {
    if (lastAIResponse) {
      speak(lastAIResponse);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const latestUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
  const latestAIMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Therapist Avatar */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <UserCheck className="text-white text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {therapistName} is listening
          </h2>
          <p className="text-muted-foreground">
            {isRecording ? "I'm listening..." : "Tap the button below to start talking"}
          </p>
        </div>
        
        {/* Voice Recording Button */}
        <div className="mb-8">
          <Button
            onClick={toggleRecording}
            disabled={isLoading || !isSupported}
            className={`
              w-24 h-24 rounded-full shadow-lg transition-all transform hover:scale-105 
              focus:outline-none focus:ring-4 focus:ring-primary/30
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-primary hover:bg-primary/90'
              }
            `}
          >
            {isRecording ? (
              <MicOff className="text-white text-2xl" />
            ) : (
              <Mic className="text-white text-2xl" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {isRecording ? "Recording... tap to stop" : "Tap to speak"}
          </p>
        </div>
        
        {/* Recording Status */}
        {isRecording && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Recording...</span>
              </div>
              <p className="text-sm text-blue-700">
                {currentTranscript || "Listening for your voice..."}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Latest User Message */}
        {latestUserMessage && !isRecording && (
          <Card className="mb-6 bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <User className="w-6 h-6 text-primary mt-1" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-primary mb-1">You said:</p>
                  <p className="text-sm text-foreground">{latestUserMessage.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* AI Response */}
        {latestAIMessage && !isRecording && (
          <Card className="mb-6 bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <UserCheck className="w-6 h-6 text-accent mt-1" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-accent mb-1">{therapistName}</p>
                  <p className="text-sm text-foreground">{latestAIMessage.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="text-sm text-muted-foreground ml-2">
                  {therapistName} is thinking...
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            disabled={isLoading}
          >
            <Pause className="w-4 h-4 mr-2" />
            {isRecording ? "Pause" : "Resume"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRepeatResponse}
            disabled={!lastAIResponse}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Repeat Response
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-accent/10 text-accent hover:bg-accent/20"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Coping Tool
          </Button>
        </div>
        
        {/* Browser Support Warning */}
        {!isSupported && (
          <Card className="mt-6 bg-warning/10 border-warning/20">
            <CardContent className="p-4">
              <p className="text-sm text-warning">
                Voice recognition is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari for the best experience.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
