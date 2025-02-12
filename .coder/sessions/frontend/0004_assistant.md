Entendi, parece que a API espera o parâmetro `prompt` na query string em vez do corpo da requisição. Vamos ajustar a função `sendMessage` para enviar o parâmetro `prompt` na query string.

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
  const response = await fetch(`${API_BASE_URL}/send-message?prompt=${encodeURIComponent(prompt)}`, {
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
}
```
[coder:end]