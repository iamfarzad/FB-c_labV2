'use client'

import { useMemo, useState } from 'react'
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { FbcIcon } from '@/components/ui/fbc-icon'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import { Branch, BranchMessages, BranchSelector, BranchPrevious, BranchNext, BranchPage } from '@/components/ai-elements/branch'
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block'
import { Image as AIGeneratedImage } from '@/components/ai-elements/image'
import { InlineCitation, InlineCitationText, InlineCitationCard, InlineCitationCardTrigger, InlineCitationCardBody, InlineCitationCarousel, InlineCitationCarouselHeader, InlineCitationCarouselIndex, InlineCitationCarouselPrev, InlineCitationCarouselNext, InlineCitationCarouselContent, InlineCitationCarouselItem, InlineCitationSource } from '@/components/ai-elements/inline-citation'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { PromptInput, PromptInputToolbar, PromptInputTools, PromptInputButton, PromptInputModelSelect, PromptInputModelSelectTrigger, PromptInputModelSelectContent, PromptInputModelSelectItem, PromptInputModelSelectValue, PromptInputTextarea, PromptInputSubmit } from '@/components/ai-elements/prompt-input'
import { ToolMenu } from '@/components/chat/ToolMenu'
import VoiceOverlay from '@/components/chat/VoiceOverlay'
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from '@/components/ai-elements/web-preview'
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from '@/components/ai-elements/task'
import { LeadProgressIndicator } from '@/components/chat/LeadProgressIndicator'
import { ConversationStage } from '@/lib/lead-manager'
import { ErrorHandler } from '@/components/chat/ErrorHandler'
import { BusinessContentRenderer } from '@/components/chat/BusinessContentRenderer'
import { CanvasWorkspace } from '@/components/chat/CanvasWorkspace'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { VideoToApp } from '@/components/chat/tools/VideoToApp/VideoToApp'

type UIMessage = {
  id: string
  role: 'user' | 'assistant'
  text?: string
  reasoning?: string
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b bg-background/50 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <FbcIcon className="h-6 w-6" />
        <div>
          <h1 className="text-lg font-semibold leading-tight tracking-tight">F.B/c — AI Chat (AI Elements)</h1>
          <p className="text-xs text-muted-foreground">Brand-styled chat using AI Elements</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" className="border-orange-accent/40 text-orange-accent hover:bg-orange-accent/10">
          <a href="/">Back</a>
        </Button>
      </div>
    </header>
  )
}

