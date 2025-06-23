"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { Toast, type ToastType } from "./toast";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
};

interface ToastContextType {
  toasts: ToastMessage[];
  toast: (message: Omit<ToastMessage, "id">) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

// Add explicit return type for the component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const toast = React.useCallback((message: Omit<ToastMessage, "id">): string => {
    const id = uuidv4();
    setToasts((currentToasts) => [...currentToasts, { ...message, id }]);
    return id;
  }, []);

  const contextValue = React.useMemo<ToastContextType>(
    () => ({
      toasts,
      toast,
      dismissToast,
    }),
    [toasts, toast, dismissToast]
  );

  return (
    <>
      <ToastContext.Provider value={contextValue}>
        {children}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs">
          {toasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              id={toastItem.id}
              title={toastItem.title}
              description={toastItem.description}
              type={toastItem.type}
              onDismiss={() => dismissToast(toastItem.id)}
            />
          ))}
        </div>
      </ToastContext.Provider>
    </>
  ) as React.ReactElement;
};

export function useToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast is now imported from './toast'
