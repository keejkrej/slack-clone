'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { channelIdFrom, conversationLabel } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { MessageItem } from './message-item'
import { Composer } from './composer'
import { XIcon } from './icons'

export function ThreadPane({ messageId }: { messageId: string }) {
  const {
    messages,
    closeThread,
    channels,
    users,
    userById,
    highlightMessageId,
    isMember,
  } = useWorkspace()
  const parent = messages.find((m) => m.id === messageId)
  const replies = messages.filter((m) => m.parentId === messageId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (highlightMessageId) {
      const el = document.getElementById(`message-${highlightMessageId}`)
      if (el) {
        el.scrollIntoView({ block: 'center' })
        return
      }
    }
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [replies.length, highlightMessageId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      closeThread()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeThread])

  if (!parent) return null

  const author = userById(parent.authorId)
  const channelId = channelIdFrom(parent.conversationId)
  const member = channelId ? isMember(channelId) : true
  const channel = channelId ? channels.find((c) => c.id === channelId) : undefined

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-background"
      aria-label={`Thread with ${author.name}`}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold">Thread</h2>
          <span className="text-sm text-muted-foreground">
            {conversationLabel(parent.conversationId, channels, users)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close thread"
          onClick={closeThread}
        >
          <XIcon />
        </Button>
      </div>

      <div className="chat-scroll py-3">
        <MessageItem message={parent} showThreadSummary={false} />
        <div className="flex items-center gap-2 px-5 py-2">
          <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        {replies.map((reply) => (
          <MessageItem
            key={reply.id}
            message={reply}
            compact={false}
            showThreadSummary={false}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 p-3">
        {member ? (
          <Composer
            compact
            autoFocus
            conversationId={parent.conversationId}
            parentId={parent.id}
            placeholder="Reply…"
          />
        ) : (
          <p className="px-1 text-sm text-muted-foreground">
            {channel?.isPrivate
              ? 'You no longer have access to this private channel.'
              : 'Join this channel to reply in the thread.'}
          </p>
        )}
      </div>
    </section>
  )
}
