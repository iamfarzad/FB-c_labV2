'use client'

import { useState } from 'react'

import { Actions, Action } from '@/components/ai-elements/actions'
import {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
} from '@/components/ai-elements/branch'
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Image as AIGeneratedImage } from '@/components/ai-elements/image'
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from '@/components/ai-elements/inline-citation'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from '@/components/ai-elements/prompt-input'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Response } from '@/components/ai-elements/response'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from '@/components/ai-elements/task'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from '@/components/ai-elements/web-preview'
import { Button } from '@/components/ui/button'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => e.preventDefault()}
        >
          Example <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function AIElementsGalleryPage() {
  const [model, setModel] = useState('gpt-4o-mini')
  const [prompt, setPrompt] = useState('')
  const [webLogs] = useState([
    { level: 'log' as const, message: 'Console initialized', timestamp: new Date() },
  ])

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FbcIcon className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                F.B/c — AI Elements Gallery
              </h1>
              <p className="text-sm text-muted-foreground">
                Brand-styled preview of all components from AI Elements.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-orange-accent/40 text-orange-accent hover:bg-orange-accent/10">
            <a href="/" aria-label="Back to home" className="">Back</a>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Section title="Actions">
            <Actions>
              <Action tooltip="Copy" aria-label="copy">📋</Action>
              <Action tooltip="Refresh" aria-label="refresh">🔄</Action>
              <Action tooltip="Delete" aria-label="delete">🗑️</Action>
            </Actions>
          </Section>

          <Section title="Branch">
            <Branch defaultBranch={0}>
              <BranchMessages>
                <div key="a" className="rounded-md border p-2">Branch A content</div>
                <div key="b" className="rounded-md border p-2">Branch B content</div>
                <div key="c" className="rounded-md border p-2">Branch C content</div>
              </BranchMessages>
              <BranchSelector from="assistant" className="flex items-center gap-2">
                <BranchPrevious />
                <BranchPage />
                <BranchNext />
              </BranchSelector>
            </Branch>
          </Section>

          <Section title="CodeBlock + Copy">
            <CodeBlock code={`console.log('hello world')`} language="ts">
              <CodeBlockCopyButton />
            </CodeBlock>
          </Section>

          <Section title="Conversation">
            <Conversation className="h-48 rounded-md border">
              <ConversationContent>
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i}>Line {i + 1}</p>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </Section>

          <Section title="Generated Image">
            <div className="rounded-md border p-2">
              <AIGeneratedImage
                base64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                uint8Array={new Uint8Array()}
                mediaType="image/png"
                alt="1x1 PNG"
                className="h-16 w-16"
              />
            </div>
          </Section>

          <Section title="Inline Citation">
            <InlineCitation>
              <InlineCitationText>OpenAI released a new model</InlineCitationText>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={[
                  'https://openai.com/research',
                  'https://example.com/article'
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
                        <InlineCitationSource
                          title="OpenAI Research"
                          url="https://openai.com/research"
                          description="Latest papers and results"
                        />
                        <InlineCitationQuote>
                          “A brief quoted sentence from the source.”
                        </InlineCitationQuote>
                      </InlineCitationCarouselItem>
                      <InlineCitationCarouselItem>
                        <InlineCitationSource
                          title="Example Article"
                          url="https://example.com/article"
                          description="Secondary reference"
                        />
                      </InlineCitationCarouselItem>
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          </Section>

          <Section title="Loader">
            <div className="flex items-center gap-3">
              <Loader />
              <Loader size={20} />
              <Loader size={24} />
            </div>
          </Section>

          <Section title="Message">
            <Message from="assistant">
              <MessageAvatar src="/placeholder-user.jpg" name="AI" />
              <MessageContent>
                <Response>
                  {`Hello! This is an assistant message with some markdown:\n\n- Item A\n- Item B`}
                </Response>
              </MessageContent>
            </Message>
          </Section>

          <Section title="Prompt Input">
            <PromptInput>
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputButton variant="ghost">Attach</PromptInputButton>
                  <PromptInputButton variant="ghost">Image</PromptInputButton>
                </PromptInputTools>
                <PromptInputModelSelect value={model} onValueChange={setModel}>
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue placeholder="Select model" />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    <PromptInputModelSelectItem value="gpt-4o-mini">
                      gpt-4o-mini
                    </PromptInputModelSelectItem>
                    <PromptInputModelSelectItem value="gemini-2.0-flash-exp">
                      gemini-2.0-flash-exp
                    </PromptInputModelSelectItem>
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputToolbar>
              <PromptInputTextarea
                placeholder="Type your prompt…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex items-center justify-between p-1">
                <Suggestions>
                  <Suggestion suggestion="Summarize this">Summarize this</Suggestion>
                  <Suggestion suggestion="Write an email" />
                  <Suggestion suggestion="Outline a plan" />
                </Suggestions>
                <PromptInputSubmit status={prompt ? undefined : 'submitted'} />
              </div>
            </PromptInput>
          </Section>

          <Section title="Reasoning">
            <Reasoning defaultOpen isStreaming={false} duration={4}>
              <ReasoningTrigger />
              <ReasoningContent>
                {`Thinking steps:\n1. Read the input\n2. Analyze requirements\n3. Produce an output`}
              </ReasoningContent>
            </Reasoning>
          </Section>

          <Section title="Response (Markdown)">
            <Response>
              {`### Title\n\nSome text with **bold**, _italic_, and \`inline code\`.\n\n\n\n\n\n\n\n\n\n`}
            </Response>
          </Section>

          <Section title="Sources">
            <Sources>
              <SourcesTrigger count={2} />
              <SourcesContent>
                <Source href="https://example.com/1" title="Example Source 1" />
                <Source href="https://example.com/2" title="Example Source 2" />
              </SourcesContent>
            </Sources>
          </Section>

          <Section title="Task">
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
          </Section>

          <Section title="Tool">
            <Tool defaultOpen>
              <ToolHeader type="tool-search-web" state="output-available" />
              <ToolContent>
                <ToolInput input={{ query: 'what is ai elements?' }} />
                <ToolOutput output={<div>Some result content…</div>} errorText={undefined} />
              </ToolContent>
            </Tool>
          </Section>

          <Section title="Web Preview">
            <WebPreview defaultUrl="https://example.com">
              <WebPreviewNavigation>
                <WebPreviewNavigationButton tooltip="Back" aria-label="Back">
                  <ArrowLeftIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward">
                  <ArrowRightIcon className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody className="h-56" />
              <WebPreviewConsole logs={webLogs} />
            </WebPreview>
          </Section>
        </div>
      </div>

      
    </TooltipProvider>
  )
}

 
