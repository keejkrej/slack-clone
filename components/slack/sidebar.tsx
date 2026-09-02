'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CURRENT_USER_ID, presenceLabel } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import {
  BookmarkIcon,
  ChevronDownIcon,
  CommentDiscussionIcon,
  GearIcon,
  HashIcon,
  InboxIcon,
  LockIcon,
  PencilIcon,
  PersonAddIcon,
  PersonIcon,
  PlusIcon,
  SignOutIcon,
  StarIcon,
} from './icons'
import {
  BrowseChannelsDialog,
  CreateChannelDialog,
  NewMessageDialog,
  WorkspaceSettingsDialog,
} from './dialogs'
import { UserProfileDialog } from './user-profile'

function UnreadBadge({
  count,
  mention,
}: {
  count?: number
  mention?: number
}) {
  if (!count && !mention) return null
  return (
    <span
      className={cn(
        'ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white',
        mention ? 'bg-[#E01E5A]' : 'bg-[#E01E5A]',
      )}
    >
      {mention ? mention : count}
    </span>
  )
}

function NavButton({
  active,
  unread,
  mention,
  onClick,
  children,
}: {
  active?: boolean
  unread?: boolean
  mention?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-1 text-left text-[15px] text-white/70 hover:bg-white/10',
        unread && 'font-bold text-white',
        mention && 'font-bold text-white',
        active && 'bg-[#1164A3] font-medium text-white hover:bg-[#1164A3]',
      )}
    >
      {children}
    </button>
  )
}

