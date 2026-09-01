export type Presence = 'online' | 'away' | 'offline'

export type User = {
  id: string
  name: string
  handle: string
  title: string
  avatar: string
  presence: Presence
}

export type Channel = {
  id: string
  name: string
  description: string
  isPrivate: boolean
  memberIds: string[]
}

export type Reaction = {
  emoji: string
  userIds: string[]
}

export type Message = {
  id: string
  /** `channel:<id>` or `dm:<userId>` */
  conversationId: string
  authorId: string
  text: string
  /** Display time, e.g. "9:14 AM" */
  time: string
  /** Day bucket label used for date dividers */
  day: string
  reactions: Reaction[]
  /** When set, this message is a thread reply to the parent */
  parentId?: string
}

export const CURRENT_USER_ID = 'u-alex'

export const users: User[] = [
  {
    id: 'u-alex',
    name: 'Alex Rivera',
    handle: 'alex',
    title: 'Product Engineer',
    avatar: '/avatars/alex.png',
    presence: 'online',
  },
  {
    id: 'u-priya',
    name: 'Priya Nair',
    handle: 'priya',
    title: 'Design Lead',
    avatar: '/avatars/priya.png',
    presence: 'online',
  },
  {
    id: 'u-marcus',
    name: 'Marcus Chen',
    handle: 'marcus',
    title: 'Staff Engineer',
    avatar: '/avatars/marcus.png',
    presence: 'away',
  },
  {
    id: 'u-sofia',
    name: 'Sofia Martins',
    handle: 'sofia',
    title: 'Engineering Manager',
    avatar: '/avatars/sofia.png',
    presence: 'online',
  },
  {
    id: 'u-devon',
    name: 'Devon Walsh',
    handle: 'devon',
    title: 'Platform Engineer',
    avatar: '/avatars/devon.png',
    presence: 'offline',
  },
  {
    id: 'u-hana',
    name: 'Hana Sato',
    handle: 'hana',
    title: 'Product Manager',
    avatar: '/avatars/hana.png',
    presence: 'online',
  },
]

const everyone = users.map((u) => u.id)

export const channels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Company-wide announcements and work-based matters',
    isPrivate: false,
    memberIds: everyone,
  },
  {
    id: 'engineering',
    name: 'engineering',
    description: 'Shipping, incidents, PR reviews, and architecture chatter',
    isPrivate: false,
    memberIds: ['u-alex', 'u-marcus', 'u-sofia', 'u-devon'],
  },
  {
    id: 'design',
    name: 'design',
    description: 'Design critiques, Figma links, and Primer component talk',
    isPrivate: false,
    memberIds: ['u-alex', 'u-priya', 'u-hana'],
  },
  {
    id: 'random',
    name: 'random',
    description: 'Non-work banter, links, and the occasional cat photo',
    isPrivate: false,
    memberIds: everyone,
  },
  {
    id: 'launch-q3',
    name: 'launch-q3',
    description: 'Private coordination for the Q3 launch',
    isPrivate: true,
    memberIds: ['u-alex', 'u-sofia', 'u-hana'],
  },
]

