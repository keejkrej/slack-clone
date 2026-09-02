'use client'

import { useState, type KeyboardEvent } from 'react'
import { Textarea, IconButton, Stack, Text } from './ui'
import {
  PaperAirplaneIcon,
  BoldIcon,
  ItalicIcon,
  CodeIcon,
  LinkIcon,
  ListUnorderedIcon,
  PaperclipIcon,
  MentionIcon,
} from './icons'

export function Composer({
  placeholder,
  onSend,
  autoFocus = false,
  compact = false,
}: {
  placeholder: string
  onSend: (text: string) => void
  autoFocus?: boolean
  compact?: boolean
}) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      style={{
        border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-large)',
        backgroundColor: 'var(--bgColor-default)',
        overflow: 'hidden',
      }}
    >
      {!compact && (
        <Stack
          direction="horizontal"
          gap="none"
          align="center"
          paddingInline="condensed"
          style={{
            paddingTop: 'var(--base-size-4)',
            borderBottom:
              'var(--borderWidth-thin) solid var(--borderColor-muted)',
          }}
        >
          <IconButton icon={BoldIcon} aria-label="Bold" variant="invisible" size="small" />
          <IconButton icon={ItalicIcon} aria-label="Italic" variant="invisible" size="small" />
          <IconButton icon={CodeIcon} aria-label="Code" variant="invisible" size="small" />
          <IconButton icon={LinkIcon} aria-label="Link" variant="invisible" size="small" />
          <IconButton
            icon={ListUnorderedIcon}
            aria-label="Bulleted list"
            variant="invisible"
            size="small"
          />
        </Stack>
      )}
      <Textarea
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={compact ? 2 : 3}
        block
        resize="none"
        autoFocus={autoFocus}
        style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
      />
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        paddingInline="condensed"
        style={{ paddingBottom: 'var(--base-size-4)' }}
      >
        <Stack direction="horizontal" gap="none" align="center">
          <IconButton
            icon={PaperclipIcon}
            aria-label="Attach file"
            variant="invisible"
            size="small"
          />
          <IconButton
            icon={MentionIcon}
            aria-label="Mention someone"
            variant="invisible"
            size="small"
          />
        </Stack>
        <Stack direction="horizontal" gap="condensed" align="center">
          {!compact && (
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for
              new line
            </Text>
          )}
          <IconButton
            type="submit"
            icon={PaperAirplaneIcon}
            aria-label="Send message"
            variant={canSend ? 'primary' : 'invisible'}
            size="small"
            disabled={!canSend}
          />
        </Stack>
      </Stack>
    </form>
  )
}
