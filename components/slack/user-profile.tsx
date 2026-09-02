'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { presenceLabel, type User } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'

export function UserHoverCard({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const { selectConversation } = useWorkspace()
  return (
    <HoverCard>
      <HoverCardTrigger className="inline-flex cursor-pointer text-left">
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-72" side="right">
        <UserCardBody
          user={user}
          onMessage={() => selectConversation(`dm:${user.id}`)}
        />
      </HoverCardContent>
    </HoverCard>
  )
}

export function UserProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { selectConversation } = useWorkspace()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>Profile for {user.name}</DialogDescription>
        </DialogHeader>
        <UserCardBody
          user={user}
          onMessage={() => {
            selectConversation(`dm:${user.id}`)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function UserCardBody({
  user,
  onMessage,
}: {
  user: User
  onMessage: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <PresenceAvatar user={user} size={64} />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">@{user.handle}</p>
          <p className="text-sm">{user.title}</p>
          <p className="text-xs text-muted-foreground">
            {presenceLabel(user.presence)}
            {user.statusText ? ` · ${user.statusText}` : ''}
          </p>
        </div>
      </div>
      <Button size="sm" onClick={onMessage}>
        Message
      </Button>
    </div>
  )
}
