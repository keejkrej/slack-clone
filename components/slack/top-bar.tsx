'use client'

import { Stack, TextInput, IconButton, ActionMenu, ActionList, Text } from './ui'
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  QuestionIcon,
  GearIcon,
  SignOutIcon,
  PersonIcon,
} from './icons'
import { CURRENT_USER_ID, getUser } from '@/lib/data'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'

export function TopBar() {
  const { searchQuery, setSearch } = useWorkspace()
  const me = getUser(CURRENT_USER_ID)

  return (
    <header
      style={{
        height: 'var(--base-size-44)',
        flexShrink: 0,
        backgroundColor: 'var(--bgColor-inset)',
        borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-default)',
      }}
    >
      <Stack
        direction="horizontal"
        align="center"
        justify="space-between"
        gap="normal"
        style={{ height: '100%', paddingInline: 'var(--base-size-12)' }}
      >
        <Stack direction="horizontal" align="center" gap="none" style={{ width: 200 }}>
          <IconButton icon={ChevronLeftIcon} aria-label="Back" variant="invisible" size="small" />
          <IconButton icon={ChevronRightIcon} aria-label="Forward" variant="invisible" size="small" />
          <IconButton icon={ClockIcon} aria-label="History" variant="invisible" size="small" />
        </Stack>

        <div style={{ flex: 1, maxWidth: 640 }}>
          <TextInput
            block
            size="small"
            leadingVisual={SearchIcon}
            aria-label="Search Octo Labs"
            placeholder="Search Octo Labs"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearch('')
            }}
          />
        </div>

        <Stack direction="horizontal" align="center" gap="condensed" justify="end" style={{ width: 200 }}>
          <IconButton icon={QuestionIcon} aria-label="Help" variant="invisible" size="small" />
          <ActionMenu>
            <ActionMenu.Anchor>
              <button
                type="button"
                aria-label="Account menu"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  borderRadius: 'var(--borderRadius-medium)',
                }}
              >
                <PresenceAvatar user={me} size={28} />
              </button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay width="medium" align="end">
              <ActionList>
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <PresenceAvatar user={me} size={20} showPresence={false} />
                  </ActionList.LeadingVisual>
                  {me.name}
                  <ActionList.Description variant="block">
                    <Text size="small">Active</Text>
                  </ActionList.Description>
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <PersonIcon />
                  </ActionList.LeadingVisual>
                  Profile
                </ActionList.Item>
                <ActionList.Item>
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  Preferences
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item variant="danger">
                  <ActionList.LeadingVisual>
                    <SignOutIcon />
                  </ActionList.LeadingVisual>
                  Sign out of Octo Labs
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Stack>
      </Stack>
    </header>
  )
}
