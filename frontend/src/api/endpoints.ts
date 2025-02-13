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
  console.log('sendMessage response data:', data);
  return {
    success: response.ok,
    data: response.ok ? data : undefined,
    error: response.ok ? undefined : data.detail,
  };
}