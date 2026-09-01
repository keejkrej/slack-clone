'use client'

import { useState } from 'react'
import { Stack, Text, IconButton, Button, AvatarStack, Avatar } from '@primer/react'
import { CommentDiscussionIcon, ReplyIcon } from '@primer/octicons-react'
import { CURRENT_USER_ID, getUser, type Message } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { ReactionPicker } from './reaction-picker'

export function MessageItem({
  message,
  compact = false,
  showThreadSummary = true,
}: {
  message: Message
  /** Compact rows are used inside the thread pane */
  compact?: boolean
  showThreadSummary?: boolean
}) {
  const { toggleReaction, openThread, replyCount, messages } = useWorkspace()
  const [pickerOpen, setPickerOpen] = useState(false)
  const author = getUser(message.authorId)
  const replies = showThreadSummary ? replyCount(message.id) : 0

  const lastReplyAuthors = showThreadSummary
    ? Array.from(
        new Set(
          messages
            .filter((m) => m.parentId === message.id)
            .map((m) => m.authorId),
        ),
      ).slice(0, 3)
    : []

  return (
    <article
      className="chat-message"
      aria-label={`Message from ${author.name} at ${message.time}`}
    >
      <Stack direction="horizontal" gap="condensed" align="start">
        <PresenceAvatar user={author} size={compact ? 32 : 36} showPresence={false} />
        <Stack direction="vertical" gap="none" style={{ minWidth: 0, flex: 1 }}>
          <Stack direction="horizontal" gap="condensed" align="baseline">
            <Text weight="semibold" size="medium">
              {author.name}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {message.time}
            </Text>
          </Stack>
          <Text
            as="p"
            size="medium"
            style={{
              lineHeight: 1.5,
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.text}
          </Text>

          {(message.reactions.length > 0 || replies > 0) && (
            <Stack
              direction="vertical"
              gap="condensed"
              style={{ marginTop: 'var(--base-size-8)' }}
            >
              {message.reactions.length > 0 && (
                <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
                  {message.reactions.map((reaction) => {
                    const active = reaction.userIds.includes(CURRENT_USER_ID)
                    const who = reaction.userIds.map((id) => getUser(id).name).join(', ')
                    return (
                      <button
                        key={reaction.emoji}
                        type="button"
                        className="chat-reaction"
                        data-active={active}
                        aria-pressed={active}
                        aria-label={`${reaction.emoji} ${reaction.userIds.length}, reacted by ${who}`}
                        title={who}
                        onClick={() => toggleReaction(message.id, reaction.emoji)}
                      >
                        <span aria-hidden>{reaction.emoji}</span>
                        <span>{reaction.userIds.length}</span>
                      </button>
                    )
                  })}
                  <ReactionPicker
                    onPick={(emoji) => toggleReaction(message.id, emoji)}
                  />
                </Stack>
              )}

              {replies > 0 && (
                <Stack direction="horizontal" gap="condensed" align="center">
                  <AvatarStack size={20}>
                    {lastReplyAuthors.map((id) => {
                      const u = getUser(id)
                      return <Avatar key={id} src={u.avatar} alt={u.name} square />
                    })}
                  </AvatarStack>
                  <Button
                    variant="link"
                    size="small"
                    onClick={() => openThread(message.id)}
                  >
                    {replies} {replies === 1 ? 'reply' : 'replies'}
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>

      <div
        className="chat-message-actions"
        data-open={pickerOpen}
        style={{
          display: 'flex',
          gap: 2,
          padding: 2,
          backgroundColor: 'var(--bgColor-default)',
          border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          borderRadius: 'var(--borderRadius-medium)',
          boxShadow: 'var(--shadow-resting-small)',
        }}
      >
        <ReactionPicker
          onPick={(emoji) => toggleReaction(message.id, emoji)}
          onOpenChange={setPickerOpen}
        />
        {showThreadSummary && (
          <IconButton
            icon={CommentDiscussionIcon}
            aria-label="Reply in thread"
            variant="invisible"
            size="small"
            onClick={() => openThread(message.id)}
          />
        )}
        {!showThreadSummary && (
          <IconButton
            icon={ReplyIcon}
            aria-label="Quote reply"
            variant="invisible"
            size="small"
          />
        )}
      </div>
    </article>
  )
}
