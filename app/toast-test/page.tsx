"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ToastTestPage() {
  const { toast } = useToast()

  const showToast = (type: 'default' | 'destructive' | 'success') => {
    const messages = {
      default: {
        title: 'Default Toast',
        description: 'This is a default toast message.',
      },
      destructive: {
        title: 'Error',
        description: 'Something went wrong!',
      },
      success: {
        title: 'Success!',
        description: 'Your action was completed successfully.',
      },
    }

    toast({
      ...messages[type],
      type,
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold text-center mb-8">Toast Notification Test</h1>
        
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => showToast('default')}
          >
            Show Default Toast
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => showToast('destructive')}
          >
            Show Error Toast
          </Button>
          
          <Button 
            variant="default" 
            className="w-full bg-green-600 hover:bg-green-700 text-white" 
            onClick={() => showToast('success')}
          >
            Show Success Toast
          </Button>
        </div>
        
        <div className="mt-8 p-4 border rounded-lg bg-muted">
          <h2 className="font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Click each button to show a different type of toast</li>
            <li>Toasts should appear in the top-right corner</li>
            <li>Each toast should auto-dismiss after 5 seconds</li>
            <li>Click the X button to manually dismiss a toast</li>
            <li>Multiple toasts should stack correctly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
