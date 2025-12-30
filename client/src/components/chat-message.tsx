import type { Message } from '~/types/chat';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        <div className="text-sm prose prose-invert max-w-none overflow-hidden">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed break-words">{children}</p>,
              code: ({ children }) => (
                <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono break-all">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-background/90 p-4 rounded-lg overflow-x-auto my-3 border border-border whitespace-pre-wrap break-all">
                  {children}
                </pre>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="ml-2 break-words">{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-2 break-words">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-2 break-words">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-1 break-words">{children}</h3>,
              a: ({ children, href }) => (
                <a href={href} className="text-primary hover:underline hover:text-primary/80 break-all">
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/40 pl-4 italic my-3 text-muted-foreground break-words">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );
}
