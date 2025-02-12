Para implementar essa funcionalidade, precisamos fazer algumas alterações no código. Vamos adicionar uma nova função `sendMessage` no arquivo `endpoints.ts` para chamar a API `/send-message`. Em seguida, vamos atualizar o componente `ChatArea.tsx` para usar essa função ao enviar uma mensagem.

### frontend/src/api/endpoints.ts [coder:save]
```
import type { Conversation, Prompt, ApiResponse, Message } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchPrompts(): Promise<ApiResponse<Prompt[]>> {
  const response = await fetch(`${API_BASE_URL}/list-prompt`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return {
    success: response.ok,
    data: response.ok ? data : undefined,
    error: response.ok ? undefined : data.detail,
  };
}

export async function saveSelectedPrompts(prompts: Prompt[]): Promise<ApiResponse<Prompt>> {
  const response = await fetch(`${API_BASE_URL}/create-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompts),
  });

  const data = await response.json();
  return {
    success: response.ok,
    data: response.ok ? data : undefined,
    error: response.ok ? undefined : data.detail,
  };
}

export const createNewChat = async (): Promise<{ success: boolean; data: Conversation; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  const newChat: Conversation = {
    id: Math.random().toString(36).substring(7),
    title: 'New Conversation',
    lastMessage: 'How can I help you today?',
    isFavorite: false,
    messages: []
  };
  return { success: true, data: newChat };
};

export async function sendMessage(prompt: string): Promise<ApiResponse<Message>> {
  const response = await fetch(`${API_BASE_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return {
    success: response.ok,
    data: response.ok ? data : undefined,
    error: response.ok ? undefined : data.detail,
  };
}
```
[coder:end]

### frontend/src/components/ChatArea.tsx [coder:save]
```
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import type { Conversation, Message, Prompt } from '../types';
import { sendMessage } from '../api/endpoints';

interface ChatAreaProps {
  conversation: Conversation;
  onSendMessage: (content: string) => void;
  isWaitingResponse: boolean;
  selectedPrompt: Prompt | null;
}

export function ChatArea({ conversation, onSendMessage, isWaitingResponse, selectedPrompt }: ChatAreaProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const [waitingResponse, setWaitingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  useEffect(() => {
    if (selectedPrompt) {
      setCurrentMessage(selectedPrompt.prompt);
    }
  }, [selectedPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim() && !waitingResponse) {
      onSendMessage(currentMessage);
      setWaitingResponse(true);
      const response = await sendMessage(currentMessage);
      setWaitingResponse(false);
      if (response.success && response.data) {
        onSendMessage(response.data.content);
      }
      setCurrentMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {conversation.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {(conversation.messages || []).map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  message.sender === 'user' ? 'bg-gray-600' : 'bg-blue-500'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={`rounded-lg p-4 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <span
                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 block ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={waitingResponse ? 'Waiting for response...' : 'Type your message...'}
              disabled={waitingResponse}
              className="w-full rounded-lg pl-4 pr-32 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={waitingResponse}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={waitingResponse}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled={waitingResponse}
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!currentMessage.trim() || waitingResponse}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
```
[coder:end]