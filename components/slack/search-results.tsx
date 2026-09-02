'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { channelIdFrom, conversationLabel, CURRENT_USER_ID } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import { HashIcon, LockIcon, SearchIcon, XIcon } from './icons'

function Highlight({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-amber-100 text-inherit">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchResults({ query }: { query: string }) {
  const {
    messages,
    channels,
    users,
    selectConversation,
    jumpToMessage,
    setSearch,
    isMember,
  } = useWorkspace()
  const q = query.trim().toLowerCase()

  const matchedChannels = channels.filter(
    (c) =>
      (isMember(c.id) || !c.isPrivate) &&
      (c.name.includes(q) || c.description.toLowerCase().includes(q)),
  )
  const matchedPeople = users.filter(
    (u) =>
      u.id !== CURRENT_USER_ID &&
      (u.name.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q)),
  )
  const matchedMessages = messages.filter((m) => {
    if (m.deleted) return false
    const channelId = channelIdFrom(m.conversationId)
    if (channelId && !isMember(channelId)) return false
    return (
      m.text.toLowerCase().includes(q) ||
      Boolean(users.find((u) => u.id === m.authorId)?.name.toLowerCase().includes(q))
    )
  })

  const total =
    matchedChannels.length + matchedPeople.length + matchedMessages.length

  return (
    <div className="chat-scroll">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Search results</h1>
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? 'result' : 'results'} for “{query}”
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            onClick={() => setSearch('')}
          >
            <XIcon />
          </Button>
        </div>

        {total === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-10 text-center">
            <SearchIcon className="mb-3 size-6 text-muted-foreground" />
            <h3 className="font-semibold">No results found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Nothing matched “{query}”. Try a different word, a person&apos;s name, or a
              channel.
            </p>
          </div>
        )}

        {matchedChannels.length > 0 && (
          <section className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Channels
            </h2>
            {matchedChannels.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chat-result"
                onClick={() => selectConversation(`channel:${c.id}`)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {c.isPrivate ? <LockIcon className="size-4" /> : <HashIcon className="size-4" />}
                  </span>
                  <span className="font-semibold">
                    <Highlight text={c.name} query={q} />
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    <Highlight text={c.description} query={q} />
                  </span>
                </span>
              </button>
            ))}
          </section>
        )}

        {matchedPeople.length > 0 && (
          <section className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              People
            </h2>
            {matchedPeople.map((u) => (
              <button
                key={u.id}
                type="button"
                className="chat-result"
                onClick={() => selectConversation(`dm:${u.id}`)}
              >
                <span className="flex items-center gap-2">
                  <PresenceAvatar user={u} size={28} />
                  <span>
                    <span className="block font-semibold">
                      <Highlight text={u.name} query={q} />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      @{u.handle} · {u.title}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </section>
        )}

        {matchedMessages.length > 0 && (
          <section className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Messages
            </h2>
            {matchedMessages.map((m) => {
              const author = users.find((u) => u.id === m.authorId) ?? users[0]
              return (
                <button
                  key={m.id}
                  type="button"
                  className="chat-result"
                  onClick={() => jumpToMessage(m)}
                >
                  <span className="flex items-start gap-2">
                    <PresenceAvatar user={author} size={32} showPresence={false} />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-semibold">
                          <Highlight text={author.name} query={q} />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.day} at {m.time}
                        </span>
                        <Badge variant="secondary">
                          {conversationLabel(m.conversationId, channels, users)}
                        </Badge>
                        {m.parentId && <Badge variant="outline">Thread reply</Badge>}
                      </span>
                      <span className="mt-0.5 block text-sm">
                        <Highlight text={m.text} query={q} />
                      </span>
                    </span>
                  </span>
                </button>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
