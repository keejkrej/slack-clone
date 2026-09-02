'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import {
  channels as seedChannels,
  seedMessages,
  seedUnread,
  seedMentionUnread,
  seedStarredChannelIds,
  users as seedUsers,
  CURRENT_USER_ID,
  channelIdFrom,
  extractMentions,
  nowLabel,
  slugifyChannelName,
  type Channel,
  type Message,
  type NotificationPref,
  type Presence,
  type User,
  type WorkspaceView,
} from '@/lib/data'

export type HistoryEntry = {
  view: WorkspaceView
  conversationId: string
}

type State = {
  users: User[]
  channels: Channel[]
  messages: Message[]
  unread: Record<string, number>
  mentionUnread: Record<string, number>
  activeConversationId: string
  activeThreadId: string | null
  searchQuery: string
  sidebarOpen: boolean
  view: WorkspaceView
  starredChannelIds: string[]
  drafts: Record<string, string>
  notificationPrefs: Record<string, NotificationPref>
  history: HistoryEntry[]
  historyIndex: number
  highlightMessageId: string | null
}

type Action =
  | { type: 'select-conversation'; conversationId: string; fromHistory?: boolean }
  | { type: 'open-thread'; messageId: string }
  | { type: 'close-thread' }
  | { type: 'send'; conversationId: string; text: string; parentId?: string }
  | { type: 'toggle-reaction'; messageId: string; emoji: string }
  | { type: 'set-search'; query: string }
  | { type: 'create-channel'; name: string; description: string; isPrivate: boolean }
  | { type: 'toggle-sidebar'; open?: boolean }
  | { type: 'set-view'; view: WorkspaceView; fromHistory?: boolean }
  | { type: 'edit-message'; messageId: string; text: string }
  | { type: 'delete-message'; messageId: string }
  | { type: 'toggle-pin'; messageId: string }
  | { type: 'toggle-save'; messageId: string }
  | { type: 'toggle-star'; channelId: string }
  | { type: 'join-channel'; channelId: string }
  | { type: 'leave-channel'; channelId: string }
  | { type: 'invite-members'; channelId: string; userIds: string[] }
  | { type: 'update-channel'; channelId: string; topic?: string; description?: string }
  | { type: 'set-draft'; key: string; text: string }
  | { type: 'set-presence'; presence: Presence }
  | { type: 'set-status'; statusText: string }
  | { type: 'set-notification-pref'; conversationId: string; pref: NotificationPref }
  | { type: 'quote-reply'; conversationId: string; text: string; parentId?: string }
  | { type: 'go-back' }
  | { type: 'go-forward' }
  | { type: 'clear-highlight' }
  | {
      type: 'jump-to'
      conversationId: string
      threadId?: string | null
      messageId?: string | null
    }

const initialState: State = {
  users: seedUsers,
  channels: seedChannels,
  messages: seedMessages,
  unread: seedUnread,
  mentionUnread: seedMentionUnread,
  activeConversationId: 'channel:general',
  activeThreadId: null,
  searchQuery: '',
  sidebarOpen: false,
  view: 'conversation',
  starredChannelIds: seedStarredChannelIds,
  drafts: {},
  notificationPrefs: {},
  history: [{ view: 'conversation', conversationId: 'channel:general' }],
  historyIndex: 0,
  highlightMessageId: null,
}

let idCounter = 0
function nextId() {
  idCounter += 1
  return `new-${Date.now()}-${idCounter}`
}

function pushHistory(state: State, entry: HistoryEntry): Pick<State, 'history' | 'historyIndex'> {
  const current = state.history[state.historyIndex]
  if (current && current.view === entry.view && current.conversationId === entry.conversationId) {
    return { history: state.history, historyIndex: state.historyIndex }
  }
  const truncated = state.history.slice(0, state.historyIndex + 1)
  const history = [...truncated, entry]
  return { history, historyIndex: history.length - 1 }
}

