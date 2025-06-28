'use client';

import { Button } from '@/components/ui/button';
import { Sun, Moon, Download, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  onMenuClick?: () => void;
  onDownloadSummary: () => void;
}

export function ChatHeader({ onDownloadSummary }: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="border-b border-border/50 p-4 flex items-center justify-between bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBackToHome}
          className="text-muted-foreground hover:text-foreground"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-ping" />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground">F.B/c AI ASSISTANT</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Online • Ready to help</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDownloadSummary}>
          <Download className="w-4 h-4 mr-2" />
          Export Summary
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

export default ChatHeader;
