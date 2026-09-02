'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EMOJI_CHOICES } from '@/lib/data'
import { SmileyIcon } from './icons'

export function ReactionPicker({
  onPick,
  onOpenChange,
  size = 'small',
}: {
  onPick: (emoji: string) => void
  onOpenChange?: (open: boolean) => void
  size?: 'small' | 'medium'
}) {
  const [open, setOpen] = useState(false)

  const changeOpen = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size={size === 'small' ? 'icon-xs' : 'icon-sm'}
            aria-label="Add reaction"
            className="text-muted-foreground"
          />
        }
      >
        <SmileyIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2" side="top">
        <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
          Frequently used
        </p>
        <div role="group" aria-label="Emoji" className="grid grid-cols-8 gap-0.5">
          {EMOJI_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="chat-emoji"
              aria-label={`React with ${emoji}`}
              onClick={() => {
                onPick(emoji)
                changeOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
