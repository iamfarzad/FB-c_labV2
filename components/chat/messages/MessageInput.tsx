'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  onAttachFile?: () => void;
  onVoiceInput?: () => void;
  onImageUpload?: () => void;
  disabled?: boolean;
  className?: string;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  onAttachFile,
  onVoiceInput,
  onImageUpload,
  disabled = false,
  className,
}: MessageInputProps) => {
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
      }
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      onSend(value.trim());
      onChange('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className={cn('flex w-full items-center gap-2 p-4', className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAttachFile}
          disabled={disabled}
          type="button"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onImageUpload}
          disabled={disabled}
          type="button"
        >
          <ImageIcon className="h-5 w-5" />
          <span className="sr-only">Upload image</span>
        </Button>
      </div>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          disabled={disabled}
          className="pr-12"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
          onClick={onVoiceInput}
          disabled={disabled}
          type="button"
        >
          <Mic className="h-4 w-4" />
          <span className="sr-only">Voice input</span>
        </Button>
      </div>
      <Button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        type="button"
      >
        <Send className="mr-2 h-4 w-4" />
        Send
      </Button>
    </div>
  );
};

export default MessageInput;
