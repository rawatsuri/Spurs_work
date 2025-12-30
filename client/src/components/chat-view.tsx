import { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Send, Loader2, Menu } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { ChatMessage } from './chat-message';
import { getSession, sendMessage, chatKeys, type ChatSession } from '~/services/chat.service';
import { useModelStore } from '~/stores/model.store';

const getSessionTitle = (session: ChatSession): string => {
  if (session.messages.length > 0) {
    const firstMessage = session.messages[0].content;
    return firstMessage.length > 20 ? firstMessage.substring(0, 20) + '...' : firstMessage;
  }
  return 'New Message';
};

export function ChatView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModelStore();
  const setSidebarOpen = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>()?.setSidebarOpen;
  const MAX_LENGTH = 2000;

  const { data: session, isLoading, isError } = useQuery({
    queryKey: chatKeys.session(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ content, model }: { content: string; model?: string }) =>
      sendMessage(sessionId!, content, model),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.session(sessionId!) });

      const previousSession = queryClient.getQueryData<ChatSession>(chatKeys.session(sessionId!));

      queryClient.setQueryData<ChatSession>(chatKeys.session(sessionId!), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: `temp-${Date.now()}`,
              role: 'USER' as const,
              content: variables.content,
              timestamp: new Date(),
            },
          ],
        };
      });

      return { previousSession };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(chatKeys.session(sessionId!), context?.previousSession);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(chatKeys.session(sessionId!), data.session);
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, sendMessageMutation.isPending]);

  const handleSend = () => {
    if (!input.trim() || !sessionId || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({ content: input, model: selectedModel });
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  if (isError || !session) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <p className="text-muted-foreground">Chat session not found</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-full">
      <header className="border-b border-border p-3 md:p-4 bg-muted/10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setSidebarOpen?.(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-base md:text-lg font-semibold truncate flex-1">{getSessionTitle(session)}</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
        {session.messages.length === 0 && !sendMessageMutation.isPending ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {session.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role === 'USER' ? 'user' : 'assistant',
                  content: message.content,
                  timestamp: new Date(message.timestamp),
                }}
              />
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 mb-4 justify-start w-full">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shrink-0">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="bg-muted text-foreground rounded-lg p-4 shadow-sm max-w-[70%]">
                  <p className="text-sm text-muted-foreground">Agent is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="border-t border-border p-3 md:p-4 shrink-0">
        <div className="flex gap-2 max-w-5xl mx-auto flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[50px] md:min-h-[60px] px-3 py-2 md:px-4 md:py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            disabled={sendMessageMutation.isPending || isLoading}
            maxLength={MAX_LENGTH}
          />
          {input.length > MAX_LENGTH * 0.8 && (
            <p className={`text-xs ${input.length >= MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
              {input.length} / {MAX_LENGTH} characters
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSend} className="px-4 md:px-6 shrink-0" disabled={sendMessageMutation.isPending || isLoading || !input.trim()}>
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