export default function AIEChatPage() {
  const [model, setModel] = useState('gpt-4o-mini')
  const [input, setInput] = useState('')
  const [openVoice, setOpenVoice] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [canvas, setCanvas] = useState<{ type: 'webpreview' | 'screen' | 'webcam' | 'video'; url?: string } | null>(null)

  // Demo messages showcasing all elements in a realistic chat layout
  const messages: UIMessage[] = useMemo(
    () => [
      {
        id: 'm1',
        role: 'user',
        text: 'Summarize AI Elements features and show an example.',
      },
      {
        id: 'm2',
        role: 'assistant',
        reasoning: 'Identify components; structure response; include sources and example code; present alternatives.',
        text:
          'AI Elements provides structured UI for AI UX: messages, reasoning, tools, citations, code blocks, web previews.\n\nHere is a quick example followed by sources and alternative branches.\n\n```ts\nexport function hello(){\n  console.log("AI Elements!")\n}\n```',
      },
    ],
    [],
  )

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-background" data-chat-root>
        <Header />

        <div className="flex flex-1 min-h-0 flex-col">
          <Conversation className="h-full">
            <ConversationContent className="mx-auto w-full max-w-3xl space-y-2 p-4 pb-28 md:pb-32">
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  {m.role === 'assistant' ? (
                    <MessageAvatar src="/placeholder-logo.svg" name="Fbc" />
                  ) : (
                    <MessageAvatar src="/placeholder-user.jpg" name="ME" />
                  )}
                  <MessageContent>
                    {m.role === 'assistant' && (
                      <Reasoning defaultOpen={false} isStreaming={false} duration={5}>
                        <ReasoningTrigger>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <FbcIcon className="h-4 w-4" />
                            <p>Thought for 5 seconds</p>
                            <ArrowDownIcon className="size-4 opacity-50" />
                          </div>
                        </ReasoningTrigger>
                        <ReasoningContent>{m.reasoning ?? ''}</ReasoningContent>
                      </Reasoning>
                    )}

                    {m.text && <Response>{m.text}</Response>}

                    {m.role === 'assistant' && (
                      <div className="space-y-3">
                        <Sources>
                          <SourcesTrigger count={2} />
                          <SourcesContent>
                            <Source href="https://ai-sdk.dev/elements" title="AI Elements" />
                            <Source href="https://vercel.com/changelog/introducing-ai-elements" title="Changelog" />
                          </SourcesContent>
                        </Sources>

                        <Branch defaultBranch={0}>
                          <BranchMessages>
                            <div key="alt1" className="rounded-md border p-3">
                              <Response>
                                {`Alternative A: Short summary with an inline citation `}
                              </Response>
                              <InlineCitation>
                                <InlineCitationText>see details</InlineCitationText>
                                <InlineCitationCard>
                                  <InlineCitationCardTrigger sources={[
                                    'https://ai-sdk.dev/elements',
                                    'https://vercel.com/changelog/introducing-ai-elements',
                                  ]} />
                                  <InlineCitationCardBody>
                                    <InlineCitationCarousel>
                                      <InlineCitationCarouselHeader>
                                        <span className="px-3 py-1 text-xs">Sources</span>
                                        <div className="flex items-center gap-2">
                                          <InlineCitationCarouselPrev />
                                          <InlineCitationCarouselIndex />
                                          <InlineCitationCarouselNext />
                                        </div>
                                      </InlineCitationCarouselHeader>
                                      <InlineCitationCarouselContent>
                                        <InlineCitationCarouselItem>
                                          <InlineCitationSource title="AI Elements" url="https://ai-sdk.dev/elements" description="Official registry" />
                                        </InlineCitationCarouselItem>
                                        <InlineCitationCarouselItem>
                                          <InlineCitationSource title="Vercel Changelog" url="https://vercel.com/changelog/introducing-ai-elements" description="Announcement" />
                                        </InlineCitationCarouselItem>
                                      </InlineCitationCarouselContent>
                                    </InlineCitationCarousel>
                                  </InlineCitationCardBody>
                                </InlineCitationCard>
                              </InlineCitation>
                            </div>
                            <div key="alt2" className="rounded-md border p-3">
                              <Response>
                                {`Alternative B: Include an image and code block`}
                              </Response>
                              <div className="mt-2 flex items-center gap-3">
                                <AIGeneratedImage
                                  base64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                                  uint8Array={new Uint8Array()}
                                  mediaType="image/png"
                                  alt="1x1 PNG"
                                  className="h-10 w-10"
                                />
                                <CodeBlock code={`console.log('alt code')`} language="ts">
                                  <CodeBlockCopyButton />
                                </CodeBlock>
                              </div>
                            </div>
                          </BranchMessages>
                          <BranchSelector from="assistant" className="flex items-center gap-2">
                            <BranchPrevious />
                            <BranchPage />
                            <BranchNext />
                          </BranchSelector>
                        </Branch>

                        {/* Web preview of the first source */}
                        <WebPreview defaultUrl="https://ai-sdk.dev/elements">
                          <WebPreviewNavigation>
                            <WebPreviewNavigationButton tooltip="Back" aria-label="Back">
                              <ArrowLeftIcon className="h-4 w-4" />
                            </WebPreviewNavigationButton>
                            <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward">
                              <ArrowRightIcon className="h-4 w-4" />
                            </WebPreviewNavigationButton>
                            <WebPreviewUrl />
                          </WebPreviewNavigation>
                          <WebPreviewBody className="rounded-b-lg h-56" />
                          <WebPreviewConsole />
                        </WebPreview>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setCanvas({ type: 'webcam' })}>
                            Webcam in canvas
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setCanvas({ type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })}>
                            Video→App in canvas
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setCanvas({ type: 'screen' })}>
                            Screen share in canvas
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setCanvas({ type: 'webpreview', url: 'https://ai-sdk.dev/elements' })}>
                            Open in canvas
                          </Button>
                        </div>

                        {/* Task demo block */}
                        <Task defaultOpen>
                          <TaskTrigger title="Search web for references" />
                          <TaskContent>
                            <TaskItem>
                              Found 3 results in <TaskItemFile>docs/references.md</TaskItemFile>
                            </TaskItem>
                            <TaskItem>
                              Updated <TaskItemFile>app/page.tsx</TaskItemFile>
                            </TaskItem>
                          </TaskContent>
                        </Task>

                        <Tool defaultOpen>
                          <ToolHeader type="tool-search-web" state="output-available" />
                          <ToolContent>
                            <ToolInput input={{ query: 'ai elements examples', topK: 3 }} />
                            <ToolOutput output={<div>Found 3 results…</div>} errorText={undefined} />
                          </ToolContent>
                        </Tool>

                        {/* Branded business content renderer sample */}
                        <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                          <BusinessContentRenderer
                            htmlContent={`<div>
                              <h4>F.B/c Opportunity</h4>
                              <p>Based on your stack, enable an AI Elements chat to streamline demo sessions.</p>
                              <button data-interaction-id="book-demo" class="px-3 py-1 rounded-md" style="background:#0ea5e9;color:white">Book a demo</button>
                            </div>`}
                            onInteract={(d) => console.log('business interact', d)}
                            isLoading={false}
                          />
                        </div>
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}

              {/* Standalone code block message */}
              <Message from="assistant">
                <MessageAvatar src="/placeholder-logo.svg" name="Fbc" />
                <MessageContent>
                  <Response>{`Here is a stand-alone code snippet with copy:`}</Response>
                  <div className="mt-2">
                    <CodeBlock code={`function greet(name: string) {\n  return \`Hello, ${'${name}'}!\`;\n}\nconsole.log(greet('F.B/c'))`} language="ts">
                      <CodeBlockCopyButton />
                    </CodeBlock>
                  </div>
                </MessageContent>
              </Message>
            </ConversationContent>
            <ConversationScrollButton className="bg-background/80 backdrop-blur z-50" />
          </Conversation>

          <div className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-2">
            <PromptInput onSubmit={(e) => e.preventDefault()}>
              <PromptInputToolbar>
                <PromptInputTools>
                  <ToolMenu
                    onUploadDocument={() => console.log('upload document')}
                    onUploadImage={() => console.log('upload image')}
                    onWebcam={() => console.log('webcam')}
                    onScreenShare={() => console.log('screen share')}
                    onROI={() => console.log('roi calculator')}
                  />
                </PromptInputTools>
                <PromptInputModelSelect value={model} onValueChange={setModel}>
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue placeholder="Select model" />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    <PromptInputModelSelectItem value="gpt-4o-mini">gpt-4o-mini</PromptInputModelSelectItem>
                    <PromptInputModelSelectItem value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</PromptInputModelSelectItem>
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputToolbar>
              <PromptInputTextarea
                placeholder="Message F.B/c…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex items-center justify-between p-1">
                <Suggestions>
                  <Suggestion suggestion="Summarize this" />
                  <Suggestion suggestion="Write an email" />
                  <Suggestion suggestion="Outline a plan" />
                </Suggestions>
                <div className="flex items-center gap-1">
                  <PromptInputButton
                    aria-label="Simulate error"
                    variant="ghost"
                    className="hidden md:inline-flex text-muted-foreground"
                    onClick={() => setError(new Error('Demo error: Something went wrong'))}
                  >
                    Error
                  </PromptInputButton>
                  <PromptInputButton
                    aria-label="Open voice overlay"
                    variant="ghost"
                    onClick={() => setOpenVoice(true)}
                  >
                    <FbcIcon className="h-4 w-4" />
                  </PromptInputButton>
                  <PromptInputSubmit status={!input ? 'submitted' : undefined} />
                </div>
              </div>
            </PromptInput>
          </div>
          {/* Voice overlay trigger */}
          <VoiceOverlay open={openVoice} onCancel={() => setOpenVoice(false)} onAccept={() => setOpenVoice(false)} />
          {/* Error overlay */}
          {error && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
              <div className="max-w-md w-full">
                <ErrorHandler error={error} onRetry={() => setError(null)} onReset={() => setError(null)} context="chat" />
              </div>
            </div>
          )}
          {/* Floating right rail: Lead progress (opens left on hover) */}
          <div className="pointer-events-none fixed right-4 top-28 z-50 hidden md:block">
            <div className="pointer-events-auto">
              <LeadProgressIndicator
                currentStage={ConversationStage.BACKGROUND_RESEARCH}
                variant="card"
                className="shadow-xl"
              />
            </div>
          </div>
        </div>
        {/* Canvas overlay */}
        <CanvasWorkspace
          open={!!canvas}
          title={canvas?.type === 'screen' ? 'Screen Share' : canvas?.type === 'webcam' ? 'Webcam' : canvas?.type === 'video' ? 'Video to App' : 'Web Preview'}
          onClose={() => setCanvas(null)}
          left={
            <div>
              <p className="mb-2 text-muted-foreground">Context</p>
              <ul className="space-y-1">
                <li>Model: {model}</li>
                {canvas?.url && <li>URL: {canvas.url}</li>}
              </ul>
            </div>
          }
          consoleArea={<div className="text-muted-foreground">Logs appear here; wired per tool.</div>}
        >
          {canvas?.type === 'webpreview' && (
            <WebPreview defaultUrl={canvas.url || ''}>
              <WebPreviewNavigation>
                <WebPreviewNavigationButton tooltip="Back" aria-label="Back">
                  <ArrowLeftIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward">
                  <ArrowRightIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody className="h-full" />
              <WebPreviewConsole />
            </WebPreview>
          )}
          {canvas?.type === 'screen' && (
            <div className="h-full p-3">
              <ScreenShare
                mode="canvas"
                onAnalysis={(a) => console.log('screen analysis', a)}
                onClose={() => setCanvas(null)}
              />
            </div>
          )}
          {canvas?.type === 'webcam' && (
            <div className="h-full p-3">
              <WebcamCapture
                mode="canvas"
                onCapture={(img) => console.log('webcam img', img)}
                onClose={() => setCanvas(null)}
                onAIAnalysis={(a) => console.log('webcam analysis', a)}
              />
            </div>
          )}
          {canvas?.type === 'video' && (
            <div className="h-full p-3">
              <VideoToApp
                mode="canvas"
                videoUrl={canvas.url}
                onClose={() => setCanvas(null)}
                onAppGenerated={(url) => console.log('app generated', url)}
                onAnalysisComplete={(data) => console.log('video analysis', data)}
              />
            </div>
          )}
        </CanvasWorkspace>
      </div>
    </TooltipProvider>
  )
}


