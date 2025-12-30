import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '~/contexts/theme.context';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme('light')}
        className={`h-8 w-8 ${theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}
        title="Light"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme('system')}
        className={`h-8 w-8 ${theme === 'system' ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}
        title="System"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme('dark')}
        className={`h-8 w-8 ${theme === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-muted/50'}`}
        title="Dark"
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  );
}
