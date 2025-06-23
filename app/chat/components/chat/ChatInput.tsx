'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Mic, Paperclip, Send, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (file: File) => void;
  isSending: boolean;
  className?: string;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  isSending,
  className,
}: ChatInputProps) => {
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onFileUpload(file);
            e.preventDefault();
            return;
          }
        }
      }
    }
  };

  return (
    <div className={cn('border-t p-4 bg-background', className)}>
      <div className="relative flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-10 w-10 rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, .pdf, .doc, .docx, .txt"
          />
        </Button>

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onPaste={handlePaste}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-32 resize-none pr-12"
            rows={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-1 h-8 w-8"
            onClick={() => value && onSend()}
            disabled={!value.trim() || isSending}
          >
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-10 w-10 rounded-full"
          onClick={() => {
            // TODO: Implement voice input
            console.log('Voice input clicked');
          }}
        >
          <Mic className="h-5 w-5" />
          <span className="sr-only">Use voice input</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
