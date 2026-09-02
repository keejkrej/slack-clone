'use client'

import { useState } from 'react'
import {
  NavList,
  Stack,
  Text,
  Heading,
  IconButton,
  CounterLabel,
  Button,
  ActionMenu,
  ActionList,
  FormControl,
  TextInput,
  Checkbox,
} from './ui'
import { Dialog } from './ui'
import {
  HashIcon,
  LockIcon,
  PlusIcon,
  ChevronDownIcon,
  PencilIcon,
  InboxIcon,
  CommentDiscussionIcon,
  BookmarkIcon,
  GearIcon,
  SignOutIcon,
  PersonIcon,
} from './icons'
import { users, CURRENT_USER_ID, getUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'

export function Sidebar() {
  const {
    channels,
    activeConversationId,
    selectConversation,
    unread,
    createChannel,
    sidebarOpen,
    toggleSidebar,
  } = useWorkspace()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const me = getUser(CURRENT_USER_ID)
  const others = users.filter((u) => u.id !== CURRENT_USER_ID)

  const submitChannel = () => {
    if (!name.trim()) return
    createChannel(name, description, isPrivate)
    setDialogOpen(false)
    setName('')
    setDescription('')
    setIsPrivate(false)
  }

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="chat-backdrop"
          aria-label="Close sidebar"
          onClick={() => toggleSidebar(false)}
        />
      )}
      <aside className="chat-sidebar" data-open={sidebarOpen} aria-label="Workspace navigation">
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
          style={{
            height: 'var(--base-size-48)',
            paddingInline: 'var(--base-size-12)',
            paddingLeft: 'var(--base-size-16)',
            borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            flexShrink: 0,
          }}
        >
          <ActionMenu>
            <ActionMenu.Anchor>
              <Button
                variant="invisible"
                trailingVisual={ChevronDownIcon}
                style={{ color: 'var(--fgColor-default)', paddingInline: 'var(--base-size-4)' }}
              >
                <Heading as="h2" variant="small" style={{ fontSize: 'var(--text-body-size-large)' }}>
                  Octo Labs
                </Heading>
              </Button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay width="medium">
              <ActionList>
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  Invite people to Octo Labs
                </ActionList.Item>
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  Workspace settings
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item variant="danger">
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  Sign out
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <IconButton
            icon={PencilIcon}
            aria-label="New message"
            variant="invisible"
            onClick={() => setDialogOpen(true)}
          />
        </Stack>

        <div style={{ padding: 'var(--base-size-8)', flex: 1 }}>
          <NavList aria-label="Conversations">
            <NavList.Item href="#" onClick={(e) => e.preventDefault()}>
              <NavList.LeadingVisual>
                <CommentDiscussionIcon />
              </NavList.LeadingVisual>
              Threads
            </NavList.Item>
            <NavList.Item href="#" onClick={(e) => e.preventDefault()}>
              <NavList.LeadingVisual>
                <InboxIcon />
              </NavList.LeadingVisual>
              Activity
              <NavList.TrailingVisual>
                <CounterLabel>4</CounterLabel>
              </NavList.TrailingVisual>
            </NavList.Item>
            <NavList.Item href="#" onClick={(e) => e.preventDefault()}>
              <NavList.LeadingVisual>
                <BookmarkIcon />
              </NavList.LeadingVisual>
              Saved items
            </NavList.Item>

            <NavList.Divider />

            <NavList.Group title="Channels">
              {channels.map((channel) => {
                const id = `channel:${channel.id}`
                const count = unread[id]
                const active = id === activeConversationId
                return (
                  <NavList.Item
                    key={channel.id}
                    href="#"
                    aria-current={active ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      selectConversation(id)
                    }}
                  >
                    <NavList.LeadingVisual>
                      {channel.isPrivate ? <LockIcon /> : <HashIcon />}
                    </NavList.LeadingVisual>
                    <span style={{ fontWeight: count ? 'var(--base-text-weight-semibold)' : undefined }}>
                      {channel.name}
                    </span>
                    {count ? (
                      <NavList.TrailingVisual>
                        <CounterLabel scheme="primary">{count}</CounterLabel>
                      </NavList.TrailingVisual>
                    ) : null}
                  </NavList.Item>
                )
              })}
              <NavList.Item
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setDialogOpen(true)
                }}
              >
                <NavList.LeadingVisual>
                  <PlusIcon />
                </NavList.LeadingVisual>
                <Text style={{ color: 'var(--fgColor-muted)' }}>Add channel</Text>
              </NavList.Item>
            </NavList.Group>

            <NavList.Group title="Direct messages">
              {others.map((user) => {
                const id = `dm:${user.id}`
                const count = unread[id]
                const active = id === activeConversationId
                return (
                  <NavList.Item
                    key={user.id}
                    href="#"
                    aria-current={active ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      selectConversation(id)
                    }}
                  >
                    <NavList.LeadingVisual>
                      <PresenceAvatar user={user} size={20} />
                    </NavList.LeadingVisual>
                    <span style={{ fontWeight: count ? 'var(--base-text-weight-semibold)' : undefined }}>
                      {user.name}
                    </span>
                    {count ? (
                      <NavList.TrailingVisual>
                        <CounterLabel scheme="primary">{count}</CounterLabel>
                      </NavList.TrailingVisual>
                    ) : null}
                  </NavList.Item>
                )
              })}
            </NavList.Group>
          </NavList>
        </div>

        <Stack
          direction="horizontal"
          align="center"
          gap="condensed"
          style={{
            padding: 'var(--base-size-12) var(--base-size-16)',
            borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
            flexShrink: 0,
          }}
        >
          <PresenceAvatar user={me} size={32} />
          <Stack direction="vertical" gap="none" style={{ minWidth: 0 }}>
            <Text weight="semibold" size="small">
              {me.name}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Active
            </Text>
          </Stack>
        </Stack>
      </aside>

      {dialogOpen && (
        <Dialog
          title="Create a channel"
          subtitle="Channels are where your team communicates. They are best organized around a topic."
          onClose={() => setDialogOpen(false)}
          footerButtons={[
            { buttonType: 'default', content: 'Cancel', onClick: () => setDialogOpen(false) },
            {
              buttonType: 'primary',
              content: 'Create',
              disabled: !name.trim(),
              onClick: submitChannel,
            },
          ]}
        >
          <Stack direction="vertical" gap="normal">
            <FormControl required>
              <FormControl.Label>Name</FormControl.Label>
              <TextInput
                block
                leadingVisual={isPrivate ? LockIcon : HashIcon}
                placeholder="e.g. plan-budget"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <FormControl.Caption>
                Lowercase, without spaces or periods.
              </FormControl.Caption>
            </FormControl>
            <FormControl>
              <FormControl.Label>Description</FormControl.Label>
              <TextInput
                block
                placeholder="What is this channel about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Checkbox
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <FormControl.Label>Make private</FormControl.Label>
              <FormControl.Caption>
                Only invited members can view or join a private channel.
              </FormControl.Caption>
            </FormControl>
          </Stack>
        </Dialog>
      )}
    </>
  )
}
