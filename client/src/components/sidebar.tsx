import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Trash2, X, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { getSessions, createSession, deleteSession, chatKeys, type ChatSession } from '~/services/chat.service';
import { useModelStore, MODELS } from '~/stores/model.store';

const getSessionTitle = (session: ChatSession): string => {
  if (session.messages.length > 0) {
    const firstMessage = session.messages[0].content;
    return firstMessage.length > 20 ? firstMessage.substring(0, 20) + '...' : firstMessage;
  }
  return 'New Message';
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSessionCreated?: (sessionId: string) => void;
}

export function Sidebar({ isOpen = true, onClose, onSessionCreated }: SidebarProps) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedModel, setSelectedModel } = useModelStore();

  const isActive = (id: string) => location.pathname === `/chat/${id}`;

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: chatKeys.sessions(),
    queryFn: getSessions,
  });

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      queryClient.setQueryData(chatKeys.sessions(), (old: ChatSession[] | undefined) => {
        return [newSession, ...(old || [])];
      });
      navigate(`/chat/${newSession.id}`);
      onSessionCreated?.(newSession.id);
      onClose?.();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(chatKeys.sessions(), (old: ChatSession[] | undefined) => {
        return (old || []).filter((s) => s.id !== sessionId);
      });
      if (isActive(sessionId)) {
        navigate('/');
      }
    },
  });

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat session?')) {
      return;
    }
    deleteSessionMutation.mutate(sessionId);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          ${isOpen ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-2xl lg:hidden' : 'hidden'} 
          lg:flex
          w-64
          border-r border-border bg-muted/10 h-screen flex flex-col shrink-0 overflow-hidden
          transition-transform duration-200
        `}
      >
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              <span className="font-semibold">AI Chat</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={handleNewChat} className="w-full gap-2 shadow-sm" variant="default" disabled={createSessionMutation.isPending} data-testid="new-chat-button">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground px-3 py-2">Loading...</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">No chat sessions</p>
            ) : (
              sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/chat/${session.id}`}
                  onClick={() => onClose?.()}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all group w-full ${
                    isActive(session.id)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1 min-w-0">{getSessionTitle(session)}</span>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    disabled={deleteSessionMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3 flex-shrink-0" />
                  </button>
                </Link>
              ))
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-border shrink-0 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
