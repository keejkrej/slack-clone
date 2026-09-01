'use client'

import { useState } from 'react'
import { AnchoredOverlay, IconButton, Text, Stack } from '@primer/react'
import { SmileyIcon } from '@primer/octicons-react'
import { EMOJI_CHOICES } from '@/lib/data'

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

  const setOpenState = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpenState(true)}
      onClose={() => setOpenState(false)}
      side="outside-top"
      align="end"
      renderAnchor={(anchorProps) => (
        <IconButton
          {...anchorProps}
          icon={SmileyIcon}
          aria-label="Add reaction"
          variant="invisible"
          size={size}
        />
      )}
    >
      <Stack direction="vertical" gap="condensed" padding="condensed">
        <Text
          size="small"
          weight="semibold"
          style={{ color: 'var(--fgColor-muted)', paddingInline: 4 }}
        >
          Frequently used
        </Text>
        <div
          role="group"
          aria-label="Emoji"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, var(--base-size-36))',
            gap: 2,
          }}
        >
          {EMOJI_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="chat-emoji"
              aria-label={`React with ${emoji}`}
              onClick={() => {
                onPick(emoji)
                setOpenState(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </Stack>
    </AnchoredOverlay>
  )
}
