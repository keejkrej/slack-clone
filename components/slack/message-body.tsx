'use client'

import { cn } from '@/lib/utils'
import type { User } from '@/lib/data'

const TOKEN = /(\*\*[^*]+?\*\*|_[^_\n]+?_|`[^`]+?`|@[a-zA-Z0-9_-]+)/g

export function MessageBody({
  text,
  users,
  className,
}: {
  text: string
  users: User[]
  className?: string
}) {
  const parts = text.split(TOKEN)
  return (
    <p
      className={cn(
        'whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground',
        className,
      )}
    >
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith('@')) {
          const handle = part.slice(1).toLowerCase()
          const isChannel =
            handle === 'channel' || handle === 'here' || handle === 'everyone'
          const user = users.find((u) => u.handle.toLowerCase() === handle)
          if (user || isChannel) {
            return (
              <span
                key={i}
                className="rounded-sm bg-sky-100 px-0.5 font-medium text-sky-800"
              >
                {part}
              </span>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
