'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CURRENT_USER_ID, draftKey, type User } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import {
  AtSign,
  Bold,
  Code2,
  Italic,
  Link as LinkIcon,
  List,
  Paperclip,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { PresenceAvatar } from './presence-avatar'
import { ReactionPicker } from './reaction-picker'

function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder = 'text',
) {
  const selected = value.slice(start, end) || placeholder
  const next = value.slice(0, start) + before + selected + after + value.slice(end)
  const cursor = start + before.length + selected.length + after.length
  return { next, cursor }
}

export function Composer({
  conversationId,
  parentId,
  placeholder,
  autoFocus = false,
  compact = false,
}: {
  conversationId: string
  parentId?: string
  placeholder: string
  autoFocus?: boolean
  compact?: boolean
}) {
  const { drafts, setDraft, sendMessage, users } = useWorkspace()
  const key = draftKey(conversationId, parentId)
  const stored = drafts[key] ?? ''
  const [value, setValue] = useState(stored)
  const [caret, setCaret] = useState(stored.length)
  const [mentionDismissed, setMentionDismissed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(stored)
  }, [key, stored])

  const mentionQuery = useMemo(() => {
    const before = value.slice(0, caret)
    const match = before.match(/@([a-zA-Z0-9_-]*)$/)
    return match ? match[1].toLowerCase() : null
  }, [value, caret])

  const mentionOptions = useMemo(() => {
    if (mentionQuery === null) return []
    const people = users.filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        (u.name.toLowerCase().includes(mentionQuery) ||
          u.handle.toLowerCase().includes(mentionQuery)),
    )
    const extras: { id: string; label: string; handle: string; user?: User }[] = []
    if ('channel'.startsWith(mentionQuery) || mentionQuery === '') {
      extras.push({ id: 'channel', label: 'channel', handle: 'channel' })
    }
    return [
      ...extras,
      ...people.map((u) => ({
        id: u.id,
        label: u.name,
        handle: u.handle,
        user: u,
      })),
    ]
  }, [mentionQuery, users])

  useEffect(() => {
    if (mentionQuery === null) setMentionDismissed(false)
  }, [mentionQuery])

  const mentionOpen =
    mentionQuery !== null && mentionOptions.length > 0 && !mentionDismissed

  const canSend = value.trim().length > 0

  const update = (next: string, cursor?: number) => {
    setValue(next)
    setDraft(key, next)
    if (cursor !== undefined) {
      setCaret(cursor)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (el) el.setSelectionRange(cursor, cursor)
      })
    }
  }

  const submit = () => {
    if (!canSend) return
    sendMessage(conversationId, value, parentId)
    update('')
    setMentionDismissed(false)
  }

  const applyWrap = (before: string, after: string, placeholder = 'text') => {
    const el = textareaRef.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const result = wrapSelection(value, start, end, before, after, placeholder)
    update(result.next, result.cursor)
    textareaRef.current?.focus()
  }

  const insertMention = (handle: string) => {
    const before = value.slice(0, caret)
    const after = value.slice(caret)
    const replaced = before.replace(/@([a-zA-Z0-9_-]*)$/, `@${handle} `)
    update(replaced + after, replaced.length)
    setMentionDismissed(false)
    textareaRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      if (mentionOpen && mentionOptions[0]) {
        e.preventDefault()
        insertMention(mentionOptions[0].handle)
        return
      }
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape' && mentionOpen) {
      e.preventDefault()
      e.stopPropagation()
      setMentionDismissed(true)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="relative overflow-hidden rounded-lg border border-border bg-background"
    >
      {!compact && (
        <div className="flex items-center gap-0.5 border-b border-border px-1.5 pt-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Bold"
                  onClick={() => applyWrap('**', '**')}
                />
              }
            >
              <Bold />
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Italic"
                  onClick={() => applyWrap('_', '_')}
                />
              }
            >
              <Italic />
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Code"
                  onClick={() => applyWrap('`', '`', 'code')}
                />
              }
            >
              <Code2 />
            </TooltipTrigger>
            <TooltipContent>Code</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Link"
                  onClick={() => applyWrap('[', '](url)')}
                />
              }
            >
              <LinkIcon />
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Bulleted list"
                  onClick={() => {
                    const el = textareaRef.current
                    const start = el?.selectionStart ?? 0
                    const end = el?.selectionEnd ?? 0
                    const selected = value.slice(start, end)
                    if (selected.includes('\n')) {
                      const listed = selected
                        .split('\n')
                        .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
                        .join('\n')
                      update(value.slice(0, start) + listed + value.slice(end), start + listed.length)
                    } else {
                      applyWrap('- ', '', 'item')
                    }
                  }}
                />
              }
            >
              <List />
            </TooltipTrigger>
            <TooltipContent>Bulleted list</TooltipContent>
          </Tooltip>
        </div>
      )}
      <Textarea
        ref={textareaRef}
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        rows={compact ? 2 : 3}
        autoFocus={autoFocus}
        onChange={(e) => {
          setCaret(e.target.selectionStart)
          update(e.target.value)
        }}
        onSelect={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart)}
        onKeyDown={onKeyDown}
        className="min-h-16 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      {mentionOpen && (
        <div className="absolute bottom-14 left-3 z-20 w-64 overflow-hidden rounded-md border bg-popover shadow-md">
          <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
            Mention
          </p>
          <ul className="max-h-48 overflow-y-auto p-1">
            {mentionOptions.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(option.handle)
                  }}
                >
                  {option.user ? (
                    <PresenceAvatar user={option.user} size={20} showPresence={false} />
                  ) : (
                    <span className="flex size-5 items-center justify-center rounded bg-sky-100 text-xs font-semibold text-sky-800">
                      @
                    </span>
                  )}
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">@{option.handle}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex items-center justify-between px-1.5 pb-1.5">
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Attach file"
                  onClick={() =>
                    toast.info('File attachments are not available in this demo.')
                  }
                />
              }
            >
              <Paperclip />
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Mention someone"
                  onClick={() => {
                    const el = textareaRef.current
                    const pos = el?.selectionStart ?? value.length
                    const next = `${value.slice(0, pos)}@${value.slice(pos)}`
                    update(next, pos + 1)
                    textareaRef.current?.focus()
                  }}
                />
              }
            >
              <AtSign />
            </TooltipTrigger>
            <TooltipContent>Mention someone</TooltipContent>
          </Tooltip>
          <ReactionPicker
            onPick={(emoji) => {
              const el = textareaRef.current
              const pos = el?.selectionStart ?? value.length
              const next = value.slice(0, pos) + emoji + value.slice(pos)
              update(next, pos + emoji.length)
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line
            </p>
          )}
          <Button
            type="submit"
            size="icon-sm"
            aria-label="Send message"
            disabled={!canSend}
            variant={canSend ? 'default' : 'ghost'}
          >
            <Send />
          </Button>
        </div>
      </div>
    </form>
  )
}
