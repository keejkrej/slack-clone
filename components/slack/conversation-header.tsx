'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { initials, type NotificationPref } from '@/lib/data'
import { toast } from 'sonner'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { UserHoverCard } from './user-profile'
import {
  BellIcon,
  BellOffIcon,
  ChevronDownIcon,
  HashIcon,
  InfoIcon,
  LockIcon,
  PersonAddIcon,
  PinIcon,
  StarIcon,
  ThreeBarsIcon,
} from './icons'
import {
  ChannelDetailsDialog,
  InviteMembersDialog,
} from './dialogs'
import { MessageBody } from './message-body'

export function ConversationHeader({ conversationId }: { conversationId: string }) {
  const {
    toggleSidebar,
    channelById,
    userById,
    users,
    messages,
    starredChannelIds,
    toggleStar,
    leaveChannel,
    notificationPrefs,
    setNotificationPref,
    jumpToMessage,
    isMember,
  } = useWorkspace()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const isChannel = conversationId.startsWith('channel:')
  const channel = isChannel
    ? channelById(conversationId.slice('channel:'.length))
    : undefined
  const user = !isChannel
    ? userById(conversationId.slice('dm:'.length))
    : undefined

  const pinned = messages.filter(
    (m) => m.conversationId === conversationId && m.pinned && !m.deleted,
  )
  const pref = notificationPrefs[conversationId] ?? 'all'
  const starred = channel ? starredChannelIds.includes(channel.id) : false
  const member = channel ? isMember(channel.id) : true

  return (
    <header className="shrink-0 border-b bg-background">
      <div className="flex h-12 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            className="chat-menu-toggle"
            variant="ghost"
            size="icon-sm"
            aria-label="Open sidebar"
            onClick={() => toggleSidebar(true)}
          >
            <ThreeBarsIcon />
          </Button>
          {channel && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted">
                {channel.isPrivate ? (
                  <LockIcon className="size-4 shrink-0" />
                ) : (
                  <HashIcon className="size-4 shrink-0" />
                )}
                <h1 className="truncate text-base font-bold">{channel.name}</h1>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-56">
                <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                  <InfoIcon /> Channel details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleStar(channel.id)}>
                  <StarIcon /> {starred ? 'Unstar channel' : 'Star channel'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={pref}
                  onValueChange={(value) =>
                    setNotificationPref(conversationId, value as NotificationPref)
                  }
                >
                  <DropdownMenuRadioItem value="all">All messages</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mentions">Mentions only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="muted">Mute channel</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    leaveChannel(channel.id)
                    toast.success(`Left #${channel.name}`)
                  }}
                >
                  Leave channel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user && (
            <UserHoverCard user={user}>
              <div className="flex items-center gap-2">
                <PresenceAvatar user={user} size={24} />
                <h1 className="text-base font-bold">{user.name}</h1>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {user.title}
                </span>
              </div>
            </UserHoverCard>
          )}
          {channel?.topic && (
            <button
              type="button"
              className="hidden min-w-0 truncate text-sm text-muted-foreground hover:underline md:block"
              onClick={() => setDetailsOpen(true)}
            >
              {channel.topic}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {channel && (
            <Button
              variant="outline"
              size="sm"
              aria-label={`${channel.memberIds.length} members`}
              onClick={() => setDetailsOpen(true)}
            >
              <span className="flex -space-x-1">
                {channel.memberIds.slice(0, 3).map((id) => {
                  const u = userById(id)
                  return (
                    <Avatar key={id} className="size-5 rounded-md after:rounded-md">
                      <AvatarImage src={u.avatar} alt={u.name} className="rounded-md" />
                      <AvatarFallback className="rounded-md text-[8px]">
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                  )
                })}
              </span>
              <span>{channel.memberIds.length}</span>
            </Button>
          )}
          {channel && member && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Invite people"
                    onClick={() => setInviteOpen(true)}
                  />
                }
              >
                <PersonAddIcon />
              </TooltipTrigger>
              <TooltipContent>Add people</TooltipContent>
            </Tooltip>
          )}
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Pinned messages" />
              }
            >
              <PinIcon />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <p className="mb-2 text-sm font-semibold">Pinned messages</p>
              {pinned.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pinned messages in this conversation.
                </p>
              ) : (
                <ScrollArea className="max-h-72">
                  <div className="flex flex-col gap-2">
                    {pinned.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="rounded-md border p-2 text-left hover:bg-muted"
                        onClick={() => jumpToMessage(m)}
                      >
                        <p className="text-xs font-medium">
                          {userById(m.authorId).name} · {m.day} {m.time}
                        </p>
                        <MessageBody text={m.text} users={users} className="text-sm" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Notifications"
                  onClick={() =>
                    setNotificationPref(
                      conversationId,
                      pref === 'muted' ? 'all' : 'muted',
                    )
                  }
                />
              }
            >
              {pref === 'muted' ? <BellOffIcon /> : <BellIcon />}
            </TooltipTrigger>
            <TooltipContent>
              {pref === 'muted' ? 'Unmute' : 'Mute'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {channel && (
        <>
          <ChannelDetailsDialog
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            channel={channel}
            onInvite={() => {
              setDetailsOpen(false)
              setInviteOpen(true)
            }}
          />
          <InviteMembersDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            channel={channel}
          />
        </>
      )}
    </header>
  )
}