function clearUnread(
  unread: Record<string, number>,
  mentionUnread: Record<string, number>,
  conversationId: string,
) {
  const nextUnread = { ...unread }
  const nextMentions = { ...mentionUnread }
  delete nextUnread[conversationId]
  delete nextMentions[conversationId]
  return { unread: nextUnread, mentionUnread: nextMentions }
}

function firstJoinedConversation(channels: Channel[], fallback: string): string {
  const joined = channels.find((c) => c.memberIds.includes(CURRENT_USER_ID))
  return joined ? `channel:${joined.id}` : fallback
}

function isViewingConversation(state: State, conversationId: string) {
  return state.view === 'conversation' && state.activeConversationId === conversationId
}

function conversationAccessible(channels: Channel[], conversationId: string) {
  const channelId = channelIdFrom(conversationId)
  if (!channelId) return true
  const channel = channels.find((c) => c.id === channelId)
  if (!channel) return false
  return !channel.isPrivate || channel.memberIds.includes(CURRENT_USER_ID)
}

function conversationWritable(channels: Channel[], conversationId: string) {
  const channelId = channelIdFrom(conversationId)
  if (!channelId) return true
  const channel = channels.find((c) => c.id === channelId)
  return Boolean(channel?.memberIds.includes(CURRENT_USER_ID))
}

function historyEntryAccessible(state: State, entry: HistoryEntry) {
  return (
    entry.view !== 'conversation' ||
    conversationAccessible(state.channels, entry.conversationId)
  )
}

function removeConversationFromHistory(
  history: HistoryEntry[],
  historyIndex: number,
  conversationId: string,
): Pick<State, 'history' | 'historyIndex'> {
  const next: HistoryEntry[] = []
  let nextIndex = 0
  for (let i = 0; i < history.length; i++) {
    const entry = history[i]
    if (entry.view === 'conversation' && entry.conversationId === conversationId) {
      continue
    }
    const last = next[next.length - 1]
    if (last && last.view === entry.view && last.conversationId === entry.conversationId) {
      if (i <= historyIndex) nextIndex = next.length - 1
      continue
    }
    next.push(entry)
    if (i <= historyIndex) nextIndex = next.length - 1
  }
  if (next.length === 0) {
    return {
      history: [{ view: 'conversation', conversationId: 'channel:general' }],
      historyIndex: 0,
    }
  }
  return {
    history: next,
    historyIndex: Math.min(Math.max(0, nextIndex), next.length - 1),
  }
}

