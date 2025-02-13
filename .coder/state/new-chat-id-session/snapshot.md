# Context

All files complete source code.

## Project Structure

/
├── frontend/
│   ├── .bolt/
│   │   ├── config.json
│   │   └── prompt
│   ├── src/
│   │   ├── api/
│   │   │   └── endpoints.ts
│   │   ├── components/
│   │   │   ├── ChatArea.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   └── vite-env.d.ts
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .env
└── README.md

## File Contents

### frontend/.bolt/config.json
```
{
  "template": "bolt-vite-react-ts"
}
```

### frontend/.bolt/prompt
```
For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.

Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.
```

### frontend/src/api/endpoints.ts
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

### frontend/src/components/ChatArea.tsx
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

### frontend/src/components/Sidebar.tsx
```
import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, Star, Sun, Moon, List, ChevronDown, ChevronUp, Check, Save, User, Plus } from 'lucide-react';
import type { Conversation, Prompt } from '../types';
import { fetchPrompts, saveSelectedPrompts, createNewChat } from '../api/endpoints';

interface SidebarProps {
  conversations: Conversation[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewChat?: (conversation: Conversation) => void;
  onToggleFavorite: (conversationId: string) => void;
  showFavoritesOnly: boolean;
  onToggleShowFavorites: () => void;
  currentConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onPromptSelect: (prompt: Prompt) => void;
}

export function Sidebar({ 
  conversations, 
  isDarkMode, 
  onToggleDarkMode, 
  onNewChat,
  onToggleFavorite,
  showFavoritesOnly,
  onToggleShowFavorites,
  currentConversationId,
  onSelectConversation,
  onPromptSelect
}: SidebarProps) {
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const personas = [
    { id: '1', name: 'Developer' },
    { id: '2', name: 'Writer' },
    { id: '3', name: 'Analyst' },
    { id: '4', name: 'Teacher' },
  ];

  useEffect(() => {
    if (isPromptsOpen) {
      loadPrompts();
    }
  }, [isPromptsOpen]);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const response = await fetchPrompts();
      if (response.success) {
        setPrompts(response.data);
      } else {
        console.error('Failed to load prompts:', response.error);
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setIsLoading(true);
      const response = await createNewChat();
      if (response.success && onNewChat) {
        onNewChat(response.data);
      } else {
        console.error('Failed to create new chat:', response.error);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompts(prev => 
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    handleSavePersona(personaId);
  };

  const handleSavePrompts = async () => {
    if (selectedPrompts.length === 1) {
      const selectedPrompt = prompts.find(prompt => prompt.id === selectedPrompts[0]);
      if (selectedPrompt) {
        onPromptSelect(selectedPrompt);
        setIsPromptsOpen(false);
        setSelectedPrompts([]);
      }
    } else if (selectedPrompts.length > 1) {
      try {
        setIsLoading(true);
        const selectedPromptObjects = prompts.filter(prompt => selectedPrompts.includes(prompt.id));
        console.log('Selected prompt objects:', selectedPromptObjects);

        const response = await saveSelectedPrompts(selectedPromptObjects);
        if (response.success) {
          setIsPromptsOpen(false);
          setSelectedPrompts([]);
        } else {
          console.log('Selected prompts:', selectedPrompts);
          console.error('Failed to save prompts:', response.error);
        }
      } catch (error) {
        console.error('Error saving prompts:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSavePersona = async (personaId: string) => {
    try {
      console.log('Selected persona:', personaId);
      setIsPersonaOpen(false);
    } catch (error) {
      console.error('Error saving persona:', error);
    }
  };

  const displayedConversations = showFavoritesOnly
    ? conversations.filter(conv => conv.isFavorite)
    : conversations;

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Conversations</h1>
      </div>
      
      <button
        onClick={handleNewChat}
        disabled={isLoading}
        className="mx-4 mt-4 p-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5" />
        <span>New Chat</span>
      </button>
      
      <div className="flex-1 overflow-y-auto">
        {displayedConversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-colors ${
              currentConversationId === conversation.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className={`w-5 h-5 ${
                currentConversationId === conversation.id
                  ? 'text-blue-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  currentConversationId === conversation.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {conversation.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(conversation.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star
                  className={`w-5 h-5 ${
                    conversation.isFavorite
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
        
        <button 
          onClick={onToggleShowFavorites}
          className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-2 ${
            showFavoritesOnly ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
        >
          <Star className={`w-5 h-5 ${showFavoritesOnly ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
          <span className="text-sm text-gray-700 dark:text-gray-300">Favorites</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsPromptsOpen(!isPromptsOpen)}
            className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
          >
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Prompts</span>
            </div>
            {isPromptsOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {isPromptsOpen && (
            <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-1 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading prompts...
                </div>
              ) : (
                <>
                  {prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button" 
                      onClick={() => handlePromptSelect(prompt.id)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-start justify-between border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {prompt.title}
                          </span>
                          {selectedPrompts.includes(prompt.id) && (
                            <Check className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        {prompt.description && (
                          <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs line-clamp-2">
                            {prompt.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2 sticky bottom-0 bg-white dark:bg-gray-800">
                    <button
                      onClick={handleSavePrompts}
                      disabled={selectedPrompts.length === 0 || isLoading}
                      className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg ${
                        selectedPrompts.length > 0 && !isLoading
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      } transition-colors duration-200`}
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm">
                        {isLoading ? 'Saving...' : `Save Selected (${selectedPrompts.length})`}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className="w-full flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Persona
                {selectedPersona && ` (${personas.find(p => p.id === selectedPersona)?.name})`}
              </span>
            </div>
            {isPersonaOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {isPersonaOpen && (
            <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-1">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
                >
                  <span>{persona.name}</span>
                  {selectedPersona === persona.id && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mt-2">
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
        </button>
      </div>
    </div>
  );
}
```

### frontend/src/App.tsx
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
          content: response.data.content,
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

### frontend/src/index.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  @apply bg-gray-50;
}

.dark {
  @apply bg-gray-800;
}
```

### frontend/src/main.tsx
```
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### frontend/src/types.ts
```
export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  isFavorite: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface PromptVariable {
  name: string;
  title: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  visibleTo: string;
  visibleToGroups: string[];
  categories: string[];
  ownerId: string;
  variables: PromptVariable[];
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### frontend/src/vite-env.d.ts
```
/// <reference types="vite/client" />
```

### frontend/eslint.config.js
```
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
```

### frontend/index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### frontend/package.json
```
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

### frontend/postcss.config.js
```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### frontend/tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### frontend/tsconfig.app.json
```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### frontend/tsconfig.json
```
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### frontend/tsconfig.node.json
```
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

### frontend/vite.config.ts
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### .env
```

```

### README.md
```
# Vite React TypeScript Starter

This is a starter project for building a React application using Vite and TypeScript. It includes essential configurations and dependencies to get you up and running quickly.

## Table of Contents

- [Getting Started](#getting-started)
- [Setup and Configuration](#setup-and-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Backend Integration](#backend-integration)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher) or [Yarn](https://yarnpkg.com/)

### Setup and Configuration

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/vite-react-typescript-starter.git
   cd vite-react-typescript-starter/frontend
   ```

2. **Install dependencies:**

   Using npm:
   ```sh
   npm install
   ```

   Using Yarn:
   ```sh
   yarn install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root of the `frontend` directory and add any necessary environment variables. For example:
   ```sh
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```

4. **Run the development server:**

   Using npm:
   ```sh
   npm run dev
   ```

   Using Yarn:
   ```sh
   yarn dev
   ```

   The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

- `npm run dev` or `yarn dev`: Starts the development server.
- `npm run build` or `yarn build`: Builds the app for production.
- `npm run lint` or `yarn lint`: Runs ESLint to check for linting errors.
- `npm run preview` or `yarn preview`: Previews the production build locally.

## Project Structure

```
frontend/
├── .bolt/
│   ├── config.json
│   └── prompt
├── src/
│   ├── api/
│   │   └── endpoints.ts
│   ├── components/
│   │   ├── ChatArea.tsx
│   │   └── Sidebar.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Backend Integration

This frontend project interacts with a backend service for various functionalities. The backend repository can be found at: [flow-coder-service](https://github.com/CI-T-HyperX/flow-coder-service).

The routes used in `src/api/endpoints.ts` are defined in the backend service. Make sure to set up and run the backend service to ensure full functionality of the application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

# Instructions

No need to analyze anything right now. 
Just wait for questions.
