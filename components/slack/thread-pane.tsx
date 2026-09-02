'use client'

import { useEffect, useRef } from 'react'
import { Stack, Text, Heading, IconButton } from './ui'
import { XIcon } from './icons'
import { conversationLabel, getUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { MessageItem } from './message-item'
import { Composer } from './composer'

export function ThreadPane({ messageId }: { messageId: string }) {
  const { messages, closeThread, sendMessage } = useWorkspace()
  const parent = messages.find((m) => m.id === messageId)
  const replies = messages.filter((m) => m.parentId === messageId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [replies.length])

  if (!parent) return null

  const author = getUser(parent.authorId)

  return (
    <section className="chat-thread" aria-label={`Thread with ${author.name}`}>
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        style={{
          height: 'var(--base-size-48)',
          paddingInline: 'var(--base-size-16)',
          borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          flexShrink: 0,
        }}
      >
        <Stack direction="horizontal" align="baseline" gap="condensed">
          <Heading as="h2" variant="small">
            Thread
          </Heading>
          <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
            {conversationLabel(parent.conversationId)}
          </Text>
        </Stack>
        <IconButton
          icon={XIcon}
          aria-label="Close thread"
          variant="invisible"
          onClick={closeThread}
        />
      </Stack>

      <div className="chat-scroll" style={{ paddingBlock: 'var(--base-size-12)' }}>
        <div style={{ paddingInline: 'var(--base-size-4)' }}>
          <MessageItem message={parent} compact showThreadSummary={false} />
        </div>

        <Stack
          direction="horizontal"
          align="center"
          gap="condensed"
          style={{ padding: 'var(--base-size-8) var(--base-size-20)' }}
        >
          <Text size="small" weight="semibold" style={{ color: 'var(--fgColor-muted)', whiteSpace: 'nowrap' }}>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </Text>
          <span
            aria-hidden
            style={{
              flex: 1,
              borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            }}
          />
        </Stack>

        <Stack direction="vertical" gap="condensed" style={{ paddingInline: 'var(--base-size-4)' }}>
          {replies.map((reply) => (
            <MessageItem key={reply.id} message={reply} compact showThreadSummary={false} />
          ))}
        </Stack>
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 'var(--base-size-12) var(--base-size-16)', flexShrink: 0 }}>
        <Composer
          compact
          autoFocus
          placeholder="Reply..."
          onSend={(text) => sendMessage(parent.conversationId, text, parent.id)}
        />
      </div>
    </section>
  )
}
