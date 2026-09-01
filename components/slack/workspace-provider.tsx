'use client'

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import {
  channels as seedChannels,
  seedMessages,
  seedUnread,
  CURRENT_USER_ID,
  type Channel,
  type Message,
} from '@/lib/data'

type State = {
  channels: Channel[]
  messages: Message[]
  unread: Record<string, number>
  activeConversationId: string
  activeThreadId: string | null
  searchQuery: string
  sidebarOpen: boolean
}

type Action =
  | { type: 'select-conversation'; conversationId: string }
  | { type: 'open-thread'; messageId: string }
  | { type: 'close-thread' }
  | { type: 'send'; conversationId: string; text: string; parentId?: string }
  | { type: 'toggle-reaction'; messageId: string; emoji: string }
  | { type: 'set-search'; query: string }
  | { type: 'create-channel'; name: string; description: string; isPrivate: boolean }
  | { type: 'toggle-sidebar'; open?: boolean }

const initialState: State = {
  channels: seedChannels,
  messages: seedMessages,
  unread: seedUnread,
  activeConversationId: 'channel:general',
  activeThreadId: null,
  searchQuery: '',
  sidebarOpen: false,
}

let idCounter = 0
function nextId() {
  idCounter += 1
  return `new-${Date.now()}-${idCounter}`
}

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select-conversation': {
      const unread = { ...state.unread }
      delete unread[action.conversationId]
      return {
        ...state,
        activeConversationId: action.conversationId,
        activeThreadId: null,
        searchQuery: '',
        unread,
        sidebarOpen: false,
      }
    }
    case 'open-thread': {
      const parent = state.messages.find((m) => m.id === action.messageId)
      if (!parent) return state
      return {
        ...state,
        activeThreadId: action.messageId,
        activeConversationId: parent.conversationId,
        searchQuery: '',
      }
    }
    case 'close-thread':
      return { ...state, activeThreadId: null }
    case 'send': {
      const text = action.text.trim()
      if (!text) return state
      const message: Message = {
        id: nextId(),
        conversationId: action.conversationId,
        authorId: CURRENT_USER_ID,
        text,
        time: nowLabel(),
        day: 'Today',
        reactions: [],
        parentId: action.parentId,
      }
      return { ...state, messages: [...state.messages, message] }
    }
    case 'toggle-reaction': {
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== action.messageId) return m
          const existing = m.reactions.find((r) => r.emoji === action.emoji)
          let reactions
          if (!existing) {
            reactions = [
              ...m.reactions,
              { emoji: action.emoji, userIds: [CURRENT_USER_ID] },
            ]
          } else if (existing.userIds.includes(CURRENT_USER_ID)) {
            reactions = m.reactions
              .map((r) =>
                r.emoji === action.emoji
                  ? {
                      ...r,
                      userIds: r.userIds.filter((id) => id !== CURRENT_USER_ID),
                    }
                  : r,
              )
              .filter((r) => r.userIds.length > 0)
          } else {
            reactions = m.reactions.map((r) =>
              r.emoji === action.emoji
                ? { ...r, userIds: [...r.userIds, CURRENT_USER_ID] }
                : r,
            )
          }
          return { ...m, reactions }
        }),
      }
    }
    case 'set-search':
      return { ...state, searchQuery: action.query }
    case 'create-channel': {
      const slug = action.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      if (!slug || state.channels.some((c) => c.id === slug)) return state
      const channel: Channel = {
        id: slug,
        name: slug,
        description: action.description.trim(),
        isPrivate: action.isPrivate,
        memberIds: [CURRENT_USER_ID],
      }
      return {
        ...state,
        channels: [...state.channels, channel],
        activeConversationId: `channel:${slug}`,
        activeThreadId: null,
        searchQuery: '',
      }
    }
    case 'toggle-sidebar':
      return {
        ...state,
        sidebarOpen: action.open ?? !state.sidebarOpen,
      }
    default:
      return state
  }
}

type WorkspaceContextValue = State & {
  selectConversation: (conversationId: string) => void
  openThread: (messageId: string) => void
  closeThread: () => void
  sendMessage: (conversationId: string, text: string, parentId?: string) => void
  toggleReaction: (messageId: string, emoji: string) => void
  setSearch: (query: string) => void
  createChannel: (name: string, description: string, isPrivate: boolean) => void
  toggleSidebar: (open?: boolean) => void
  replyCount: (messageId: string) => number
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      ...state,
      selectConversation: (conversationId) =>
        dispatch({ type: 'select-conversation', conversationId }),
      openThread: (messageId) => dispatch({ type: 'open-thread', messageId }),
      closeThread: () => dispatch({ type: 'close-thread' }),
      sendMessage: (conversationId, text, parentId) =>
        dispatch({ type: 'send', conversationId, text, parentId }),
      toggleReaction: (messageId, emoji) =>
        dispatch({ type: 'toggle-reaction', messageId, emoji }),
      setSearch: (query) => dispatch({ type: 'set-search', query }),
      createChannel: (name, description, isPrivate) =>
        dispatch({ type: 'create-channel', name, description, isPrivate }),
      toggleSidebar: (open) => dispatch({ type: 'toggle-sidebar', open }),
      replyCount: (messageId) =>
        state.messages.filter((m) => m.parentId === messageId).length,
    }),
    [state],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider')
  }
  return ctx
}