export const seedMessages: Message[] = [
  // #general
  {
    id: 'm1',
    conversationId: 'channel:general',
    authorId: 'u-sofia',
    text: 'Morning all! Reminder that the all-hands is at 11:00 today. We will walk through the Q3 roadmap and take questions at the end.',
    time: '8:52 AM',
    day: 'Yesterday',
    reactions: [{ emoji: '👍', userIds: ['u-alex', 'u-priya', 'u-marcus'] }],
  },
  {
    id: 'm2',
    conversationId: 'channel:general',
    authorId: 'u-hana',
    text: 'Slides are in the shared drive if anyone wants a preview. Feedback welcome before 10:30.',
    time: '9:04 AM',
    day: 'Yesterday',
    reactions: [{ emoji: '🙌', userIds: ['u-sofia'] }],
  },
  {
    id: 'm3',
    conversationId: 'channel:general',
    authorId: 'u-devon',
    text: 'Heads up: the office wifi will be down for maintenance from 6-7 PM tonight.',
    time: '2:17 PM',
    day: 'Yesterday',
    reactions: [{ emoji: '😢', userIds: ['u-marcus', 'u-alex'] }],
  },
  {
    id: 'm4',
    conversationId: 'channel:general',
    authorId: 'u-priya',
    text: 'The new onboarding doc is live. It covers workspace conventions, channel etiquette, and where to find things. Would love a second pair of eyes on the "Getting help" section.',
    time: '9:12 AM',
    day: 'Today',
    reactions: [
      { emoji: '🎉', userIds: ['u-alex', 'u-hana', 'u-sofia', 'u-devon'] },
      { emoji: '👀', userIds: ['u-marcus'] },
    ],
  },
  {
    id: 'm4r1',
    conversationId: 'channel:general',
    authorId: 'u-alex',
    text: 'Reading now. First pass: the tone is great, maybe add a link to the escalation channel?',
    time: '9:20 AM',
    day: 'Today',
    reactions: [],
    parentId: 'm4',
  },
  {
    id: 'm4r2',
    conversationId: 'channel:general',
    authorId: 'u-priya',
    text: 'Good call, adding it.',
    time: '9:23 AM',
    day: 'Today',
    reactions: [{ emoji: '👍', userIds: ['u-alex'] }],
    parentId: 'm4',
  },
  {
    id: 'm5',
    conversationId: 'channel:general',
    authorId: 'u-marcus',
    text: 'Welcome to the team, Devon! Feel free to ping me with any questions about the deploy pipeline.',
    time: '10:41 AM',
    day: 'Today',
    reactions: [{ emoji: '👋', userIds: ['u-alex', 'u-priya', 'u-hana', 'u-sofia'] }],
  },

  // #engineering
  {
    id: 'e1',
    conversationId: 'channel:engineering',
    authorId: 'u-marcus',
    text: 'Opened a PR that migrates the message store to the new reducer pattern. It touches a lot of files, so reviews welcome: primer/chat#412',
    time: '8:30 AM',
    day: 'Today',
    reactions: [{ emoji: '👀', userIds: ['u-alex', 'u-devon'] }],
  },
  {
    id: 'e1r1',
    conversationId: 'channel:engineering',
    authorId: 'u-devon',
    text: 'Looking now. Do we still need the legacy adapter after this lands?',
    time: '8:44 AM',
    day: 'Today',
    reactions: [],
    parentId: 'e1',
  },
  {
    id: 'e1r2',
    conversationId: 'channel:engineering',
    authorId: 'u-marcus',
    text: 'Nope, I will delete it in a follow-up once this merges. Kept the diff focused.',
    time: '8:47 AM',
    day: 'Today',
    reactions: [{ emoji: '✅', userIds: ['u-devon', 'u-alex'] }],
    parentId: 'e1',
  },
  {
    id: 'e1r3',
    conversationId: 'channel:engineering',
    authorId: 'u-alex',
    text: 'Left a few nits about naming, otherwise LGTM.',
    time: '9:31 AM',
    day: 'Today',
    reactions: [],
    parentId: 'e1',
  },
  {
    id: 'e2',
    conversationId: 'channel:engineering',
    authorId: 'u-sofia',
    text: 'Incident retro for last Thursday is on the calendar for 3 PM. Blameless as always, bring your timelines.',
    time: '9:05 AM',
    day: 'Today',
    reactions: [{ emoji: '👍', userIds: ['u-marcus', 'u-devon'] }],
  },
  {
    id: 'e3',
    conversationId: 'channel:engineering',
    authorId: 'u-devon',
    text: 'The staging deploy is green again. Root cause was a stale env var in the preview environment.',
    time: '11:18 AM',
    day: 'Today',
    reactions: [{ emoji: '🚀', userIds: ['u-alex', 'u-sofia', 'u-marcus'] }],
  },
  {
    id: 'e4',
    conversationId: 'channel:engineering',
    authorId: 'u-alex',
    text: 'Anyone else seeing flaky tests in the overlay suite? Third retry passed but that is not confidence-inspiring.',
    time: '11:52 AM',
    day: 'Today',
    reactions: [{ emoji: '😂', userIds: ['u-devon'] }],
  },

  // #design
  {
    id: 'd1',
    conversationId: 'channel:design',
    authorId: 'u-priya',
    text: 'Crit is at 2 PM. I will be showing the new thread pane layout and the reaction picker. Bring opinions.',
    time: '9:40 AM',
    day: 'Today',
    reactions: [{ emoji: '🔥', userIds: ['u-alex', 'u-hana'] }],
  },
  {
    id: 'd2',
    conversationId: 'channel:design',
    authorId: 'u-hana',
    text: 'Can we also spend five minutes on empty states? The search results Blankslate feels a bit sparse.',
    time: '9:58 AM',
    day: 'Today',
    reactions: [],
  },
  {
    id: 'd2r1',
    conversationId: 'channel:design',
    authorId: 'u-priya',
    text: 'Yes, added it to the agenda.',
    time: '10:02 AM',
    day: 'Today',
    reactions: [],
    parentId: 'd2',
  },
  {
    id: 'd3',
    conversationId: 'channel:design',
    authorId: 'u-alex',
    text: 'Small ask: the muted foreground token on the dark theme reads a little low-contrast for timestamps. Worth a look?',
    time: '10:36 AM',
    day: 'Today',
    reactions: [{ emoji: '👀', userIds: ['u-priya'] }],
  },

  // #random
  {
    id: 'r1',
    conversationId: 'channel:random',
    authorId: 'u-devon',
    text: 'Hot take: tabs are a tool for accessibility, spaces are a tool for control.',
    time: '4:12 PM',
    day: 'Yesterday',
    reactions: [
      { emoji: '😂', userIds: ['u-alex', 'u-marcus', 'u-hana'] },
      { emoji: '😮', userIds: ['u-priya'] },
    ],
  },
  {
    id: 'r2',
    conversationId: 'channel:random',
    authorId: 'u-hana',
    text: 'Coffee run at 3. Orders in the thread please.',
    time: '2:40 PM',
    day: 'Today',
    reactions: [{ emoji: '☕', userIds: ['u-alex', 'u-priya', 'u-sofia'] }],
  },
  {
    id: 'r2r1',
    conversationId: 'channel:random',
    authorId: 'u-priya',
    text: 'Oat flat white, thank you!',
    time: '2:41 PM',
    day: 'Today',
    reactions: [],
    parentId: 'r2',
  },
  {
    id: 'r2r2',
    conversationId: 'channel:random',
    authorId: 'u-sofia',
    text: 'Black americano. You are a hero.',
    time: '2:43 PM',
    day: 'Today',
    reactions: [{ emoji: '❤️', userIds: ['u-hana'] }],
    parentId: 'r2',
  },

  // #launch-q3
  {
    id: 'l1',
    conversationId: 'channel:launch-q3',
    authorId: 'u-hana',
    text: 'Launch checklist is at 80%. Remaining items: press embargo confirmation, status page copy, and the changelog post.',
    time: '8:15 AM',
    day: 'Today',
    reactions: [{ emoji: '💯', userIds: ['u-sofia'] }],
  },
  {
    id: 'l2',
    conversationId: 'channel:launch-q3',
    authorId: 'u-sofia',
    text: 'I will own the status page copy. Alex, can you take the changelog?',
    time: '8:22 AM',
    day: 'Today',
    reactions: [],
  },

  // DMs
  {
    id: 'p1',
    conversationId: 'dm:u-priya',
    authorId: 'u-priya',
    text: 'Hey! Do you have 15 minutes before crit to look at the reaction chip states with me?',
    time: '11:02 AM',
    day: 'Today',
    reactions: [],
  },
  {
    id: 'p2',
    conversationId: 'dm:u-priya',
    authorId: 'u-alex',
    text: 'Sure, 1:30 works. I will bring the token contrast notes too.',
    time: '11:05 AM',
    day: 'Today',
    reactions: [{ emoji: '👍', userIds: ['u-priya'] }],
  },
  {
    id: 'p3',
    conversationId: 'dm:u-priya',
    authorId: 'u-priya',
    text: 'Perfect, see you then.',
    time: '11:06 AM',
    day: 'Today',
    reactions: [],
  },
  {
    id: 'k1',
    conversationId: 'dm:u-marcus',
    authorId: 'u-marcus',
    text: 'Thanks for the review on #412. Merging after CI finishes.',
    time: '10:15 AM',
    day: 'Today',
    reactions: [{ emoji: '🚀', userIds: ['u-alex'] }],
  },
  {
    id: 's1',
    conversationId: 'dm:u-sofia',
    authorId: 'u-sofia',
    text: 'Quick one: are you good to present the changelog section at launch review Thursday?',
    time: '3:48 PM',
    day: 'Yesterday',
    reactions: [],
  },
  {
    id: 's2',
    conversationId: 'dm:u-sofia',
    authorId: 'u-alex',
    text: 'Yes, I will have a draft to you Wednesday morning.',
    time: '3:55 PM',
    day: 'Yesterday',
    reactions: [{ emoji: '🙌', userIds: ['u-sofia'] }],
  },
  {
    id: 'h1',
    conversationId: 'dm:u-hana',
    authorId: 'u-hana',
    text: 'Did you see the customer feedback thread? Two people asked for threaded replies in DMs.',
    time: '1:20 PM',
    day: 'Today',
    reactions: [],
  },
]

export const seedUnread: Record<string, number> = {
  'channel:engineering': 3,
  'channel:design': 1,
  'dm:u-hana': 1,
  'dm:u-marcus': 1,
}

export const EMOJI_CHOICES = [
  '👍',
  '❤️',
  '😂',
  '🎉',
  '👀',
  '🚀',
  '✅',
  '🙌',
  '😮',
  '😢',
  '🔥',
  '💯',
  '👋',
  '☕',
  '🤔',
  '💡',
]

export function getUser(id: string): User {
  return users.find((u) => u.id === id) ?? users[0]
}

export function getChannel(id: string): Channel | undefined {
  return channels.find((c) => c.id === id)
}

export function conversationLabel(conversationId: string): string {
  if (conversationId.startsWith('channel:')) {
    const c = getChannel(conversationId.slice('channel:'.length))
    return c ? `#${c.name}` : conversationId
  }
  return getUser(conversationId.slice('dm:'.length)).name
}
