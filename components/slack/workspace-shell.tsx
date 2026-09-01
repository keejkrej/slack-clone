'use client'

import { conversationLabel } from '@/lib/data'
import { WorkspaceProvider, useWorkspace } from './workspace-provider'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { ConversationHeader } from './conversation-header'
import { MessageList } from './message-list'
import { Composer } from './composer'
import { ThreadPane } from './thread-pane'
import { SearchResults } from './search-results'

function Shell() {
  const { activeConversationId, activeThreadId, messages, sendMessage, searchQuery } =
    useWorkspace()

  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversationId && !m.parentId,
  )
  const searching = searchQuery.trim().length > 0

  return (
    <div className="chat-shell">
      <TopBar />
      <div className="chat-body">
        <Sidebar />
        <main className="chat-main" aria-live="polite">
          {searching ? (
            <SearchResults query={searchQuery} />
          ) : (
            <>
              <ConversationHeader conversationId={activeConversationId} />
              <MessageList
                conversationId={activeConversationId}
                messages={conversationMessages}
              />
              <div style={{ padding: '0 var(--base-size-20) var(--base-size-20)', flexShrink: 0 }}>
                <Composer
                  key={activeConversationId}
                  placeholder={`Message ${conversationLabel(activeConversationId)}`}
                  onSend={(text) => sendMessage(activeConversationId, text)}
                />
              </div>
            </>
          )}
        </main>
        {activeThreadId && !searching && <ThreadPane key={activeThreadId} messageId={activeThreadId} />}
      </div>
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
