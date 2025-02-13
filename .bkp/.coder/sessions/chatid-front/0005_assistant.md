O erro indica que o servidor está esperando que os dados sejam enviados no corpo da requisição (`body`) e não como parâmetros de consulta (`query parameters`). Vamos corrigir isso para enviar os dados no corpo da requisição.

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
  const response = await fetch(`${API_BASE_URL}/new-conversation`, {
    method: 'POST',
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
};

export async function sendMessage(prompt: string, chatId: string): Promise<ApiResponse<Message>> {
  const response = await fetch(`${API_BASE_URL}/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, chatId }),
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
      setWaitingResponse(true);
      const response = await sendMessage(currentMessage, conversation.id);
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

### frontend/src/App.tsx [coder:save]
```
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import type { Conversation, Message, Prompt } from './types';
import { sendMessage, createNewChat } from './api/endpoints';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'React Performance Optimization',
      lastMessage: 'How can I improve render performance?',
      isFavorite: true,
      messages: [
        {
          id: '1',
          content: 'How can I improve render performance?',
          sender: 'user',
          timestamp: '2024-02-28T11:32:00Z'
        },
        {
          id: '2',
          content: 'Para melhorar a performance de listas grandes em React, você pode considerar:\n\n- Usar virtualização com react-window ou react-virtualized\n- Implementar React.memo() para evitar re-renders desnecessários\n- Utilizar useMemo() para valores computados\n- Paginar os dados quando possível\n\nQual dessas abordagens você gostaria de explorar primeiro?',
          sender: 'ai',
          timestamp: '2024-02-28T11:33:00Z'
        }
      ]
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('1');
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleFavorite = (conversationId: string) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isFavorite: !conv.isFavorite }
        : conv
    ));
  };

  const handleNewChat = async () => {
    try {
      const response = await createNewChat();
      if (response.success) {
        const newConversation = response.data;
        setConversations([newConversation, ...conversations]);
        setCurrentConversationId(newConversation.id);
      } else {
        console.error('Failed to create new chat:', response.error);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isWaitingResponse) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setConversations(prevConversations => 
      prevConversations.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              lastMessage: content,
              messages: [...conv.messages, newMessage]
            }
          : conv
      )
    );

    try {
      setIsWaitingResponse(true);
      const currentConversation = conversations.find(conv => conv.id === currentConversationId);
      if (!currentConversation) return;

      const response = await sendMessage(content, currentConversation.id);
      
      if (response.success && response.data) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.prompt,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };

        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  lastMessage: aiResponse.content,
                  messages: [...conv.messages, aiResponse]
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsWaitingResponse(false);
      setSelectedPrompt(null);
    }
  };

  const currentConversation = conversations.find(conv => conv.id === currentConversationId);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        conversations={conversations}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNewChat={handleNewChat}
        onToggleFavorite={handleToggleFavorite}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onPromptSelect={handlePromptSelect}
      />
      {currentConversation && (
        <ChatArea
          conversation={currentConversation}
          onSendMessage={handleSendMessage}
          isWaitingResponse={isWaitingResponse}
          selectedPrompt={selectedPrompt}
        />
      )}
    </div>
  );
}

export default App;
```
[coder:end]