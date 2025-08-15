// Minimal shim for any lingering imports; not used by the app.
export interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
  currentFeature?: "dashboard" | "chat" | "canvas" | "webcam" | "screenshare" | "workshop"
}
export interface AppContext { currentUser: User }
export function AppProvider({ children }: { children: React.ReactNode }) { return children as any }
export function useUsers() { return { onlineUsers: [], updateCurrentUserFeature: (_: any) => {} } }
export function useFeatureStatus() { return { activeFeatures: { chat: { participants: 0 }, webcam: { participants: 0, isRecording: false }, screenshare: { viewers: 0, isActive: false }, workshop: { participants: 0 }, canvas: { collaborators: 0 } } } }
export function useNotifications() { return { notifications: [], unreadCount: 0, addNotification: (_: any) => {}, markAsRead: (_: any) => {}, clearAll: () => {} } }
export function useActivity() { return { activities: [], addActivity: (_: any) => {} } }


