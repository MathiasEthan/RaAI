"use client";

import React, { useState, useEffect, useRef, FormEvent, memo } from 'react';
import { Loader2, Send } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scrollarea";
import { Badge } from "@/components/ui/badge";
import { apiClient, errorUtils } from "@/lib/api";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  moodScore?: number;
  analysis?: {
    emotions: Array<{ label: string; score: number }>;
    sentiment: number;
  };
}

const USER_ID = 'user123';
const BOT_ID = 'bot';
const BOT_GREETING: Message = {
  id: '1',
  text: 'Hello! How are you feeling today? Share what\'s on your mind and I\'ll help you understand your emotions better.',
  senderId: BOT_ID,
  timestamp: new Date(),
};

const ChatMessage = memo(({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => {
  const avatarFallback = isCurrentUser ? 'YU' : 'AI';

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isCurrentUser && "justify-end"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] flex flex-col rounded-xl p-3",
          isCurrentUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-bl-none"
        )}
      >
        <p className="text-sm">{message.text}</p>
        
        {/* Mood Analysis Display */}
        {message.moodScore !== undefined && (
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium">Mood Score:</span>
              <Badge variant="secondary" className="text-xs">
                {message.moodScore.toFixed(1)}/10
              </Badge>
            </div>
            {message.analysis && message.analysis.emotions.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium">Top Emotions:</span>
                <div className="flex flex-wrap gap-1">
                  {message.analysis.emotions.slice(0, 3).map((emotion, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {emotion.label} ({Math.round(emotion.score * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs mt-1 self-end opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';

const MoodIndex = () => {
  const [messages, setMessages] = useState<Message[]>([BOT_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Scroll down when new messages are added
    if (lastMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.senderId === USER_ID && !loading) {
      generateBotResponse(lastMessage.text);
    }
  }, [messages, loading]);

  const generateBotResponse = async (userMessage: string) => {
    setLoading(true);
    
    try {
      // Analyze the user's message for mood and emotions
      const analysisResult = await apiClient.analyzeJournalEntry(userMessage);
      const moodResult = await apiClient.getMoodScore(userMessage);
      
      let responseText = "Thank you for sharing that with me. ";
      
      if (analysisResult.safety.label === 'ESCALATE') {
        responseText = "I'm concerned about what you've shared. Please know that support is available if you need it. Would you like me to provide some crisis resources?";
      } else if (analysisResult.analysis) {
        const analysis = analysisResult.analysis;
        const topEmotion = analysis.emotions[0];
        const sentiment = analysis.sentiment;
        
        if (sentiment > 0.2) {
          responseText += `I can sense some positive emotions in what you've shared, particularly ${topEmotion?.label.toLowerCase()}. `;
        } else if (sentiment < -0.2) {
          responseText += `It sounds like you're going through a challenging time. I noticed some ${topEmotion?.label.toLowerCase()} in your message. `;
        } else {
          responseText += `I can hear the mixed emotions in what you've shared. `;
        }
        
        responseText += "How are you feeling about this situation right now?";
        
        if (analysisResult.recommendation) {
          responseText += ` I have a suggestion for a ${analysisResult.recommendation.duration} exercise that might help.`;
        }
      }

      const botResponse: Message = {
        id: Date.now().toString(),
        text: responseText,
        senderId: BOT_ID,
        timestamp: new Date(),
      };

      // Add user message with analysis
      setMessages(prev => {
        const updated = [...prev];
        const lastUserMessage = updated[updated.length - 1];
        if (lastUserMessage.senderId === USER_ID) {
          lastUserMessage.moodScore = moodResult.score;
          lastUserMessage.analysis = analysisResult.analysis ? {
            emotions: analysisResult.analysis.emotions,
            sentiment: analysisResult.analysis.sentiment
          } : undefined;
        }
        return [...updated, botResponse];
      });

    } catch (error) {
      errorUtils.handleApiError(error, "Mood analysis");
      
      // Fallback response
      const botResponse: Message = {
        id: Date.now().toString(),
        text: "I'm here to listen. Can you tell me more about how you're feeling?",
        senderId: BOT_ID,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || loading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      senderId: USER_ID,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
      <div className="flex-1 overflow-hidden p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl h-full flex flex-col rounded-xl shadow-md bg-gray-50 dark:bg-gray-900">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-center">Mood Journal</h1>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-1">
              AI-powered emotional insight and support
            </p>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col space-y-4 pr-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === USER_ID} />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span className="text-sm">Analyzing your message...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                placeholder="Share what's on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <Button size="icon" type="submit" disabled={loading || input.trim() === ''} className="flex-shrink-0">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your conversations are analyzed to provide emotional insights and support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodIndex