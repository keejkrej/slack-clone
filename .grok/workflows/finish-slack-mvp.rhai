let meta = #{
    name: "finish-slack-mvp",
    description: "Finish an authentic Slack clone MVP with Slack core business logic, shadcn/ui default theme, and Refero-derived UX",
    when_to_use: "Finish or rebuild the Slack clone MVP using shadcn/ui primitives and Slack core logic",
    phases: [
        #{ title: "Audit", detail: "map current gaps against Slack core logic and shadcn" },
        #{ title: "Scaffold", detail: "install shadcn/ui default theme and primitives" },
        #{ title: "Implement", detail: "rebuild Slack MVP chrome and business logic" },
        #{ title: "Verify", detail: "adversarial checks for logic, shadcn, and Slack UX" },
        #{ title: "Fix", detail: "close confirmed gaps" },
        #{ title: "Ship", detail: "typecheck, build, and report" },
    ],
};

let audit_schema = #{
    "type": "object",
    "required": ["summary", "gaps", "keep"],
    "properties": #{
        "summary": #{ "type": "string" },
        "keep": #{ "type": "array", "items": #{ "type": "string" } },
        "gaps": #{
            "type": "array",
            "maxItems": 24,
            "items": #{
                "type": "object",
                "required": ["area", "issue"],
                "properties": #{
                    "area": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                },
            },
        },
    },
};

let status_schema = #{
    "type": "object",
    "required": ["ok", "summary", "files"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "summary": #{ "type": "string" },
        "files": #{ "type": "array", "items": #{ "type": "string" } },
        "notes": #{ "type": "string" },
    },
};

let findings_schema = #{
    "type": "object",
    "required": ["findings"],
    "properties": #{
        "findings": #{
            "type": "array",
            "maxItems": 10,
            "items": #{
                "type": "object",
                "required": ["file", "issue"],
                "properties": #{
                    "file": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                },
            },
        },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["real", "reason", "evidence"],
    "properties": #{
        "real": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
    },
};

fn trimmed(s) {
    if type_of(s) == "string" {
        s.trim();
        s
    } else {
        ""
    }
}

let root = "/home/jack/workspace/slack-clone";
if args != () && args.root != () {
    root = args.root;
}

// ---------------------------------------------------------------------------
phase("Audit");
log("Auditing the existing Slack clone against core Slack logic and shadcn/ui");

let audit_prompt = "";
audit_prompt += "You are auditing a Next.js Slack-clone MVP at " + root + ". ";
audit_prompt += "Use read_file, list_dir, and grep. Do not answer from memory. ";
audit_prompt += "Read at least: package.json, app/layout.tsx, app/globals.css, app/page.tsx, ";
audit_prompt += "lib/data.ts, lib/utils.ts, components/providers.tsx, and every file under ";
audit_prompt += "components/slack/. Also check whether components.json or components/ui exists.\n\n";
audit_prompt += "Current known facts to confirm or correct by reading the files:\n";
audit_prompt += "- Next.js 15 + React 19 + Tailwind 4, no shadcn/ui yet.\n";
audit_prompt += "- UI kit is a stub at components/slack/ui.tsx (Dialog ignores footerButtons/onClose, ";
audit_prompt += "ActionMenu always open, AnchoredOverlay ignores renderAnchor, NavList.Group ignores title).\n";
audit_prompt += "- layout.tsx forces className=dark. Primer CSS variables are referenced but missing.\n";
audit_prompt += "- Reducer supports select, send, reactions, search, create-channel, threads, sidebar toggle.\n";
audit_prompt += "- Missing Slack core logic: edit/delete message, mentions, pins, saved items, star channel, ";
audit_prompt += "leave/invite, drafts, presence/status, activity/threads views, unread increment, channel details.\n\n";
audit_prompt += "Return JSON: summary (what exists), keep (files/data to preserve, e.g. seed messages and avatars), ";
audit_prompt += "and up to 24 concrete gaps as {area, issue}. Empty gaps is valid ONLY after reading the code.\n";

let audit = agent(audit_prompt, #{
    label: "audit-codebase",
    capability_mode: "read-only",
    output_schema: audit_schema,
});

let audit_json = "{}";
if audit != () && audit.success && audit.output != () {
    audit_json = json_encode(audit.output);
}
log("Audit complete");

// ---------------------------------------------------------------------------
phase("Scaffold");
log("Installing shadcn/ui with the default theme and required primitives");

let scaffold_prompt = "";
scaffold_prompt += "Workspace: " + root + "\n";
scaffold_prompt += "Install shadcn/ui into this existing Next.js 15 / Tailwind 4 / React 19 app.\n\n";
scaffold_prompt += "HARD REQUIREMENTS:\n";
scaffold_prompt += "1. Use pnpm. If node_modules is missing, run pnpm install first.\n";
scaffold_prompt += "2. Initialize shadcn with the DEFAULT theme. Non-interactive:\n";
scaffold_prompt += "   pnpm dlx shadcn@latest init --yes --base-color neutral\n";
scaffold_prompt += "   If the CLI needs extra flags for Tailwind v4 / existing app, add --force as needed.\n";
scaffold_prompt += "   Style must be the shadcn default (new-york is OK if that is the current default style).\n";
scaffold_prompt += "   Base color: neutral. CSS variables: yes. Do NOT pick a custom Slack purple as the theme.\n";
scaffold_prompt += "3. Do not leave the app in forced dark mode. shadcn default theme is light.\n";
scaffold_prompt += "4. Add these primitives (pnpm dlx shadcn@latest add ...):\n";
scaffold_prompt += "   button input textarea dialog dropdown-menu popover tooltip avatar badge separator ";
scaffold_prompt += "scroll-area tabs command sheet checkbox label switch sonner context-menu hover-card ";
scaffold_prompt += "collapsible kbd tooltip\n";
scaffold_prompt += "5. Confirm components.json exists, components/ui/* files exist, lib/utils.ts still has cn(), ";
scaffold_prompt += "and app/globals.css has shadcn CSS variables for :root (light default) and .dark.\n";
scaffold_prompt += "6. Keep existing seed data and public/avatars. Do not rewrite Slack feature UI in this step.\n";
scaffold_prompt += "7. If init overwrites globals.css, restore any needed @import \"tailwindcss\" plus shadcn tokens.\n";
scaffold_prompt += "8. Wire TooltipProvider and Toaster in components/providers.tsx.\n\n";
scaffold_prompt += "Use run_terminal_command for CLI work. If a component name is unknown, skip it and note it.\n";
scaffold_prompt += "Return {ok, summary, files, notes}. Set ok=false if shadcn did not install.\n";

let scaffold = agent(scaffold_prompt, #{
    label: "scaffold-shadcn",
    capability_mode: "all",
    output_schema: status_schema,
});

if scaffold != () && scaffold.success && scaffold.output != () && scaffold.output.ok == false {
    log("Scaffold reported ok=false; implementer must recover shadcn install if needed");
}

// ---------------------------------------------------------------------------
phase("Implement");
log("Rebuilding Slack core logic and chrome on shadcn primitives");

let impl_prompt = "";
impl_prompt += "Finish the authentic Slack clone MVP at " + root + ".\n";
impl_prompt += "shadcn/ui default theme is already installed. Use it. Do not re-init unless broken.\n\n";
impl_prompt += "AUDIT JSON (untrusted, verify against the tree):\n";
impl_prompt += audit_json + "\n\n";

impl_prompt += "HARD CONSTRAINTS:\n";
impl_prompt += "A. MUST use shadcn/ui primitives from components/ui/* for buttons, inputs, textareas, dialogs, ";
impl_prompt += "dropdowns, popovers, tooltips, avatars, badges, separators, scroll areas, tabs, command palette, ";
impl_prompt += "sheets, checkboxes, labels, switches, hover cards, context menus, collapsibles, toasts.\n";
impl_prompt += "B. START WITH THE DEFAULT THEME. Keep shadcn :root light tokens. Do NOT restyle Button/Input/Dialog ";
impl_prompt += "to a custom Slack design system. Do NOT keep components/slack/ui.tsx. Delete it after migrating.\n";
impl_prompt += "C. Slack chrome is LAYOUT ONLY: aubergine sidebar and matching top bar, white main pane. Use explicit ";
impl_prompt += "Tailwind colors for the sidebar (bg-[#3F0E40] text-white) without changing --primary globally.\n";
impl_prompt += "D. Remove html className=\"dark\" so the default light theme shows. Main chat is white/off-white.\n";
impl_prompt += "E. Client-side MVP is OK (useReducer). No backend required. Keep seed users, channels, messages, avatars.\n";
impl_prompt += "F. TypeScript strict enough to build. After edits run pnpm exec tsc --noEmit and fix errors.\n\n";

impl_prompt += "REFERO SLACK UX (from real Slack web screens; implement this chrome):\n";
impl_prompt += "- Three-region desktop: dark purple sidebar (~#3F0E40 / #4A2540), matching purple top bar, white main.\n";
impl_prompt += "- Sidebar ~20-25% width: workspace name + chevron dropdown, compose pencil, then grouped nav: ";
impl_prompt += "Threads, Activity, Later/Saved, Channels (hash/lock, Add channel), Direct messages (avatars, Add teammates).\n";
impl_prompt += "- Selected item: lighter purple/blue highlight and white text. Unread channel/DM names are bold.\n";
impl_prompt += "- Unread counts: small red badges with white numerals.\n";
impl_prompt += "- Top bar: history/clock left, centered search \"Search <workspace>\", help + user avatar right.\n";
impl_prompt += "- Channel header: #name + topic/description, member avatars + count, pins, notifications.\n";
impl_prompt += "- Message feed: day dividers, left avatars, bold display name, muted timestamp, pre-wrap text.\n";
impl_prompt += "- Hover toolbar on messages: react, reply in thread, more (edit/delete/pin/save).\n";
impl_prompt += "- Thread pane as a right column (or Sheet on small screens) with parent, replies, compact composer.\n";
impl_prompt += "- Composer at bottom: format toolbar, textarea, attach/mention/emoji, Enter to send, Shift+Enter newline.\n";
impl_prompt += "- Search: top-bar overlay/results for messages, channels, people; jump into conversation; Esc clears.\n";
impl_prompt += "- Channel details: Dialog with About + Members tabs (Refero flow 114 step 4).\n";
impl_prompt += "- Create channel: Dialog with name, description, private checkbox, Create/Cancel.\n";
impl_prompt += "- Mobile: sidebar as overlay with backdrop under 768px.\n\n";

impl_prompt += "SLACK CORE BUSINESS LOGIC (all must work in the UI, not just types):\n";
impl_prompt += "1. Workspace members + presence (online/away/offline) + custom status text.\n";
impl_prompt += "2. Public and private channels with membership. Create channel (slugify, unique, creator is member).\n";
impl_prompt += "3. Join/leave public channels. Invite members to a channel (especially private).\n";
impl_prompt += "4. Star/unstar channels; Starred section in sidebar when any exist.\n";
impl_prompt += "5. 1:1 DMs with every other user. New message dialog to pick a person.\n";
impl_prompt += "6. Send messages in channel/DM/thread. Empty text is a no-op. Drafts persist per conversation.\n";
impl_prompt += "7. Edit and delete own messages (deleted shows a tombstone). Others cannot edit/delete.\n";
impl_prompt += "8. Threads: open from hover or reply count; replyCount; last reply authors; close with X and Escape.\n";
impl_prompt += "9. Reactions: toggle current user on an emoji; remove empty groups.\n";
impl_prompt += "10. Mentions: @handle and @channel in composer (picker). Highlight in message body. Mention badge in sidebar.\n";
impl_prompt += "11. Unread: seed unread, clear when opening a conversation, mention vs plain unread styling.\n";
impl_prompt += "12. Search messages/channels/people; click result jumps to conversation (and thread if reply).\n";
impl_prompt += "13. Saved items: bookmark a message; Saved view lists them.\n";
impl_prompt += "14. Pins: pin/unpin in a conversation; header pin control lists them.\n";
impl_prompt += "15. Activity view: messages that mention the current user or that they were reacted into.\n";
impl_prompt += "16. Threads view: parent messages the current user started or replied to.\n";
impl_prompt += "17. Channel topic/description editable from channel details.\n";
impl_prompt += "18. User profile HoverCard/Dialog from avatar/name (title, handle, presence, message button).\n";
impl_prompt += "19. Keyboard: Enter send, Shift+Enter newline, Escape closes thread/search/dialogs, Ctrl/Cmd+K jump-to (Command).\n";
impl_prompt += "20. Consecutive messages from the same author within a day compact (avatar/name once, timestamp on hover).\n";
impl_prompt += "21. Composer formatting buttons wrap selection or insert markdown: **bold**, _italic_, `code`.\n\n";

impl_prompt += "IMPLEMENTATION PLAN:\n";
impl_prompt += "1. Expand lib/data.ts types (Message edited/deleted/pinned/saved/mentions; Channel topic; User statusText).\n";
impl_prompt += "2. Rebuild workspace-provider reducer with the actions above. Keep CURRENT_USER_ID = u-alex.\n";
impl_prompt += "3. Rebuild slack components on shadcn primitives. Delete components/slack/ui.tsx after migration.\n";
impl_prompt += "4. Update globals.css: keep shadcn tokens; add only layout classes (.chat-shell, sidebar, etc.).\n";
impl_prompt += "5. Update metadata title/description to the workspace chat. Providers: TooltipProvider + Toaster.\n";
impl_prompt += "6. Do not invent a backend, auth, huddles, Slack Connect, or billing.\n";
impl_prompt += "7. Verify with tsc. Fix Dialog/Dropdown/Popover controlled open state — they must actually toggle.\n\n";
impl_prompt += "Return {ok, summary, files, notes} listing implemented features and remaining known gaps.\n";

let implement = agent(impl_prompt, #{
    label: "implement-mvp",
    capability_mode: "all",
    output_schema: status_schema,
});

let implement_ok = false;
if implement != () && implement.success && implement.output != () && implement.output.ok == true {
    implement_ok = true;
}
if !implement_ok {
    log("Implementer reported failure or incomplete output; continuing to verification");
}

// ---------------------------------------------------------------------------
phase("Verify");
log("Adversarial verification of logic, shadcn usage, and Slack UX");

let v1 = "";
v1 += "Adversarially review the Slack clone at " + root + " for MISSING OR BROKEN Slack core business logic.\n";
v1 += "Use read_file and grep. Do not answer from memory. Read workspace-provider, data.ts, and UI that dispatches actions.\n";
v1 += "Check: send/edit/delete, threads, reactions, mentions, unread, search jump, create/leave/invite channel, ";
v1 += "star, saved, pins, drafts, presence/status, activity view, threads view, composer Enter/Shift+Enter, Escape.\n";
v1 += "A finding is only valid if a user-visible action is missing or the reducer does not implement it.\n";
v1 += "Empty findings is valid ONLY after inspecting the reducer and the components that should call it.\n";
v1 += "Report at most 10 {file, issue}.\n";

let v2 = "";
v2 += "Adversarially review " + root + " for shadcn/ui compliance.\n";
v2 += "Use read_file and grep. Confirm components.json exists and components/ui has real shadcn primitives.\n";
v2 += "HARD RULES: product UI must import from @/components/ui/* (or components/ui). ";
v2 += "components/slack/ui.tsx must be gone or unused. Theme must start from shadcn default light tokens ";
v2 += "(neutral CSS variables). html must not force class dark. --primary must not be wholesale replaced ";
v2 += "with Slack aubergine; Slack purple is allowed only on sidebar/top-bar layout chrome.\n";
v2 += "Flag custom stub primitives, Primer leftover tokens, and dialogs/menus that do not open/close.\n";
v2 += "Empty findings is valid ONLY after grepping for slack/ui and reading layout + globals + a few slack components.\n";
v2 += "Report at most 10 {file, issue}.\n";

let v3 = "";
v3 += "Adversarially review " + root + " for authentic Slack UX vs Refero Slack web patterns.\n";
v3 += "Use read_file on workspace-shell, sidebar, top-bar, conversation-header, message-item, composer, thread-pane, globals.css.\n";
v3 += "Expect: aubergine sidebar, white main, purple top bar with centered search, unread bold + red badges, ";
v3 += "channel header with members, message hover toolbar, right thread pane, composer at bottom, ";
v3 += "create-channel dialog, channel details members tab, mobile overlay sidebar.\n";
v3 += "Do not demand pixel-perfect Slack copyrighted assets. Demand the layout language and working interactions.\n";
v3 += "Empty findings is valid ONLY after reading those files.\n";
v3 += "Report at most 10 {file, issue}.\n";

let verify_results = parallel([
    #{ prompt: v1, label: "verify-logic", capability_mode: "read-only", output_schema: findings_schema },
    #{ prompt: v2, label: "verify-shadcn", capability_mode: "read-only", output_schema: findings_schema },
    #{ prompt: v3, label: "verify-slack-ux", capability_mode: "read-only", output_schema: findings_schema },
]);

let findings = [];
for r in verify_results {
    if r != () && r.success && r.output != () && r.output.findings != () {
        for f in r.output.findings {
            findings.push(f);
        }
    }
}
log(findings.len().to_string() + " raw verification findings");

let confirmed = [];
if findings.len() > 0 {
    let max_check = 8;
    if findings.len() < max_check {
        max_check = findings.len();
    }
    if findings.len() > max_check {
        log("Truncating verification to first " + max_check.to_string() + " findings");
    }
    let vjobs = [];
    let vi = 0;
    for f in findings {
        if vi < max_check {
            let fp = "";
            fp += "Adversarially verify this finding by reading the shipped code at " + root + ". ";
            fp += "Claim: \"" + f.issue + "\" in " + f.file + ". ";
            fp += "Set real=true only with concrete evidence you independently inspected. Otherwise real=false. ";
            fp += "evidence must quote file/behavior. reason is one sentence.\n";
            vjobs.push(#{
                prompt: fp,
                label: "skeptic-" + vi.to_string(),
                capability_mode: "read-only",
                output_schema: verdict_schema,
            });
        }
        vi += 1;
    }
    let verdicts = parallel(vjobs);
    let i = 0;
    for v in verdicts {
        if v != () && v.success && v.output != () && v.output.real == true {
            let ev = trimmed(v.output.evidence);
            if ev != "" {
                confirmed.push(findings[i]);
            }
        }
        i += 1;
    }
}
log(confirmed.len().to_string() + " findings survived skepticism");

// ---------------------------------------------------------------------------
phase("Fix");
if confirmed.len() > 0 {
    log("Fixing confirmed gaps");
    let confirmed_json = json_encode(confirmed);
    let fix_prompt = "";
    fix_prompt += "Workspace: " + root + "\n";
    fix_prompt += "Fix these confirmed issues. Read the files first. Keep shadcn/ui default theme and Slack core logic.\n";
    fix_prompt += "Do not reintroduce components/slack/ui.tsx. Do not force dark mode. Do not restyle --primary to aubergine.\n";
    fix_prompt += "CONFIRMED ISSUES JSON:\n";
    fix_prompt += confirmed_json + "\n";
    fix_prompt += "Address every item. Then run pnpm exec tsc --noEmit and fix type errors you introduced.\n";
    fix_prompt += "Return {ok, summary, files, notes}.\n";
    let fix = agent(fix_prompt, #{
        label: "fix-confirmed",
        capability_mode: "all",
        output_schema: status_schema,
    });
    if fix != () && fix.success && fix.output != () && fix.output.ok == true {
        log("Fix pass reported ok");
    } else {
        log("Fix pass incomplete");
    }
} else {
    log("No confirmed findings to fix");
}

// ---------------------------------------------------------------------------
phase("Ship");
log("Typecheck, build, and write the run report");

let ship_prompt = "";
ship_prompt += "Workspace: " + root + "\n";
ship_prompt += "Ship-check the Slack clone MVP.\n";
ship_prompt += "1. Run pnpm exec tsc --noEmit (install deps if needed).\n";
ship_prompt += "2. Run pnpm build.\n";
ship_prompt += "3. Grep to confirm components/slack/ui.tsx is gone or unused, components/ui exists, ";
ship_prompt += "and workspace-provider implements send plus at least edit or delete, threads, reactions, search.\n";
ship_prompt += "4. Summarize remaining limitations (client-only, no realtime, no huddles).\n";
ship_prompt += "Return {ok: true only if tsc and build succeeded, summary, files, notes}.\n";

let ship = agent(ship_prompt, #{
    label: "ship-check",
    capability_mode: "all",
    output_schema: status_schema,
});

let ship_ok = false;
let ship_summary = "Ship check did not complete";
let ship_notes = "";
if ship != () && ship.success && ship.output != () {
    if ship.output.ok == true { ship_ok = true; }
    if ship.output.summary != () { ship_summary = ship.output.summary; }
    if ship.output.notes != () { ship_notes = ship.output.notes; }
}

let report = "";
report += "# Slack clone MVP workflow\n\n";
report += "Workspace: " + root + "\n\n";
report += "## Constraints\n";
report += "- shadcn/ui primitives, default (neutral, light) theme as the component system\n";
report += "- Slack chrome from Refero (aubergine sidebar, white main, centered search, threads, members)\n";
report += "- Slack core business logic in a client-side MVP\n\n";
report += "## Audit\n";
report += audit_json + "\n\n";
report += "## Ship\n";
report += "ok: " + ship_ok.to_string() + "\n";
report += ship_summary + "\n";
report += ship_notes + "\n\n";
report += "## Confirmed issues after verify\n";
report += json_encode(confirmed) + "\n";

let report_path = write_scratch_file("report.md", report);
complete(#{
    path: report_path,
    ok: ship_ok,
    confirmed_issues: confirmed.len(),
    summary: ship_summary,
});
