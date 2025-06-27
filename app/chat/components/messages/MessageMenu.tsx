'use client';

import { 
  Copy, 
  Reply, 
  Trash2, 
  Flag, 
  Edit, 
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface MessageMenuProps {
  messageId: string;
  isOwnMessage: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onCopy?: (text: string) => void;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const MessageMenu = ({
  messageId,
  isOwnMessage,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onCopy,
  className,
  align = 'end',
}: MessageMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    if (onCopy) {
      onCopy(text);
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        duration: 2000,
      });
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete?.();
      setIsConfirmingDelete(false);
      setIsOpen(false);
    } else {
      setIsConfirmingDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setIsConfirmingOpen(false);
      }, 3000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsConfirmingDelete(false);
    }
    setIsOpen(open);
  };

  // This is a workaround for the DropdownMenuContent's onInteractOutside
  // which doesn't properly handle the confirmation state
  const setIsConfirmingOpen = (open: boolean) => {
    if (isConfirmingDelete) {
      setIsConfirmingDelete(false);
    } else {
      handleOpenChange(open);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsConfirmingOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenChange(!isOpen);
          }}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Message options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="w-48 p-1"
        onClick={(e) => e.stopPropagation()}
      >
        {onReply && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onReply();
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            <Reply className="mr-2 h-4 w-4" />
            <span>Reply</span>
          </DropdownMenuItem>
        )}
        
        {onCopy && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
              const text = messageElement?.textContent || '';
              handleCopy(text);
            }}
            className="cursor-pointer"
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy text</span>
          </DropdownMenuItem>
        )}
        
        {onEdit && isOwnMessage && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
        
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className={cn(
                'text-destructive focus:text-destructive cursor-pointer',
                isConfirmingDelete && 'bg-destructive/10'
              )}
            >
              {isConfirmingDelete ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Confirm delete</span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </DropdownMenuItem>
          </>
        )}
        
        {onReport && !isOwnMessage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onReport();
                setIsOpen(false);
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Flag className="mr-2 h-4 w-4" />
              <span>Report</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageMenu;
