'use client'

import { useEffect, useRef } from 'react'
import { Stack, Text, Heading } from './ui'
import { HashIcon, LockIcon } from './icons'
import { getChannel, getUser, type Message } from '@/lib/data'
import { MessageItem } from './message-item'

function DayDivider({ label }: { label: string }) {
  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="condensed"
      role="separator"
      aria-label={label}
      style={{ paddingInline: 'var(--base-size-20)' }}
    >
      <span
        aria-hidden
        style={{
          flex: 1,
          borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        }}
      />
      <span
        style={{
          padding: 'var(--base-size-4) var(--base-size-12)',
          borderRadius: 'var(--borderRadius-full)',
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundColor: 'var(--bgColor-default)',
        }}
      >
        <Text size="small" weight="semibold">
          {label}
        </Text>
      </span>
      <span
        aria-hidden
        style={{
          flex: 1,
          borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        }}
      />
    </Stack>
  )
}

function ConversationIntro({ conversationId }: { conversationId: string }) {
  if (conversationId.startsWith('channel:')) {
    const channel = getChannel(conversationId.slice('channel:'.length))
    if (!channel) return null
    const Icon = channel.isPrivate ? LockIcon : HashIcon
    return (
      <Stack direction="vertical" gap="condensed" padding="spacious">
        <Stack direction="horizontal" gap="condensed" align="center">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--base-size-48)',
              height: 'var(--base-size-48)',
              borderRadius: 'var(--borderRadius-large)',
              backgroundColor: 'var(--bgColor-accent-muted)',
              color: 'var(--fgColor-accent)',
            }}
          >
            <Icon size={24} />
          </span>
          <Heading as="h2" variant="medium">
            Welcome to #{channel.name}
          </Heading>
        </Stack>
        <Text style={{ color: 'var(--fgColor-muted)', maxWidth: 560 }}>
          {channel.description || 'This is the very beginning of the channel.'}{' '}
          {channel.memberIds.length}{' '}
          {channel.memberIds.length === 1 ? 'member' : 'members'} can see this
          conversation.
        </Text>
      </Stack>
    )
  }
  const user = getUser(conversationId.slice('dm:'.length))
  return (
    <Stack direction="vertical" gap="condensed" padding="spacious">
      <Heading as="h2" variant="medium">
        {user.name}
      </Heading>
      <Text style={{ color: 'var(--fgColor-muted)', maxWidth: 560 }}>
        This conversation is just between you and {user.name.split(' ')[0]}.{' '}
        {user.title}, @{user.handle}.
      </Text>
    </Stack>
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
  const count = messages.length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [conversationId, count])

  let lastDay: string | null = null

  return (
    <div className="chat-scroll">
      <ConversationIntro conversationId={conversationId} />
      <Stack direction="vertical" gap="condensed" style={{ paddingBottom: 'var(--base-size-16)' }}>
        {messages.map((message) => {
          const showDivider = message.day !== lastDay
          lastDay = message.day
          return (
            <div key={message.id}>
              {showDivider && <DayDivider label={message.day} />}
              <div style={{ paddingInline: 'var(--base-size-4)' }}>
                <MessageItem message={message} />
              </div>
            </div>
          )
        })}
      </Stack>
      <div ref={bottomRef} />
    </div>
  )
}
