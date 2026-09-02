'use client'

import {
  Stack,
  Text,
  Heading,
  IconButton,
  Button,
  AvatarStack,
  Avatar,
  ActionMenu,
  ActionList,
} from './ui'
import {
  HashIcon,
  LockIcon,
  ChevronDownIcon,
  PinIcon,
  BellIcon,
  PersonAddIcon,
  InfoIcon,
  StarIcon,
  ThreeBarsIcon,
} from './icons'
import { getChannel, getUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'

export function ConversationHeader({ conversationId }: { conversationId: string }) {
  const { toggleSidebar } = useWorkspace()
  const isChannel = conversationId.startsWith('channel:')
  const channel = isChannel ? getChannel(conversationId.slice('channel:'.length)) : undefined
  const user = !isChannel ? getUser(conversationId.slice('dm:'.length)) : undefined

  return (
    <header
      style={{
        borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        backgroundColor: 'var(--bgColor-default)',
        flexShrink: 0,
      }}
    >
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="condensed"
        style={{
          height: 'var(--base-size-48)',
          paddingInline: 'var(--base-size-12)',
        }}
      >
        <Stack direction="horizontal" align="center" gap="condensed" style={{ minWidth: 0 }}>
          <IconButton
            className="chat-menu-toggle"
            icon={ThreeBarsIcon}
            aria-label="Open sidebar"
            variant="invisible"
            onClick={() => toggleSidebar(true)}
          />
          {channel && (
            <ActionMenu>
              <ActionMenu.Anchor>
                <Button
                  variant="invisible"
                  leadingVisual={channel.isPrivate ? LockIcon : HashIcon}
                  trailingVisual={ChevronDownIcon}
                  style={{ color: 'var(--fgColor-default)' }}
                >
                  <Heading as="h1" variant="small" style={{ fontSize: 'inherit' }}>
                    {channel.name}
                  </Heading>
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay width="medium">
                <ActionList>
                  <ActionList.Item>
                    <ActionList.LeadingVisual>
                      <InfoIcon />
                    </ActionList.LeadingVisual>
                    Channel details
                    <ActionList.Description variant="block">
                      {channel.description}
                    </ActionList.Description>
                  </ActionList.Item>
                  <ActionList.Item>
                    <ActionList.LeadingVisual>
                      <StarIcon />
                    </ActionList.LeadingVisual>
                    Star channel
                  </ActionList.Item>
                  <ActionList.Item>
                    <ActionList.LeadingVisual>
                      <BellIcon />
                    </ActionList.LeadingVisual>
                    Notification preferences
                  </ActionList.Item>
                  <ActionList.Divider />
                  <ActionList.Item variant="danger">Leave channel</ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          )}
          {user && (
            <Stack direction="horizontal" align="center" gap="condensed">
              <PresenceAvatar user={user} size={24} />
              <Heading as="h1" variant="small">
                {user.name}
              </Heading>
              <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                {user.title}
              </Text>
            </Stack>
          )}
        </Stack>

        <Stack direction="horizontal" align="center" gap="condensed">
          {channel && (
            <Button
              variant="default"
              size="small"
              trailingVisual={PersonAddIcon}
              aria-label={`${channel.memberIds.length} members`}
            >
              <Stack direction="horizontal" align="center" gap="condensed">
                <AvatarStack size={20}>
                  {channel.memberIds.slice(0, 3).map((id) => {
                    const u = getUser(id)
                    return <Avatar key={id} src={u.avatar} alt={u.name} square />
                  })}
                </AvatarStack>
                <span>{channel.memberIds.length}</span>
              </Stack>
            </Button>
          )}
          <IconButton icon={PinIcon} aria-label="Pinned messages" variant="invisible" />
          <IconButton icon={BellIcon} aria-label="Notifications" variant="invisible" />
        </Stack>
      </Stack>
    </header>
  )
}
