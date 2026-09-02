'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { CURRENT_USER_ID, presenceLabel, type Channel, type User } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { HashIcon, LockIcon, PersonAddIcon, StarIcon } from './icons'
import { Kbd } from '@/components/ui/kbd'

export function CreateChannelDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { createChannel } = useWorkspace()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const reset = () => {
    setName('')
    setDescription('')
    setIsPrivate(false)
  }

  const submit = () => {
    if (!name.trim()) return
    const ok = createChannel(name, description, isPrivate)
    if (!ok) {
      toast.error('That channel name is taken. Try another.')
      return
    }
    toast.success(`Created #${name.toLowerCase().trim()}`)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a channel</DialogTitle>
          <DialogDescription>
            Channels are where your team communicates. They&apos;re best organized around a topic.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel-name">Name</Label>
            <div className="relative">
              {isPrivate ? (
                <LockIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              ) : (
                <HashIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                id="channel-name"
                className="pl-8"
                placeholder="e.g. plan-budget"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Lowercase, without spaces or periods.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel-desc">Description</Label>
            <Input
              id="channel-desc"
              placeholder="What is this channel about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="channel-private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked === true)}
            />
            <div>
              <Label htmlFor="channel-private">Make private</Label>
              <p className="text-xs text-muted-foreground">
                Only invited members can view or join a private channel.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={submit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewMessageDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { users, selectConversation } = useWorkspace()
  const [query, setQuery] = useState('')
  const others = users.filter((u) => u.id !== CURRENT_USER_ID)
  const filtered = others.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.handle.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>Pick a teammate to start a direct message.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search people"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-0.5 pr-2">
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                onClick={() => {
                  selectConversation(`dm:${user.id}`)
                  onOpenChange(false)
                  setQuery('')
                }}
              >
                <PresenceAvatar user={user} size={28} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    @{user.handle} · {presenceLabel(user.presence)}
                  </span>
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No people match “{query}”.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function InviteMembersDialog({
  open,
  onOpenChange,
  channel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: Channel | undefined
}) {
  const { users, inviteMembers } = useWorkspace()
  const [selected, setSelected] = useState<string[]>([])
  const candidates = useMemo(
    () => users.filter((u) => channel && !channel.memberIds.includes(u.id)),
    [users, channel],
  )

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const submit = () => {
    if (!channel || selected.length === 0) return
    inviteMembers(channel.id, selected)
    toast.success(
      `Invited ${selected.length} ${selected.length === 1 ? 'person' : 'people'} to #${channel.name}`,
    )
    setSelected([])
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelected([])
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add people to #{channel?.name}</DialogTitle>
          <DialogDescription>
            Choose workspace members to add to this channel.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-1 pr-2">
            {candidates.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
              >
                <Checkbox
                  checked={selected.includes(user.id)}
                  onCheckedChange={() => toggle(user.id)}
                />
                <PresenceAvatar user={user} size={24} />
                <span className="text-sm">
                  {user.name}{' '}
                  <span className="text-muted-foreground">@{user.handle}</span>
                </span>
              </label>
            ))}
            {candidates.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Everyone in the workspace is already in this channel.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={selected.length === 0} onClick={submit}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChannelDetailsDialog({
  open,
  onOpenChange,
  channel,
  onInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: Channel | undefined
  onInvite: () => void
}) {
  const { users, updateChannel, toggleStar, starredChannelIds, notificationPrefs, setNotificationPref } =
    useWorkspace()
  const [topic, setTopic] = useState(channel?.topic ?? '')
  const [description, setDescription] = useState(channel?.description ?? '')
  const [memberQuery, setMemberQuery] = useState('')

  const members = (channel?.memberIds ?? [])
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(memberQuery.toLowerCase()) ||
        u.handle.toLowerCase().includes(memberQuery.toLowerCase()),
    )

  const conversationId = channel ? `channel:${channel.id}` : ''
  const pref = notificationPrefs[conversationId] ?? 'all'
  const starred = channel ? starredChannelIds.includes(channel.id) : false

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && channel) {
          setTopic(channel.topic)
          setDescription(channel.description)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1">
            {channel?.isPrivate ? <LockIcon className="size-4" /> : <HashIcon className="size-4" />}
            {channel?.name}
          </DialogTitle>
          <DialogDescription>Channel details, members, and preferences.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => channel && toggleStar(channel.id)}
          >
            <StarIcon className={starred ? 'fill-amber-400 text-amber-400' : ''} />
            {starred ? 'Starred' : 'Star'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setNotificationPref(conversationId, pref === 'muted' ? 'all' : 'muted')
            }
          >
            {pref === 'muted' ? 'Unmute' : 'Mute channel'}
          </Button>
          <Button size="sm" variant="outline" onClick={onInvite}>
            <PersonAddIcon /> Add people
          </Button>
        </div>
        <Tabs defaultValue="about">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members {channel?.memberIds.length}</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="flex flex-col gap-3 pt-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Add a topic"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="about">Description</Label>
              <Textarea
                id="about"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this channel about?"
              />
            </div>
            <Button
              size="sm"
              className="self-end"
              onClick={() => {
                if (!channel) return
                updateChannel(channel.id, { topic, description })
                toast.success('Channel details updated')
              }}
            >
              Save
            </Button>
          </TabsContent>
          <TabsContent value="members" className="flex flex-col gap-3 pt-3">
            <Input
              placeholder="Find members"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              onClick={onInvite}
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                <PersonAddIcon className="size-4" />
              </span>
              Add people
            </button>
            <ScrollArea className="h-56">
              <div className="flex flex-col">
                {members.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 px-2 py-1.5">
                    <PresenceAvatar user={user} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.name}{' '}
                        <span className="font-normal text-muted-foreground">
                          @{user.handle}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{user.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export function BrowseChannelsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { channels, joinChannel, selectConversation, isMember } = useWorkspace()
  const [query, setQuery] = useState('')
  const visible = channels.filter(
    (c) =>
      (!c.isPrivate || isMember(c.id)) &&
      (c.name.includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Browse channels</DialogTitle>
          <DialogDescription>Join a public channel or jump to one you already belong to.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search channels"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <ScrollArea className="h-72">
          <div className="flex flex-col gap-1 pr-2">
            {visible.map((channel) => {
              const member = isMember(channel.id)
              return (
                <div
                  key={channel.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-medium">
                      {channel.isPrivate ? (
                        <LockIcon className="size-3.5" />
                      ) : (
                        <HashIcon className="size-3.5" />
                      )}
                      {channel.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {channel.memberIds.length} members · {channel.description}
                    </p>
                  </div>
                  {member ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        selectConversation(`channel:${channel.id}`)
                        onOpenChange(false)
                      }}
                    >
                      Open
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        joinChannel(channel.id)
                        onOpenChange(false)
                      }}
                    >
                      Join
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function PreferencesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { currentUser, setPresence, setStatus } = useWorkspace()
  const [status, setStatusLocal] = useState(currentUser.statusText ?? '')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setStatusLocal(currentUser.statusText ?? '')
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>Set your presence and custom status.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Presence</Label>
            <div className="flex gap-2">
              {(['online', 'away', 'offline'] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={currentUser.presence === value ? 'default' : 'outline'}
                  onClick={() => setPresence(value)}
                >
                  {presenceLabel(value)}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Custom status</Label>
            <Input
              id="status"
              value={status}
              onChange={(e) => setStatusLocal(e.target.value)}
              placeholder="What's your status?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setStatus(status)
              toast.success('Preferences saved')
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Octo Labs is a client-only Slack-style workspace.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center justify-between">
            Jump to <Kbd>⌘ K</Kbd>
          </li>
          <li className="flex items-center justify-between">
            Send message <Kbd>Enter</Kbd>
          </li>
          <li className="flex items-center justify-between">
            New line <span className="text-muted-foreground">Shift + Enter</span>
          </li>
          <li className="flex items-center justify-between">
            Close thread / search <Kbd>Esc</Kbd>
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  )
}

export function WorkspaceSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>
            Octo Labs is a local demo. Settings are not persisted to a server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Display name</p>
            <p className="text-xs text-muted-foreground">Octo Labs</p>
          </div>
          <Switch checked disabled />
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Auth, billing, Slack Connect, and huddles are intentionally out of scope.
        </p>
      </DialogContent>
    </Dialog>
  )
}
