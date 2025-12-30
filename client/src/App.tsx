import { BrowserRouter as Router, Routes, Route, Outlet, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Sparkles, Bot } from 'lucide-react';
import { Sidebar } from '~/components/sidebar';
import { ChatView } from '~/components/chat-view';
import { Button } from '~/components/ui/button';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet context={{ setSidebarOpen }} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={<HomeView />}
          />
          <Route path="chat/:sessionId" element={<ChatView />} />
        </Route>
      </Routes>
    </Router>
  );
}

function HomeView() {
  const setSidebarOpen = useOutletContext<{ setSidebarOpen: (open: boolean) => void }>()?.setSidebarOpen;

  return (
    <div className="flex flex-col h-full">
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
          <h1 className="text-base md:text-lg font-semibold">AI Chat</h1>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-8 overflow-hidden px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome to AI Chat</h1>
            <p className="text-muted-foreground max-w-md">
              Start a conversation with AI by creating a new chat or selecting one from sidebar
            </p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={() => (document.querySelector('[data-testid="new-chat-button"]') as HTMLButtonElement)?.click()}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start New Chat
        </Button>
      </main>
    </div>
  );
}

export default App;
