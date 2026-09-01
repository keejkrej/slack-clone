'use client'

import { Stack, Text, Heading, Label, IconButton } from '@primer/react'
import { Blankslate } from '@primer/react/experimental'
import { SearchIcon, HashIcon, LockIcon, XIcon } from '@primer/octicons-react'
import { conversationLabel, getUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'

function Highlight({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          backgroundColor: 'var(--bgColor-attention-muted)',
          color: 'inherit',
          borderRadius: 'var(--borderRadius-small)',
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchResults({ query }: { query: string }) {
  const { messages, channels, selectConversation, openThread, setSearch } = useWorkspace()
  const q = query.trim().toLowerCase()

  const matchedChannels = channels.filter(
    (c) => c.name.includes(q) || c.description.toLowerCase().includes(q),
  )
  const matchedMessages = messages.filter(
    (m) =>
      m.text.toLowerCase().includes(q) ||
      getUser(m.authorId).name.toLowerCase().includes(q),
  )

  const total = matchedChannels.length + matchedMessages.length

  return (
    <div className="chat-scroll">
      <Stack direction="vertical" gap="normal" padding="normal" style={{ maxWidth: 760, margin: '0 auto' }}>
        <Stack direction="horizontal" align="center" justify="space-between">
          <Stack direction="vertical" gap="none">
            <Heading as="h1" variant="medium">
              Search results
            </Heading>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {total} {total === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
            </Text>
          </Stack>
          <IconButton icon={XIcon} aria-label="Clear search" variant="invisible" onClick={() => setSearch('')} />
        </Stack>

        {total === 0 && (
          <Blankslate border>
            <Blankslate.Visual>
              <SearchIcon size={24} />
            </Blankslate.Visual>
            <Blankslate.Heading>No results found</Blankslate.Heading>
            <Blankslate.Description>
              Nothing matched &ldquo;{query}&rdquo;. Try a different word, a person&apos;s name, or a channel.
            </Blankslate.Description>
          </Blankslate>
        )}

        {matchedChannels.length > 0 && (
          <Stack direction="vertical" gap="condensed">
            <Text size="small" weight="semibold" style={{ color: 'var(--fgColor-muted)' }}>
              Channels
            </Text>
            <Stack direction="vertical" gap="none">
              {matchedChannels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="chat-result"
                  onClick={() => selectConversation(`channel:${c.id}`)}
                >
                  <Stack direction="horizontal" gap="condensed" align="center">
                    <span style={{ color: 'var(--fgColor-muted)', display: 'inline-flex' }}>
                      {c.isPrivate ? <LockIcon /> : <HashIcon />}
                    </span>
                    <Text weight="semibold">
                      <Highlight text={c.name} query={q} />
                    </Text>
                    <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                      <Highlight text={c.description} query={q} />
                    </Text>
                  </Stack>
                </button>
              ))}
            </Stack>
          </Stack>
        )}

        {matchedMessages.length > 0 && (
          <Stack direction="vertical" gap="condensed">
            <Text size="small" weight="semibold" style={{ color: 'var(--fgColor-muted)' }}>
              Messages
            </Text>
            <Stack direction="vertical" gap="none">
              {matchedMessages.map((m) => {
                const author = getUser(m.authorId)
                return (
                  <button
                    key={m.id}
                    type="button"
                    className="chat-result"
                    onClick={() =>
                      m.parentId ? openThread(m.parentId) : selectConversation(m.conversationId)
                    }
                  >
                    <Stack direction="horizontal" gap="condensed" align="start">
                      <PresenceAvatar user={author} size={32} showPresence={false} />
                      <Stack direction="vertical" gap="none" style={{ minWidth: 0 }}>
                        <Stack direction="horizontal" gap="condensed" align="baseline" wrap="wrap">
                          <Text weight="semibold" size="small">
                            <Highlight text={author.name} query={q} />
                          </Text>
                          <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                            {m.day} at {m.time}
                          </Text>
                          <Label size="small" variant="secondary">
                            {conversationLabel(m.conversationId)}
                          </Label>
                          {m.parentId && (
                            <Label size="small" variant="accent">
                              Thread reply
                            </Label>
                          )}
                        </Stack>
                        <Text size="medium" style={{ overflowWrap: 'anywhere' }}>
                          <Highlight text={m.text} query={q} />
                        </Text>
                      </Stack>
                    </Stack>
                  </button>
                )
              })}
            </Stack>
          </Stack>
        )}
      </Stack>
    </div>
  )
}
