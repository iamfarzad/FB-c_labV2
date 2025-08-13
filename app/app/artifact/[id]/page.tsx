import { getSupabase } from '@/lib/supabase/server'

export default async function ArtifactPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Artifact not found</h1>
        <p className="text-sm text-muted-foreground mt-2">The link may have expired or is invalid.</p>
      </div>
    )
  }

  // Only render HTML artifacts safely
  if (data.type !== 'video_app_code') {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Unsupported artifact</h1>
        <p className="text-sm text-muted-foreground mt-2">This artifact type cannot be rendered.</p>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <iframe
        className="w-full h-full"
        srcDoc={data.content as string}
        sandbox="allow-scripts"
        title="Artifact"
      />
    </div>
  )
}


