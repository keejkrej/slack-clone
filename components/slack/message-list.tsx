'use client'

import { useEffect, useRef } from 'react'
import { HashIcon, LockIcon } from './icons'
import type { Message } from '@/lib/data'
import { MessageItem } from './message-item'
import { useWorkspace } from './workspace-provider'
import { Separator } from '@/components/ui/separator'

function DayDivider({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="flex items-center gap-3 px-5 py-2"
    >
      <Separator className="flex-1" />
      <span className="rounded-full border bg-background px-3 py-0.5 text-xs font-semibold">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}

function ConversationIntro({ conversationId }: { conversationId: string }) {
  const { channelById, userById } = useWorkspace()
  if (conversationId.startsWith('channel:')) {
    const channel = channelById(conversationId.slice('channel:'.length))
    if (!channel) return null
    const Icon = channel.isPrivate ? LockIcon : HashIcon
    return (
      <div className="flex flex-col gap-2 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Icon className="size-6" />
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome to #{channel.name}
          </h2>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          {channel.description || 'This is the very beginning of the channel.'}{' '}
          {channel.memberIds.length}{' '}
          {channel.memberIds.length === 1 ? 'member' : 'members'} can see this
          conversation.
        </p>
      </div>
    )
  }
  const user = userById(conversationId.slice('dm:'.length))
  return (
    <div className="flex flex-col gap-2 px-6 py-6">
      <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
      <p className="max-w-xl text-sm text-muted-foreground">
        This conversation is just between you and {user.name.split(' ')[0]}.{' '}
        {user.title}, @{user.handle}.
      </p>
    </div>
  )
}

export function MessageList({
  conversationId,
  messages,
}: {
  conversationId: string
  messages: Message[]
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { highlightMessageId } = useWorkspace()
  const count = messages.length

  useEffect(() => {
    if (highlightMessageId) {
      const el = document.getElementById(`message-${highlightMessageId}`)
      if (el) {
        el.scrollIntoView({ block: 'center' })
        return
      }
    }
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversationId, count, highlightMessageId])

  let lastDay: string | null = null
  let lastAuthor: string | null = null

  return (
    <div className="chat-scroll">
      <ConversationIntro conversationId={conversationId} />
      <div className="flex flex-col pb-4">
        {messages.map((message, index) => {
          const showDivider = message.day !== lastDay
          const compact =
            !showDivider &&
            lastAuthor === message.authorId &&
            !message.deleted &&
            index > 0 &&
            !messages[index - 1].deleted
          lastDay = message.day
          lastAuthor = message.authorId
          return (
            <div key={message.id}>
              {showDivider && <DayDivider label={message.day} />}
              <MessageItem message={message} compact={compact} />
            </div>
          )
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}
