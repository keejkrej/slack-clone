'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { presenceLabel, type Presence } from '@/lib/data'
import { toast } from 'sonner'
import { useWorkspace } from './workspace-provider'
import { PresenceAvatar } from './presence-avatar'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GearIcon,
  PersonIcon,
  QuestionIcon,
  SearchIcon,
  SignOutIcon,
} from './icons'
import { HelpDialog, PreferencesDialog } from './dialogs'
import { UserProfileDialog } from './user-profile'

export function TopBar({ onJump }: { onJump: () => void }) {
  const {
    searchQuery,
    setSearch,
    currentUser,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    setPresence,
  } = useWorkspace()
  const [helpOpen, setHelpOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="chat-topbar">
      <div className="flex h-full items-center justify-between gap-3 px-3">
        <div className="flex w-[200px] items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back"
            disabled={!canGoBack}
            className="text-white/80 hover:bg-white/10 hover:text-white disabled:text-white/30"
            onClick={goBack}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Forward"
            disabled={!canGoForward}
            className="text-white/80 hover:bg-white/10 hover:text-white disabled:text-white/30"
            onClick={goForward}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="History"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={onJump}
          >
            <ClockIcon />
          </Button>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-white/60" />
            <Input
              aria-label="Search Octo Labs"
              placeholder="Search Octo Labs"
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch('')
              }}
              className="h-8 border-white/10 bg-white/15 pl-8 text-white placeholder:text-white/60 focus-visible:border-white/30 focus-visible:ring-white/20"
            />
          </div>
        </div>

        <div className="flex w-[200px] items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Jump to"
            className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
            onClick={onJump}
          >
            <Kbd className="border-0 bg-white/15 text-[10px] text-white">⌘K</Kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Help"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => setHelpOpen(true)}
          >
            <QuestionIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md outline-none"
              aria-label="Account menu"
            >
              <PresenceAvatar user={currentUser} size={28} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <PresenceAvatar user={currentUser} size={32} />
                <div>
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {presenceLabel(currentUser.presence)}
                    {currentUser.statusText ? ` · ${currentUser.statusText}` : ''}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={currentUser.presence}
                onValueChange={(value) => setPresence(value as Presence)}
              >
                <DropdownMenuRadioItem value="online">Active</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="away">Away</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="offline">Offline</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <PersonIcon /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPrefsOpen(true)}>
                <GearIcon /> Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  toast.message("This is a client-only demo — you're still signed in as Alex.")
                }
              >
                <SignOutIcon /> Sign out of Octo Labs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} />
      <UserProfileDialog
        user={currentUser}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </header>
  )
}