export function Sidebar() {
  const {
    channels,
    users,
    messages,
    activeConversationId,
    selectConversation,
    unread,
    mentionUnread,
    sidebarOpen,
    toggleSidebar,
    view,
    setView,
    starredChannelIds,
    currentUser,
    isMember,
  } = useWorkspace()
  const [createOpen, setCreateOpen] = useState(false)
  const [newMessageOpen, setNewMessageOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const others = users.filter((u) => u.id !== CURRENT_USER_ID)
  const joinedChannels = channels.filter(
    (c) => isMember(c.id) && !starredChannelIds.includes(c.id),
  )
  const starredChannels = channels.filter((c) => starredChannelIds.includes(c.id))

  const mentionCount = useMemo(
    () => Object.values(mentionUnread).reduce((sum, n) => sum + n, 0),
    [mentionUnread],
  )

  const savedCount = messages.filter((m) => m.saved && !m.deleted).length

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="chat-backdrop"
          aria-label="Close sidebar"
          onClick={() => toggleSidebar(false)}
        />
      )}
      <aside className="chat-sidebar" data-open={sidebarOpen} aria-label="Workspace navigation">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-md px-1.5 py-1 text-left font-bold text-white hover:bg-white/10">
              Octo Labs
              <ChevronDownIcon className="size-4 opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              <DropdownMenuItem
                onClick={() => toast.message('Everyone on this demo is already in Octo Labs.')}
              >
                <PersonIcon /> Invite people to Octo Labs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <GearIcon /> Workspace settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  toast.message("This is a client-only demo — you're still signed in as Alex.")
                }
              >
                <SignOutIcon /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="New message"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setNewMessageOpen(true)}
          >
            <PencilIcon />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <nav aria-label="Conversations" className="flex flex-col gap-0.5">
            <NavButton active={view === 'threads'} onClick={() => setView('threads')}>
              <CommentDiscussionIcon className="size-4 shrink-0" />
              Threads
            </NavButton>
            <NavButton
              active={view === 'activity'}
              unread={mentionCount > 0}
              mention={mentionCount > 0}
              onClick={() => setView('activity')}
            >
              <InboxIcon className="size-4 shrink-0" />
              Activity
              {mentionCount > 0 && <UnreadBadge mention={mentionCount} />}
            </NavButton>
            <NavButton
              active={view === 'saved'}
              onClick={() => setView('saved')}
            >
              <BookmarkIcon className="size-4 shrink-0" />
              Later
              {savedCount > 0 && (
                <span className="ml-auto text-[11px] text-white/50">{savedCount}</span>
              )}
            </NavButton>

            {starredChannels.length > 0 && (
              <Collapsible defaultOpen className="mt-3">
                <CollapsibleTrigger className="flex w-full items-center gap-1 px-3 py-1 text-[13px] text-white/60 hover:text-white">
                  <ChevronDownIcon className="size-3" />
                  Starred
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {starredChannels.map((channel) => {
                    const id = `channel:${channel.id}`
                    return (
                      <NavButton
                        key={channel.id}
                        active={view === 'conversation' && id === activeConversationId}
                        unread={Boolean(unread[id])}
                        mention={Boolean(mentionUnread[id])}
                        onClick={() => selectConversation(id)}
                      >
                        <StarIcon className="size-3.5 shrink-0 fill-white/70" />
                        <span className="min-w-0 truncate">{channel.name}</span>
                        <UnreadBadge count={unread[id]} mention={mentionUnread[id]} />
                      </NavButton>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Collapsible defaultOpen className="mt-3">
              <div className="flex items-center pr-1">
                <CollapsibleTrigger className="flex flex-1 items-center gap-1 px-3 py-1 text-[13px] text-white/60 hover:text-white">
                  <ChevronDownIcon className="size-3" />
                  Channels
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Add channel"
                        className="text-white/70 hover:bg-white/10 hover:text-white"
                      />
                    }
                  >
                    <PlusIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                      Create channel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBrowseOpen(true)}>
                      Browse channels
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CollapsibleContent>
                {joinedChannels.map((channel) => {
                  const id = `channel:${channel.id}`
                  return (
                    <NavButton
                      key={channel.id}
                      active={view === 'conversation' && id === activeConversationId}
                      unread={Boolean(unread[id])}
                      mention={Boolean(mentionUnread[id])}
                      onClick={() => selectConversation(id)}
                    >
                      {channel.isPrivate ? (
                        <LockIcon className="size-3.5 shrink-0" />
                      ) : (
                        <HashIcon className="size-3.5 shrink-0" />
                      )}
                      <span className="min-w-0 truncate">{channel.name}</span>
                      <UnreadBadge count={unread[id]} mention={mentionUnread[id]} />
                    </NavButton>
                  )
                })}
                <NavButton onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="size-3.5 shrink-0" />
                  <span className="text-white/50">Add channel</span>
                </NavButton>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen className="mt-3">
              <div className="flex items-center pr-1">
                <CollapsibleTrigger className="flex flex-1 items-center gap-1 px-3 py-1 text-[13px] text-white/60 hover:text-white">
                  <ChevronDownIcon className="size-3" />
                  Direct messages
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Add teammates"
                  className="text-white/70 hover:bg-white/10 hover:text-white"
                  onClick={() => setNewMessageOpen(true)}
                >
                  <PlusIcon />
                </Button>
              </div>
              <CollapsibleContent>
                {others.map((user) => {
                  const id = `dm:${user.id}`
                  return (
                    <NavButton
                      key={user.id}
                      active={view === 'conversation' && id === activeConversationId}
                      unread={Boolean(unread[id])}
                      mention={Boolean(mentionUnread[id])}
                      onClick={() => selectConversation(id)}
                    >
                      <PresenceAvatar user={user} size={20} />
                      <span className="min-w-0 truncate">{user.name}</span>
                      <UnreadBadge count={unread[id]} mention={mentionUnread[id]} />
                    </NavButton>
                  )
                })}
                <NavButton onClick={() => setNewMessageOpen(true)}>
                  <PersonAddIcon className="size-3.5 shrink-0" />
                  <span className="text-white/50">Add teammates</span>
                </NavButton>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center gap-2 border-t border-white/10 px-3 py-3 text-left hover:bg-white/10"
          onClick={() => setProfileOpen(true)}
        >
          <PresenceAvatar user={currentUser} size={32} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              {currentUser.name}
            </span>
            <span className="block truncate text-xs text-white/60">
              {presenceLabel(currentUser.presence)}
              {currentUser.statusText ? ` · ${currentUser.statusText}` : ''}
            </span>
          </span>
        </button>
      </aside>

      <CreateChannelDialog open={createOpen} onOpenChange={setCreateOpen} />
      <NewMessageDialog open={newMessageOpen} onOpenChange={setNewMessageOpen} />
      <BrowseChannelsDialog open={browseOpen} onOpenChange={setBrowseOpen} />
      <WorkspaceSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <UserProfileDialog user={currentUser} open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
