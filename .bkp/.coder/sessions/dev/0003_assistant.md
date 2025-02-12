Para integrar as funcionalidades mencionadas na `Sidebar` do outro projeto ao projeto atual, precisamos atualizar o arquivo `Sidebar.tsx` no projeto atual. Vamos adicionar a funcionalidade de selecionar múltiplos prompts e salvar os prompts selecionados.

### frontend/src/components/Sidebar.tsx [coder:save]
```typescript
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
    if (selectedPrompts.length > 0) {
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
[coder:end]

Agora, a `Sidebar` foi atualizada para incluir a funcionalidade de selecionar múltiplos prompts e salvar os prompts selecionados. Se precisar de mais alguma coisa, por favor, me avise!