function draftsWithoutConversation(
  drafts: Record<string, string>,
  messages: Message[],
  conversationId: string,
) {
  const next = { ...drafts }
  delete next[conversationId]
  for (const key of Object.keys(next)) {
    if (!key.startsWith('thread:')) continue
    const parentId = key.slice('thread:'.length)
    const parent = messages.find((m) => m.id === parentId)
    if (!parent || parent.conversationId === conversationId) delete next[key]
  }
  return next
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select-conversation': {
      if (!conversationAccessible(state.channels, action.conversationId)) return state
      const cleared = clearUnread(state.unread, state.mentionUnread, action.conversationId)
      const history = action.fromHistory
        ? {}
        : pushHistory(state, { view: 'conversation', conversationId: action.conversationId })
      return {
        ...state,
        ...cleared,
        ...history,
        activeConversationId: action.conversationId,
        activeThreadId: null,
        searchQuery: '',
        sidebarOpen: false,
        view: 'conversation',
        highlightMessageId: null,
      }
    }
    case 'open-thread': {
      const message = state.messages.find((m) => m.id === action.messageId)
      if (!message || message.deleted) return state
      if (!conversationAccessible(state.channels, message.conversationId)) return state
      const parent = message.parentId
        ? (state.messages.find((m) => m.id === message.parentId) ?? message)
        : message
      const cleared = isViewingConversation(state, parent.conversationId)
        ? clearUnread(state.unread, state.mentionUnread, parent.conversationId)
        : { unread: state.unread, mentionUnread: state.mentionUnread }
      return {
        ...state,
        ...cleared,
        activeThreadId: parent.id,
        activeConversationId: parent.conversationId,
        searchQuery: '',
        highlightMessageId: message.id,
      }
    }
    case 'close-thread':
      return { ...state, activeThreadId: null }
    case 'send': {
      const text = action.text.trim()
      if (!text) return state
      if (!conversationWritable(state.channels, action.conversationId)) return state
      const parent = action.parentId
        ? state.messages.find((m) => m.id === action.parentId)
        : undefined
      if (action.parentId && (!parent || parent.conversationId !== action.conversationId)) {
        return state
      }
      const mentions = extractMentions(text, state.users)
      const message: Message = {
        id: nextId(),
        conversationId: action.conversationId,
        authorId: CURRENT_USER_ID,
        text,
        time: nowLabel(),
        day: 'Today',
        reactions: [],
        parentId: action.parentId,
        mentions,
      }
      const draftId = action.parentId ? `thread:${action.parentId}` : action.conversationId
      const drafts = { ...state.drafts }
      delete drafts[draftId]

      return {
        ...state,
        messages: [...state.messages, message],
        drafts,
      }
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
      const slug = slugifyChannelName(action.name)
      if (!slug || state.channels.some((c) => c.id === slug || c.name === slug)) {
        return state
      }
      const channel: Channel = {
        id: slug,
        name: slug,
        description: action.description.trim(),
        topic: '',
        isPrivate: action.isPrivate,
        memberIds: [CURRENT_USER_ID],
      }
      const conversationId = `channel:${slug}`
      return {
        ...state,
        channels: [...state.channels, channel],
        activeConversationId: conversationId,
        activeThreadId: null,
        searchQuery: '',
        view: 'conversation',
        sidebarOpen: false,
        ...pushHistory(state, { view: 'conversation', conversationId }),
      }
    }
    case 'toggle-sidebar':
      return {
        ...state,
        sidebarOpen: action.open ?? !state.sidebarOpen,
      }
    case 'set-view': {
      const history = action.fromHistory
        ? {}
        : pushHistory(state, {
            view: action.view,
            conversationId: state.activeConversationId,
          })
      return {
        ...state,
        ...history,
        view: action.view,
        searchQuery: '',
        sidebarOpen: false,
        activeThreadId: action.view === 'conversation' ? state.activeThreadId : null,
      }
    }
    case 'edit-message': {
      const text = action.text.trim()
      if (!text) return state
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== action.messageId) return m
          if (m.authorId !== CURRENT_USER_ID || m.deleted) return m
          return {
            ...m,
            text,
            edited: true,
            mentions: extractMentions(text, state.users),
          }
        }),
      }
    }
    case 'delete-message': {
      return {
        ...state,
        messages: state.messages.map((m) => {
          if (m.id !== action.messageId) return m
          if (m.authorId !== CURRENT_USER_ID) return m
          return {
            ...m,
            text: '',
            deleted: true,
            edited: false,
            reactions: [],
            mentions: [],
          }
        }),
      }
    }
    case 'toggle-pin': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.messageId && !m.deleted ? { ...m, pinned: !m.pinned } : m,
        ),
      }
    }
    case 'toggle-save': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.messageId && !m.deleted ? { ...m, saved: !m.saved } : m,
        ),
      }
    }
    case 'toggle-star': {
      const starred = state.starredChannelIds.includes(action.channelId)
      return {
        ...state,
        starredChannelIds: starred
          ? state.starredChannelIds.filter((id) => id !== action.channelId)
          : [...state.starredChannelIds, action.channelId],
      }
    }
    case 'join-channel': {
      const channel = state.channels.find((c) => c.id === action.channelId)
      if (!channel || channel.isPrivate) return state
      if (channel.memberIds.includes(CURRENT_USER_ID)) return state
      const conversationId = `channel:${action.channelId}`
      return {
        ...state,
        channels: state.channels.map((c) =>
          c.id === action.channelId
            ? { ...c, memberIds: [...c.memberIds, CURRENT_USER_ID] }
            : c,
        ),
        activeConversationId: conversationId,
        view: 'conversation',
        searchQuery: '',
        sidebarOpen: false,
        ...pushHistory(state, { view: 'conversation', conversationId }),
      }
    }
    case 'leave-channel': {
      const channel = state.channels.find((c) => c.id === action.channelId)
      if (!channel || !channel.memberIds.includes(CURRENT_USER_ID)) return state
      const conversationId = `channel:${action.channelId}`
      const channels = state.channels.map((c) =>
        c.id === action.channelId
          ? { ...c, memberIds: c.memberIds.filter((id) => id !== CURRENT_USER_ID) }
          : c,
      )
      const threadParent = state.activeThreadId
        ? state.messages.find((m) => m.id === state.activeThreadId)
        : undefined
      const leavingActive = state.activeConversationId === conversationId
      const leavingThread = threadParent?.conversationId === conversationId
      const messages = channel.isPrivate
        ? state.messages.filter((m) => m.conversationId !== conversationId)
        : state.messages
      const drafts = draftsWithoutConversation(state.drafts, state.messages, conversationId)
      const { unread, mentionUnread } = clearUnread(
        state.unread,
        state.mentionUnread,
        conversationId,
      )
      const nextActive = leavingActive
        ? firstJoinedConversation(channels, 'channel:general')
        : state.activeConversationId
      const pruned = removeConversationFromHistory(
        state.history,
        state.historyIndex,
        conversationId,
      )
      const history = leavingActive
        ? pushHistory(
            { ...state, history: pruned.history, historyIndex: pruned.historyIndex },
            { view: 'conversation', conversationId: nextActive },
          )
        : pruned
      return {
        ...state,
        ...history,
        channels,
        messages,
        drafts,
        unread,
        mentionUnread,
        starredChannelIds: state.starredChannelIds.filter((id) => id !== action.channelId),
        activeConversationId: nextActive,
        activeThreadId: leavingActive || leavingThread ? null : state.activeThreadId,
        view: leavingActive ? 'conversation' : state.view,
        searchQuery: leavingActive ? '' : state.searchQuery,
        highlightMessageId:
          leavingActive || leavingThread ? null : state.highlightMessageId,
      }
    }
    case 'invite-members': {
      const additions = action.userIds.filter(Boolean)
      if (additions.length === 0) return state
      return {
        ...state,
        channels: state.channels.map((c) => {
          if (c.id !== action.channelId) return c
          const memberIds = [...c.memberIds]
          for (const id of additions) {
            if (!memberIds.includes(id)) memberIds.push(id)
          }
          return { ...c, memberIds }
        }),
      }
    }
    case 'update-channel': {
      return {
        ...state,
        channels: state.channels.map((c) =>
          c.id === action.channelId
            ? {
                ...c,
                topic: action.topic !== undefined ? action.topic : c.topic,
                description:
                  action.description !== undefined ? action.description : c.description,
              }
            : c,
        ),
      }
    }
    case 'set-draft': {
      const drafts = { ...state.drafts }
      if (!action.text) delete drafts[action.key]
      else drafts[action.key] = action.text
      return { ...state, drafts }
    }
    case 'set-presence': {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === CURRENT_USER_ID ? { ...u, presence: action.presence } : u,
        ),
      }
    }
    case 'set-status': {
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === CURRENT_USER_ID ? { ...u, statusText: action.statusText } : u,
        ),
      }
    }
    case 'set-notification-pref': {
      return {
        ...state,
        notificationPrefs: {
          ...state.notificationPrefs,
          [action.conversationId]: action.pref,
        },
      }
    }
    case 'quote-reply': {
      const quoted = action.text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
      const key = action.parentId ? `thread:${action.parentId}` : action.conversationId
      const existing = state.drafts[key] ?? ''
      const next = existing ? `${existing}\n${quoted}\n` : `${quoted}\n`
      return { ...state, drafts: { ...state.drafts, [key]: next } }
    }
    case 'go-back': {
      let historyIndex = state.historyIndex - 1
      while (
        historyIndex >= 0 &&
        !historyEntryAccessible(state, state.history[historyIndex])
      ) {
        historyIndex -= 1
      }
      if (historyIndex < 0) return state
      const entry = state.history[historyIndex]
      const cleared =
        entry.view === 'conversation'
          ? clearUnread(state.unread, state.mentionUnread, entry.conversationId)
          : { unread: state.unread, mentionUnread: state.mentionUnread }
      return {
        ...state,
        ...cleared,
        historyIndex,
        view: entry.view,
        activeConversationId: entry.conversationId,
        activeThreadId: null,
        searchQuery: '',
      }
    }
    case 'go-forward': {
      let historyIndex = state.historyIndex + 1
      while (
        historyIndex < state.history.length &&
        !historyEntryAccessible(state, state.history[historyIndex])
      ) {
        historyIndex += 1
      }
      if (historyIndex >= state.history.length) return state
      const entry = state.history[historyIndex]
      const cleared =
        entry.view === 'conversation'
          ? clearUnread(state.unread, state.mentionUnread, entry.conversationId)
          : { unread: state.unread, mentionUnread: state.mentionUnread }
      return {
        ...state,
        ...cleared,
        historyIndex,
        view: entry.view,
        activeConversationId: entry.conversationId,
        activeThreadId: null,
        searchQuery: '',
      }
    }
    case 'clear-highlight':
      return { ...state, highlightMessageId: null }
    case 'jump-to': {
      if (!conversationAccessible(state.channels, action.conversationId)) return state
      const threadParent = action.threadId
        ? state.messages.find((m) => m.id === action.threadId)
        : undefined
      if (action.threadId && threadParent?.conversationId !== action.conversationId) {
        return state
      }
      const cleared = clearUnread(state.unread, state.mentionUnread, action.conversationId)
      return {
        ...state,
        ...cleared,
        ...pushHistory(state, { view: 'conversation', conversationId: action.conversationId }),
        activeConversationId: action.conversationId,
        activeThreadId: action.threadId ?? null,
        searchQuery: '',
        sidebarOpen: false,
        view: 'conversation',
        highlightMessageId: action.messageId ?? null,
      }
    }
    default:
      return state
  }
}

