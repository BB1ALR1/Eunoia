import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, UserCheck } from "lucide-react";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  therapistName: string;
  onSendMessage: (content: string, isVoice: boolean) => void;
  messages: Message[];
  isLoading: boolean;
}

export default function ChatInterface({ 
  therapistName, 
  onSendMessage, 
  messages, 
  isLoading 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim(), false);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to your session with {therapistName}
            </h3>
            <p className="text-muted-foreground">
              Start by sharing what's on your mind today. I'm here to listen and support you.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex items-start space-x-3 ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!message.isUser && (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`flex-1 max-w-xs md:max-w-md ${message.isUser ? 'order-1' : ''}`}>
                <Card className={`
                  ${message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent/10 border-accent/20'
                  }
                `}>
                  <CardContent className="p-4">
                    {!message.isUser && (
                      <p className="text-sm font-semibold text-accent mb-1">
                        {therapistName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </CardContent>
                </Card>
                <p className={`text-xs text-muted-foreground mt-1 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.createdAt || new Date())}
                </p>
              </div>
              
              {message.isUser && (
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <Card className="bg-accent/10 border-accent/20">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-accent mb-1">
                    {therapistName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span className="text-sm text-muted-foreground ml-2">
                      typing...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-border p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="pr-12"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
