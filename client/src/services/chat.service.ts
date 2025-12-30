const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/chat';

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  session: ChatSession;
}

export const chatKeys = {
  all: ['chat'] as const,
  sessions: () => [...chatKeys.all, 'sessions'] as const,
  session: (id: string) => [...chatKeys.all, 'session', id] as const,
};

export async function getSessions(): Promise<ChatSession[]> {
  const response = await fetch(`${API_BASE_URL}/sessions`);
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

export async function createSession(): Promise<ChatSession> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
}

export async function getSession(id: string): Promise<ChatSession> {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
}

export async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}

export async function sendMessage(sessionId: string, content: string, model?: string): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, model }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return response.json();
}
