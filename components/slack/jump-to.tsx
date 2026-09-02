'use client'

import { CURRENT_USER_ID } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { HashIcon, LockIcon } from './icons'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export function JumpTo({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { channels, users, selectConversation, isMember, setView } = useWorkspace()
  const others = users.filter((u) => u.id !== CURRENT_USER_ID)
  const visibleChannels = channels.filter((c) => isMember(c.id) || !c.isPrivate)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Jump to a channel, person, or view"
    >
      <CommandInput placeholder="Jump to a conversation…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>
        <CommandGroup heading="Views">
          <CommandItem
            onSelect={() => {
              setView('threads')
              onOpenChange(false)
            }}
          >
            Threads
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setView('activity')
              onOpenChange(false)
            }}
          >
            Activity
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setView('saved')
              onOpenChange(false)
            }}
          >
            Saved items
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Channels">
          {visibleChannels.map((channel) => (
            <CommandItem
              key={channel.id}
              value={`${channel.name} ${channel.description}`}
              onSelect={() => {
                selectConversation(`channel:${channel.id}`)
                onOpenChange(false)
              }}
            >
              {channel.isPrivate ? (
                <LockIcon className="size-4" />
              ) : (
                <HashIcon className="size-4" />
              )}
              {channel.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {others.map((user) => (
            <CommandItem
              key={user.id}
              value={`${user.name} ${user.handle} ${user.title}`}
              onSelect={() => {
                selectConversation(`dm:${user.id}`)
                onOpenChange(false)
              }}
            >
              <PresenceAvatar user={user} size={20} />
              {user.name}
              <span className="text-muted-foreground">@{user.handle}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
