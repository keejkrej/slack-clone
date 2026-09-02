'use client'

import { useEffect, useState } from 'react'
import { conversationLabel } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { WorkspaceProvider, useWorkspace } from './workspace-provider'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { ConversationHeader } from './conversation-header'
import { MessageList } from './message-list'
import { Composer } from './composer'
import { ThreadPane } from './thread-pane'
import { SearchResults } from './search-results'
import { ActivityView, SavedView, ThreadsView } from './special-views'
import { JumpTo } from './jump-to'
import { useMediaQuery } from './use-media-query'

function Shell() {
  const {
    activeConversationId,
    activeThreadId,
    messages,
    searchQuery,
    setSearch,
    closeThread,
    view,
    channels,
    users,
    isMember,
    joinChannel,
    channelById,
  } = useWorkspace()
  const [jumpOpen, setJumpOpen] = useState(false)
  const isNarrow = useMediaQuery('(max-width: 768px)')

  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId && !m.parentId,
  )
  const searching = searchQuery.trim().length > 0
  const channelId = activeConversationId.startsWith('channel:')
    ? activeConversationId.slice('channel:'.length)
    : null
  const channel = channelId ? channelById(channelId) : undefined
  const member = channelId ? isMember(channelId) : true

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setJumpOpen(true)
        return
      }
      if (e.key === 'Escape') {
        if (e.defaultPrevented) return
        if (searchQuery) {
          setSearch('')
          return
        }
        if (activeThreadId && !isNarrow) closeThread()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchQuery, activeThreadId, isNarrow, setSearch, closeThread])

  const thread = activeThreadId && !searching ? (
    <ThreadPane key={activeThreadId} messageId={activeThreadId} />
  ) : null

  return (
    <div className="chat-shell">
      <TopBar onJump={() => setJumpOpen(true)} />
      <div className="chat-body">
        <Sidebar />
        <main className="chat-main" aria-live="polite">
          {searching ? (
            <SearchResults query={searchQuery} />
          ) : view === 'threads' ? (
            <ThreadsView />
          ) : view === 'activity' ? (
            <ActivityView />
          ) : view === 'saved' ? (
            <SavedView />
          ) : (
            <>
              <ConversationHeader conversationId={activeConversationId} />
              <MessageList
                conversationId={activeConversationId}
                messages={channel?.isPrivate && !member ? [] : conversationMessages}
              />
              <div className="shrink-0 px-5 pb-4">
                {channel && !member ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                    {channel.isPrivate ? (
                      <p className="text-sm">
                        You no longer have access to this private channel.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm">
                          You are viewing #{channel.name}. Join to send messages.
                        </p>
                        <Button size="sm" onClick={() => joinChannel(channel.id)}>
                          Join channel
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <Composer
                    conversationId={activeConversationId}
                    placeholder={`Message ${conversationLabel(activeConversationId, channels, users)}`}
                  />
                )}
              </div>
            </>
          )}
        </main>
        {thread && !isNarrow && <aside className="chat-thread">{thread}</aside>}
        {thread && isNarrow && (
          <Sheet
            open
            onOpenChange={(open) => {
              if (!open) closeThread()
            }}
          >
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-full p-0 sm:max-w-md"
            >
              {thread}
            </SheetContent>
          </Sheet>
        )}
      </div>
      <JumpTo open={jumpOpen} onOpenChange={setJumpOpen} />
    </div>
  )
}

export function WorkspaceShell() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  )
}
