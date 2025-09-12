"use client";

import React, { useState, useEffect, useRef, FormEvent, memo } from 'react';
import { Loader2, Send } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scrollarea";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

const USER_ID = 'user123';
const BOT_ID = 'bot';
const BOT_GREETING: Message = {
  id: '1',
  text: 'Hello! How are you feeling today?',
  senderId: BOT_ID,
  timestamp: new Date(),
};

const ChatMessage = memo(({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => {
  const senderName = isCurrentUser ? 'You' : message.senderId;
  const avatarFallback = senderName.slice(0, 2).toUpperCase();

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
    // Only scroll down if the last message was from the current user.
    // This prevents the view from scrolling down on a bot response.
    if (lastMessage?.senderId === USER_ID) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.senderId === USER_ID) {
      setLoading(true);
      const timer = setTimeout(() => {
        const botResponse: Message = {
          id: Date.now().toString(),
          text: "Thank you for sharing that. I'm here to listen whenever you need.",
          senderId: BOT_ID,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setLoading(false);
      }, 1500); // 1.5-second delay

      return () => clearTimeout(timer);
    }
  }, [messages]);

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
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col space-y-4 pr-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === USER_ID} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <Button size="icon" type="submit" disabled={loading || input.trim() === ''} className="flex-shrink-0">
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
            </LineChart>
          </ChartContainer>
        </Card>
      )}

      {/* Crisis Support Section */}
      <div className="w-full max-w-md mt-8 p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3 text-center flex items-center justify-center gap-2">
          <IconSos className="h-5 w-5" />
          Need Support?
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4 text-center">
          If you&apos;re struggling, help is available 24/7
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 flex items-center gap-2"
              onClick={() => window.open('tel:988', '_blank')}
            >
              <IconPhone className="h-4 w-4" />
              Call 988 Crisis Line
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 flex items-center gap-2"
              onClick={() => window.open('sms:741741', '_blank')}
            >
              <IconMessage className="h-4 w-4" />
              Text HOME to 741741
            </Button>
          </div>
          <div className="text-center">
            <Button 
              size="sm" 
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => window.open('tel:911', '_blank')}
            >
              <IconAlertTriangle className="h-4 w-4" />
              Emergency: Call 911
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MoodIndex;
