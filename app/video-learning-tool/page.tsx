import { VideoLearningToolClient } from './VideoLearningToolClient'

export default async function VideoLearningToolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  // Await searchParams before using its properties
  const params = await searchParams
  
  // Get initial data from URL params
  const initialVideoUrl = params.url || ''
  const sessionId = params.sessionId || ''
  const fromChat = params.from === 'chat'

  return (
    <VideoLearningToolClient
      initialVideoUrl={initialVideoUrl}
      sessionId={sessionId}
      fromChat={fromChat}
    />
  )
}
