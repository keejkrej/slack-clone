'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CURRENT_USER_ID, initials, type Message } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { ReactionPicker } from './reaction-picker'
import { MessageBody } from './message-body'
import { UserHoverCard } from './user-profile'
import {
  BookmarkIcon,
  CommentDiscussionIcon,
  KebabHorizontalIcon,
  PencilIcon,
  PinIcon,
  QuoteIcon,
  ReplyIcon,
  TrashIcon,
} from './icons'

export function MessageItem({
  message,
  compact = false,
  showThreadSummary = true,
}: {
  message: Message
  compact?: boolean
  showThreadSummary?: boolean
}) {
  const {
    toggleReaction,
    openThread,
    replyCount,
    messages,
    users,
    userById,
    editMessage,
    deleteMessage,
    togglePin,
    toggleSave,
    quoteReply,
    highlightMessageId,
  } = useWorkspace()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.text)
  const author = userById(message.authorId)
  const replies = showThreadSummary ? replyCount(message.id) : 0
  const mine = message.authorId === CURRENT_USER_ID
  const highlighted = highlightMessageId === message.id

  const lastReplyAuthors = showThreadSummary
    ? Array.from(
        new Set(
          messages
            .filter((m) => m.parentId === message.id && !m.deleted)
            .map((m) => m.authorId),
        ),
      ).slice(0, 3)
    : []

  useEffect(() => {
    setDraft(message.text)
  }, [message.text])

  const saveEdit = () => {
    if (!draft.trim() || draft.trim() === message.text) {
      setEditing(false)
      setDraft(message.text)
      return
    }
    editMessage(message.id, draft)
    setEditing(false)
  }

  const threadId = message.parentId ?? (showThreadSummary ? undefined : message.id)

  const actions = {
    reply: () => openThread(message.parentId ?? message.id),
    pin: () => {
      togglePin(message.id)
      toast.success(message.pinned ? 'Unpinned message' : 'Pinned message')
    },
    save: () => {
      toggleSave(message.id)
      toast.success(message.saved ? 'Removed from saved items' : 'Saved for later')
    },
    quote: () => {
      quoteReply(message.conversationId, message.text, threadId)
      toast.success('Quoted in the composer')
    },
    edit: () => {
      setDraft(message.text)
      setEditing(true)
    },
    remove: () => {
      deleteMessage(message.id)
      toast.success('Message deleted')
    },
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">
        <article
          id={`message-${message.id}`}
          className={cn('chat-message group px-5', compact ? 'py-0.5' : 'py-2')}
          data-highlight={highlighted}
          data-open={menuOpen}
          aria-label={`Message from ${author.name} at ${message.time}`}
        >
          <div className="flex gap-2">
            {compact ? (
              <span className="w-9 shrink-0 pt-1 text-center text-[10px] text-transparent group-hover:text-muted-foreground">
                {message.time.replace(/\s[AP]M/, '')}
              </span>
            ) : (
              <UserHoverCard user={author}>
                <PresenceAvatar user={author} size={36} showPresence={false} />
              </UserHoverCard>
            )}
            <div className="min-w-0 flex-1">
              {!compact && (
                <div className="flex items-baseline gap-2">
                  <UserHoverCard user={author}>
                    <span className="text-sm font-bold hover:underline">
                      {author.name}
                    </span>
                  </UserHoverCard>
                  <time className="text-xs text-muted-foreground">{message.time}</time>
                  {message.edited && !message.deleted && (
                    <span className="text-xs text-muted-foreground">(edited)</span>
                  )}
                  {message.pinned && (
                    <span className="text-xs text-muted-foreground">Pinned</span>
                  )}
                </div>
              )}

              {message.deleted ? (
                <p className="text-sm italic text-muted-foreground">
                  This message was deleted.
                </p>
              ) : editing ? (
                <div className="mt-1 flex flex-col gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        saveEdit()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditing(false)
                        setDraft(message.text)
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(false)
                        setDraft(message.text)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <MessageBody text={message.text} users={users} />
              )}

              {!message.deleted && (message.reactions.length > 0 || replies > 0) && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {message.reactions.map((reaction) => {
                        const active = reaction.userIds.includes(CURRENT_USER_ID)
                        const who = reaction.userIds
                          .map((id) => userById(id).name)
                          .join(', ')
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
                    </div>
                  )}

                  {replies > 0 && (
                    <button
                      type="button"
                      className="flex w-fit items-center gap-2 rounded-md py-0.5 text-sm text-sky-700 hover:underline"
                      onClick={() => openThread(message.id)}
                    >
                      <span className="flex -space-x-1">
                        {lastReplyAuthors.map((id) => {
                          const u = userById(id)
                          return (
                            <Avatar
                              key={id}
                              className="size-5 rounded-md after:rounded-md"
                            >
                              <AvatarImage src={u.avatar} alt={u.name} className="rounded-md" />
                              <AvatarFallback className="rounded-md text-[8px]">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                          )
                        })}
                      </span>
                      {replies} {replies === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {!message.deleted && !editing && (
            <div
              className="chat-message-actions flex items-center gap-0.5 rounded-md border bg-background p-0.5 shadow-sm"
              data-open={menuOpen}
            >
              <ReactionPicker
                onPick={(emoji) => toggleReaction(message.id, emoji)}
                onOpenChange={setMenuOpen}
              />
              {showThreadSummary && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Reply in thread"
                        onClick={actions.reply}
                      />
                    }
                  >
                    <CommentDiscussionIcon />
                  </TooltipTrigger>
                  <TooltipContent>Reply in thread</TooltipContent>
                </Tooltip>
              )}
              {!showThreadSummary && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Quote reply"
                        onClick={actions.quote}
                      />
                    }
                  >
                    <ReplyIcon />
                  </TooltipTrigger>
                  <TooltipContent>Quote reply</TooltipContent>
                </Tooltip>
              )}
              <DropdownMenu onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="More message actions"
                    />
                  }
                >
                  <KebabHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {showThreadSummary && (
                    <DropdownMenuItem onClick={actions.reply}>
                      <CommentDiscussionIcon /> Reply in thread
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={actions.quote}>
                    <QuoteIcon /> Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={actions.pin}>
                    <PinIcon /> {message.pinned ? 'Unpin' : 'Pin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={actions.save}>
                    <BookmarkIcon /> {message.saved ? 'Unsave' : 'Save for later'}
                  </DropdownMenuItem>
                  {mine && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={actions.edit}>
                        <PencilIcon /> Edit message
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={actions.remove}>
                        <TrashIcon /> Delete message
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </article>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {showThreadSummary && (
          <ContextMenuItem onClick={actions.reply}>Reply in thread</ContextMenuItem>
        )}
        <ContextMenuItem onClick={actions.quote}>Quote</ContextMenuItem>
        <ContextMenuItem onClick={actions.pin}>
          {message.pinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        <ContextMenuItem onClick={actions.save}>
          {message.saved ? 'Unsave' : 'Save for later'}
        </ContextMenuItem>
        {mine && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={actions.edit}>Edit message</ContextMenuItem>
            <ContextMenuItem variant="destructive" onClick={actions.remove}>
              Delete message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
