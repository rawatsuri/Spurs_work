import { BadRequestError } from '@/exceptions/BadRequestError';
import { NotFoundError } from '@/exceptions/NotFoundError';
import { prisma } from '@/lib/prisma';
import { chatWithLLM } from '@/services/openrouter.service';

function generateTitle(message: string): string {
  const cleaned = message.replace(/\n/g, ' ').trim();
  return cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned;
}

export const chatService = {
  async getSessions() {
    return prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
  },

  async createSession() {
    const session = await prisma.chatSession.create({
      data: {
        title: 'New Chat',
      },
      include: {
        messages: true,
      },
    });
    return session;
  },

  async getSession(id: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Chat session not found');
    }

    return session;
  },

  async deleteSession(id: string) {
    await prisma.chatSession.delete({
      where: { id },
    });
  },

  async sendMessage(sessionId: string, content: string, model?: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Chat session not found');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Message cannot be empty');
    }

    if (content.length > 2000) {
      throw new BadRequestError('Message too long. Please keep it under 2000 characters.');
    }

    const isFirstMessage = session.messages.length === 0;
    const title = isFirstMessage ? generateTitle(content) : session.title;

    const userMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: 'USER',
        content,
      },
    });

    const messageHistory = session.messages.map(msg => ({
      role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));

    let aiResponse: string;

    try {
      console.log('chatService.sendMessage - Calling LLM with model:', model);
      aiResponse = await chatWithLLM(messageHistory, model);
    } catch {
      throw new BadRequestError('Failed to get response from AI');
    }

    const assistantMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: 'ASSISTANT',
        content: aiResponse,
      },
    });

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    return {
      userMessage,
      assistantMessage,
      session: updatedSession,
    };
  },
};
