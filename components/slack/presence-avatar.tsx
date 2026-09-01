'use client'

import { Avatar } from '@primer/react'
import type { Presence, User } from '@/lib/data'

const presenceToken: Record<Presence, string> = {
  online: 'var(--bgColor-success-emphasis)',
  away: 'var(--bgColor-attention-emphasis)',
  offline: 'var(--bgColor-neutral-emphasis)',
}

export function PresenceAvatar({
  user,
  size = 36,
  showPresence = true,
}: {
  user: User
  size?: number
  showPresence?: boolean
}) {
  const dot = Math.max(8, Math.round(size * 0.3))
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      <Avatar src={user.avatar} size={size} alt={user.name} square />
      {showPresence && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: dot,
            height: dot,
            borderRadius: 'var(--borderRadius-full)',
            backgroundColor: presenceToken[user.presence],
            border: 'var(--borderWidth-thick) solid var(--bgColor-default)',
          }}
        />
      )}
    </span>
  )
}