type WorkspaceContextValue = State & {
  currentUser: User
  selectConversation: (conversationId: string) => void
  openThread: (messageId: string) => void
  closeThread: () => void
  sendMessage: (conversationId: string, text: string, parentId?: string) => void
  toggleReaction: (messageId: string, emoji: string) => void
  setSearch: (query: string) => void
  createChannel: (name: string, description: string, isPrivate: boolean) => boolean
  toggleSidebar: (open?: boolean) => void
  setView: (view: WorkspaceView) => void
  editMessage: (messageId: string, text: string) => void
  deleteMessage: (messageId: string) => void
  togglePin: (messageId: string) => void
  toggleSave: (messageId: string) => void
  toggleStar: (channelId: string) => void
  joinChannel: (channelId: string) => void
  leaveChannel: (channelId: string) => void
  inviteMembers: (channelId: string, userIds: string[]) => void
  updateChannel: (channelId: string, patch: { topic?: string; description?: string }) => void
  setDraft: (key: string, text: string) => void
  setPresence: (presence: Presence) => void
  setStatus: (statusText: string) => void
  setNotificationPref: (conversationId: string, pref: NotificationPref) => void
  quoteReply: (conversationId: string, text: string, parentId?: string) => void
  goBack: () => void
  goForward: () => void
  canGoBack: boolean
  canGoForward: boolean
  replyCount: (messageId: string) => number
  userById: (id: string) => User
  channelById: (id: string) => Channel | undefined
  isMember: (channelId: string) => boolean
  canAccessConversation: (conversationId: string) => boolean
  jumpToMessage: (message: Message) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const userById = useCallback(
    (id: string) => state.users.find((u) => u.id === id) ?? state.users[0],
    [state.users],
  )
  const channelById = useCallback(
    (id: string) => state.channels.find((c) => c.id === id),
    [state.channels],
  )

  const value = useMemo<WorkspaceContextValue>(() => {
    const currentUser =
      state.users.find((u) => u.id === CURRENT_USER_ID) ?? state.users[0]
    return {
      ...state,
      currentUser,
      selectConversation: (conversationId) =>
        dispatch({ type: 'select-conversation', conversationId }),
      openThread: (messageId) => dispatch({ type: 'open-thread', messageId }),
      closeThread: () => dispatch({ type: 'close-thread' }),
      sendMessage: (conversationId, text, parentId) =>
        dispatch({ type: 'send', conversationId, text, parentId }),
      toggleReaction: (messageId, emoji) =>
        dispatch({ type: 'toggle-reaction', messageId, emoji }),
      setSearch: (query) => dispatch({ type: 'set-search', query }),
      createChannel: (name, description, isPrivate) => {
        const slug = slugifyChannelName(name)
        if (!slug || state.channels.some((c) => c.id === slug || c.name === slug)) {
          return false
        }
        dispatch({ type: 'create-channel', name, description, isPrivate })
        return true
      },
      toggleSidebar: (open) => dispatch({ type: 'toggle-sidebar', open }),
      setView: (view) => dispatch({ type: 'set-view', view }),
      editMessage: (messageId, text) =>
        dispatch({ type: 'edit-message', messageId, text }),
      deleteMessage: (messageId) => dispatch({ type: 'delete-message', messageId }),
      togglePin: (messageId) => dispatch({ type: 'toggle-pin', messageId }),
      toggleSave: (messageId) => dispatch({ type: 'toggle-save', messageId }),
      toggleStar: (channelId) => dispatch({ type: 'toggle-star', channelId }),
      joinChannel: (channelId) => dispatch({ type: 'join-channel', channelId }),
      leaveChannel: (channelId) => dispatch({ type: 'leave-channel', channelId }),
      inviteMembers: (channelId, userIds) =>
        dispatch({ type: 'invite-members', channelId, userIds }),
      updateChannel: (channelId, patch) =>
        dispatch({ type: 'update-channel', channelId, ...patch }),
      setDraft: (key, text) => dispatch({ type: 'set-draft', key, text }),
      setPresence: (presence) => dispatch({ type: 'set-presence', presence }),
      setStatus: (statusText) => dispatch({ type: 'set-status', statusText }),
      setNotificationPref: (conversationId, pref) =>
        dispatch({ type: 'set-notification-pref', conversationId, pref }),
      quoteReply: (conversationId, text, parentId) =>
        dispatch({ type: 'quote-reply', conversationId, text, parentId }),
      goBack: () => dispatch({ type: 'go-back' }),
      goForward: () => dispatch({ type: 'go-forward' }),
      canGoBack: state.history.slice(0, state.historyIndex).some((entry) =>
        historyEntryAccessible(state, entry),
      ),
      canGoForward: state.history.slice(state.historyIndex + 1).some((entry) =>
        historyEntryAccessible(state, entry),
      ),
      replyCount: (messageId) =>
        state.messages.filter((m) => m.parentId === messageId && !m.deleted).length,
      userById,
      channelById,
      isMember: (channelId) =>
        channelById(channelId)?.memberIds.includes(CURRENT_USER_ID) ?? false,
      canAccessConversation: (conversationId) =>
        conversationAccessible(state.channels, conversationId),
      jumpToMessage: (message) => {
        if (!conversationAccessible(state.channels, message.conversationId)) return
        dispatch({
          type: 'jump-to',
          conversationId: message.conversationId,
          threadId: message.parentId ?? null,
          messageId: message.id,
        })
      },
    }
  }, [state, userById, channelById])

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider')
  }
  return ctx
}
