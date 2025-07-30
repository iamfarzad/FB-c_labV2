export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  } else if (diffInSeconds < 2592000) {
    // 30 days
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  } else {
    // Fallback to a simpler date format for older entries
    return date.toLocaleDateString()
  }
}
