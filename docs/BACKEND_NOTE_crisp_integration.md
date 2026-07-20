# Backend Note — Laravel proxy for Crisp (replaces custom live_chat_sessions)

## Context

The mobile admin app's "Live Chat" feature was built against the custom
`live_chat_sessions`/`live_chat_messages`/Pusher system from the earlier
"Live Chat (Pillar 1)" note. Turns out that system has no real customer
traffic — the site's actual live chat is Crisp, already fully live:

- The Crisp widget is embedded on every customer-facing page
  (`okelcor-website/app/layout.tsx` → `components/crisp-chat.tsx`, using
  `crisp-sdk-web`), and has been since it replaced an older AI widget.
- The desktop admin panel already has a full two-way Crisp inbox
  (`okelcor-website/app/admin/chats/page.tsx` +
  `components/admin/chats-inbox.tsx`) — list conversations, read threads,
  reply, resolve — via a Next.js API route
  (`okelcor-website/app/api/admin/crisp/route.ts`) that proxies Crisp's
  REST API (`https://api.crisp.chat/v1`) using HTTP Basic Auth with
  `CRISP_IDENTIFIER`/`CRISP_KEY`.

So: no work needed to get real live chat working — it already works, on
the website. What's missing is a way for the **mobile app** to reach it.
Mobile only ever talks to Laravel (`okelcor-api`), never to the Next.js
app directly, and the Crisp Identifier/Key can't ship inside the mobile
app bundle (anyone could extract them from an installed APK and get
direct write access to the Crisp inbox). So this needs a Laravel-side
proxy, mirroring what the Next.js route already does, authenticated the
same way as every other admin endpoint (Sanctum bearer token + your
existing permission middleware).

**Security note, unrelated to the above but found while investigating:**
`okelcor-website/docs/session-handoff.md` has what look like live,
plaintext `CRISP_IDENTIFIER`/`CRISP_KEY`/`NEXT_PUBLIC_CRISP_WEBSITE_ID`
values committed in it (looks like debug output from a past `X-Crisp-Tier`
header issue). Worth rotating those in the Crisp dashboard and scrubbing
from git history regardless of anything else in this note.

## What we're asking for

Four endpoints under `admin/`, mirroring the Next.js route's four actions
exactly (same Crisp API calls underneath, just moved server-side into
Laravel and re-authenticated with Sanctum instead of the `admin_token`
cookie):

| Mobile needs | Mirrors (Next.js) | Crisp API call underneath |
|---|---|---|
| `GET admin/crisp/conversations` | `GET /api/admin/crisp?action=conversations` | list conversations |
| `GET admin/crisp/conversations/{session_id}/messages` | `GET ?action=messages&session_id=` | conversation thread |
| `POST admin/crisp/conversations/{session_id}/reply` `{content}` | `POST {action:"reply"}` | `POST /website/{id}/conversation/{session_id}/message` |
| `POST admin/crisp/conversations/{session_id}/resolve` | `POST {action:"resolve"}` | `PATCH /website/{id}/conversation/{session_id}/state` |

Same permission gate as the rest of the CRM-adjacent endpoints
(`crm.view`/`crm.update`, or whatever you'd use for `quotes.manage`/
`quotes.update` — your call on which fits best) seems right, rather than
inventing a new permission key.

## Two open questions for you

1. **Push notifications for new messages**: is there a Crisp webhook for
   incoming visitor messages? If so, could it hit a Laravel webhook
   receiver that calls the same `ExpoPushService::sendToAdmins()` you
   already built for the old system's `live_chat_request` category? That
   would give near-real-time push without needing Pusher at all — the
   mobile app already has the client-side notification category
   registered and ready, it just needs a real trigger. If no webhook
   exists, mobile will just poll `GET .../conversations` every ~20-30s,
   same interval the website's own `chats-inbox.tsx` already uses.
2. **Agent presence**: the old system had a per-admin `available_for_chat`
   toggle (`PUT admin/presence`). Does Crisp have its own agent
   online/offline concept that should be the source of truth instead, or
   do you want to keep a separate app-side toggle? Whichever way, would
   rather not duplicate a concept Crisp already tracks if it already does.

## What happens on the mobile side once this exists

I'll retire the current `ChatThreadScreen`/`useChatQueueChannel`/
`useChatSessionChannel`/`src/api/chat.ts`/`src/api/presence.ts` (the
custom-system plumbing — none of it has ever had real data flow through
it) and rebuild the same screens against these endpoints instead. The
Today screen's "Live Chat" section and the push category are already
built and just need to point at real data.
