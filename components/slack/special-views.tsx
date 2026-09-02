'use client'

import { CURRENT_USER_ID, conversationLabel, mentionsCurrentUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { MessageItem } from './message-item'
import { Button } from '@/components/ui/button'
import { BookmarkIcon, CommentDiscussionIcon, InboxIcon } from './icons'

export function ThreadsView() {
  const { messages, channels, users, openThread, replyCount, canAccessConversation } =
    useWorkspace()
  const parents = messages.filter((m) => {
    if (m.parentId || m.deleted) return false
    if (!canAccessConversation(m.conversationId)) return false
    const replies = messages.filter((r) => r.parentId === m.id && !r.deleted)
    if (replies.length === 0) return false
    return (
      m.authorId === CURRENT_USER_ID ||
      replies.some((r) => r.authorId === CURRENT_USER_ID)
    )
  })

  return (
    <div className="chat-scroll">
      <header className="shrink-0 border-b px-6 py-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <CommentDiscussionIcon className="size-5" /> All threads
        </h1>
        <p className="text-sm text-muted-foreground">
          Threads you started or replied to.
        </p>
      </header>
      {parents.length === 0 ? (
        <Empty
          title="No threads yet"
          body="Reply to a message to start a thread. They’ll show up here."
        />
      ) : (
        <div className="flex flex-col divide-y">
          {parents.map((message) => (
            <div key={message.id} className="px-2 py-2">
              <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
                {conversationLabel(message.conversationId, channels, users)} ·{' '}
                {replyCount(message.id)}{' '}
                {replyCount(message.id) === 1 ? 'reply' : 'replies'}
              </p>
              <MessageItem message={message} />
              <div className="px-5 pb-2">
                <Button size="sm" variant="ghost" onClick={() => openThread(message.id)}>
                  Open thread
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ActivityView() {
  const { messages, users, channels, jumpToMessage, canAccessConversation } =
    useWorkspace()
  const items = messages.filter((m) => {
    if (m.deleted) return false
    if (!canAccessConversation(m.conversationId)) return false
    if (mentionsCurrentUser(m, users) && m.authorId !== CURRENT_USER_ID) return true
    if (
      m.authorId === CURRENT_USER_ID &&
      m.reactions.some((r) => r.userIds.some((id) => id !== CURRENT_USER_ID))
    ) {
      return true
    }
    return false
  })

  return (
    <div className="chat-scroll">
      <header className="shrink-0 border-b px-6 py-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <InboxIcon className="size-5" /> Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          Mentions of you and reactions on your messages.
        </p>
      </header>
      {items.length === 0 ? (
        <Empty title="You're all caught up" body="Mentions and reactions will land here." />
      ) : (
        <div className="flex flex-col">
          {items.map((message) => {
            const mentioned = mentionsCurrentUser(message, users)
            return (
              <div key={message.id} className="border-b px-2 py-2">
                <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
                  {mentioned ? 'Mentioned you' : 'Reacted to your message'} ·{' '}
                  {conversationLabel(message.conversationId, channels, users)}
                </p>
                <MessageItem message={message} showThreadSummary />
                <div className="px-5 pb-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => jumpToMessage(message)}
                  >
                    Jump to conversation
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function SavedView() {
  const { messages, channels, users, jumpToMessage, canAccessConversation } =
    useWorkspace()
  const saved = messages.filter(
    (m) => m.saved && !m.deleted && canAccessConversation(m.conversationId),
  )

  return (
    <div className="chat-scroll">
      <header className="shrink-0 border-b px-6 py-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <BookmarkIcon className="size-5" /> Saved items
        </h1>
        <p className="text-sm text-muted-foreground">
          Messages you’ve bookmarked for later.
        </p>
      </header>
      {saved.length === 0 ? (
        <Empty
          title="Nothing saved yet"
          body="Hover a message and choose Save for later."
        />
      ) : (
        <div className="flex flex-col">
          {saved.map((message) => (
            <div key={message.id} className="border-b px-2 py-2">
              <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
                {conversationLabel(message.conversationId, channels, users)}
              </p>
              <MessageItem message={message} />
              <div className="px-5 pb-2">
                <Button size="sm" variant="ghost" onClick={() => jumpToMessage(message)}>
                  Jump to conversation
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
