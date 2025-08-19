"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
interface User {
  id: string
  name: string
  avatar?: string
  status: "online" | "offline" | "away"
  currentFeature?: "dashboard" | "chat" | "canvas" | "webcam" | "screenshare" | "workshop"
}

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: Date
  read: boolean
  feature?: string
}

interface Activity {
  id: string
  userId: string
  userName: string
  action: string
  feature: string
  timestamp: Date
  details?: any
}

interface AppState {
  currentUser: User
  users: User[]
  notifications: Notification[]
  activities: Activity[]
  activeFeatures: {
    chat: { participants: number; lastMessage?: string }
    canvas: { collaborators: number; lastUpdate?: Date }
    webcam: { participants: number; isRecording: boolean }
    screenshare: { viewers: number; isActive: boolean }
    workshop: { participants: number; activeQuiz?: string }
  }
  globalSettings: {
    theme: "light" | "dark"
    notifications: boolean
    sounds: boolean
  }
}

type AppAction =
  | { type: "SET_CURRENT_USER"; payload: User }
  | { type: "UPDATE_USER_STATUS"; payload: { userId: string; status: User["status"] } }
  | { type: "UPDATE_USER_FEATURE"; payload: { userId: string; feature: User["currentFeature"] } }
  | { type: "ADD_USER"; payload: User }
  | { type: "REMOVE_USER"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Omit<Notification, "id" | "timestamp" | "read"> }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "ADD_ACTIVITY"; payload: Omit<Activity, "id" | "timestamp"> }
  | { type: "UPDATE_FEATURE_STATUS"; payload: { feature: keyof AppState["activeFeatures"]; data: any } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["globalSettings"]> }

const initialState: AppState = {
  currentUser: {
    id: "current-user",
    name: "You",
    status: "online",
    currentFeature: "dashboard",
  },
  users: [
    { id: "user-1", name: "Sarah Chen", status: "online", currentFeature: "chat" },
    { id: "user-2", name: "Mike Johnson", status: "online", currentFeature: "canvas" },
    { id: "user-3", name: "Alex Rivera", status: "away", currentFeature: "workshop" },
    { id: "user-4", name: "Emma Davis", status: "online", currentFeature: "webcam" },
  ],
  notifications: [
    {
      id: "notif-1",
      type: "info",
      title: "Welcome!",
      message: "Welcome to CollabSpace. All features are ready to use.",
      timestamp: new Date(),
      read: false,
    },
  ],
  activities: [
    {
      id: "activity-1",
      userId: "user-1",
      userName: "Sarah Chen",
      action: "joined chat",
      feature: "chat",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "activity-2",
      userId: "user-2",
      userName: "Mike Johnson",
      action: "started drawing",
      feature: "canvas",
      timestamp: new Date(Date.now() - 240000),
    },
  ],
  activeFeatures: {
    chat: { participants: 4, lastMessage: "Hey everyone! Ready for our brainstorming session?" },
    canvas: { collaborators: 3, lastUpdate: new Date(Date.now() - 120000) },
    webcam: { participants: 2, isRecording: false },
    screenshare: { viewers: 5, isActive: false },
    workshop: { participants: 8, activeQuiz: "React Fundamentals" },
  },
  globalSettings: {
    theme: "light",
    notifications: true,
    sounds: true,
  },
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload }

    case "UPDATE_USER_STATUS":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId ? { ...user, status: action.payload.status } : user,
        ),
        currentUser:
          state.currentUser.id === action.payload.userId
            ? { ...state.currentUser, status: action.payload.status }
            : state.currentUser,
      }

    case "UPDATE_USER_FEATURE":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId ? { ...user, currentFeature: action.payload.feature } : user,
        ),
        currentUser:
          state.currentUser.id === action.payload.userId
            ? { ...state.currentUser, currentFeature: action.payload.feature }
            : state.currentUser,
      }

    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      }

    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      }

    case "ADD_NOTIFICATION":
      const newNotification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      }
      return {
        ...state,
        notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
      }

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((notif) =>
          notif.id === action.payload ? { ...notif, read: true } : notif,
        ),
      }

    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
      }

    case "ADD_ACTIVITY":
      const newActivity: Activity = {
        ...action.payload,
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
      }
      return {
        ...state,
        activities: [newActivity, ...state.activities].slice(0, 100), // Keep only last 100
      }

    case "UPDATE_FEATURE_STATUS":
      return {
        ...state,
        activeFeatures: {
          ...state.activeFeatures,
          [action.payload.feature]: {
            ...state.activeFeatures[action.payload.feature],
            ...action.payload.data,
          },
        },
      }

    case "UPDATE_SETTINGS":
      return {
        ...state,
        globalSettings: {
          ...state.globalSettings,
          ...action.payload,
        },
      }

    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate user status changes
      const randomUser = state.users[Math.floor(Math.random() * state.users.length)]
      if (randomUser && Math.random() > 0.8) {
        const statuses: User["status"][] = ["online", "away", "offline"]
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
        dispatch({
          type: "UPDATE_USER_STATUS",
          payload: { userId: randomUser.id, status: newStatus },
        })
      }

      // Simulate feature updates
      if (Math.random() > 0.7) {
        const features = ["chat", "canvas", "webcam", "screenshare", "workshop"] as const
        const randomFeature = features[Math.floor(Math.random() * features.length)]

        switch (randomFeature) {
          case "chat":
            dispatch({
              type: "UPDATE_FEATURE_STATUS",
              payload: {
                feature: "chat",
                data: { participants: Math.floor(Math.random() * 10) + 1 },
              },
            })
            break
          case "canvas":
            dispatch({
              type: "UPDATE_FEATURE_STATUS",
              payload: {
                feature: "canvas",
                data: { collaborators: Math.floor(Math.random() * 5) + 1, lastUpdate: new Date() },
              },
            })
            break
        }
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [state.users])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

// Custom hooks for specific features
export function useNotifications() {
  const { state, dispatch } = useAppContext()

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification })
  }

  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id })
  }

  const clearAll = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" })
  }

  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter((n) => !n.read).length,
    addNotification,
    markAsRead,
    clearAll,
  }
}

export function useActivity() {
  const { state, dispatch } = useAppContext()

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    dispatch({ type: "ADD_ACTIVITY", payload: activity })
  }

  return {
    activities: state.activities,
    addActivity,
  }
}

export function useUsers() {
  const { state, dispatch } = useAppContext()

  const updateCurrentUserFeature = (feature: User["currentFeature"]) => {
    dispatch({
      type: "UPDATE_USER_FEATURE",
      payload: { userId: state.currentUser.id, feature },
    })
  }

  const updateUserStatus = (userId: string, status: User["status"]) => {
    dispatch({ type: "UPDATE_USER_STATUS", payload: { userId, status } })
  }

  return {
    currentUser: state.currentUser,
    users: state.users,
    onlineUsers: state.users.filter((u) => u.status === "online"),
    updateCurrentUserFeature,
    updateUserStatus,
  }
}

export function useFeatureStatus() {
  const { state, dispatch } = useAppContext()

  const updateFeatureStatus = (feature: keyof AppState["activeFeatures"], data: any) => {
    dispatch({ type: "UPDATE_FEATURE_STATUS", payload: { feature, data } })
  }

  return {
    activeFeatures: state.activeFeatures,
    updateFeatureStatus,
  }
}
