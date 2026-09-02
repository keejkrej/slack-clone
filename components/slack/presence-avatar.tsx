'use client'

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { initials, type Presence, type User } from '@/lib/data'

const presenceClass: Record<Presence, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-zinc-400',
}

export function PresenceAvatar({
  user,
  size = 36,
  showPresence = true,
  className,
}: {
  user: User
  size?: number
  showPresence?: boolean
  className?: string
}) {
  return (
    <Avatar
      className={cn(
        'rounded-md after:rounded-md',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <AvatarImage
        src={user.avatar}
        alt={user.name}
        className="rounded-md"
      />
      <AvatarFallback className="rounded-md text-[10px]">
        {initials(user.name)}
      </AvatarFallback>
      {showPresence && (
        <AvatarBadge
          className={cn(
            'ring-background',
            presenceClass[user.presence],
            size <= 24 && 'size-2',
          )}
        />
      )}
    </Avatar>
  )
}
