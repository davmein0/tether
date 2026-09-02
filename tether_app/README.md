# Tether

Tether pairs someone working on a hard personal goal (a **doer**) with one person who supports them (a **supporter**). The pair share a private space with goals, a timeline of what happened, a journal the supporter can comment on, weekly reviews, and a "struggle" button that sends a high-priority signal plus a guided routine in the moment it is needed.

Single-page React app talking directly to Firebase — there is no backend server of our own.

## Stack

- React 19 + TypeScript, built with Vite 8 (React Compiler enabled)
- Tailwind CSS 4
- Firebase: Auth (Google sign-in), Firestore, Storage
- Vitest for unit tests

## Prerequisites

- Node.js `^20.19.0 || >=22.12.0` (Vite 8 engine requirement)
- A Firebase project with Google sign-in enabled and Firestore in native mode

## Getting started

```bash
cd tether_app
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm run dev
```

`src/services/firebase.ts` throws at startup if any `VITE_FIREBASE_*` variable is missing, so an incomplete `.env.local` fails loudly rather than at the first query. These values are public client config — access control has to come from Firestore security rules.

Other scripts:

```bash
npm run build       # tsc -b && vite build
npm run preview     # serve the production build
npm run lint        # eslint
npm run test        # vitest unit tests
npm run test:rules  # security-rules tests against the Firestore emulator (needs a JDK 21+)
```

## How it fits together

`src/App.tsx` owns auth state, hash-based routing, and the shared layout. Sign-in goes through `src/auth.ts`; on first sign-in the user picks a role, which is written to `users/{uid}`.

Two users become a pair via `src/services/relationships.ts`: the first user creates an invite code, the second enters it, and both then read and write the same `relationshipId`. Every document below hangs off that `relationshipId`.

Pages render per role — `pages/DoerDashboard.tsx` and `pages/SupporterDashboard.tsx` — over the shared data in `hooks/` (`useGoals`, `useTimelineEntries`, `useLatestStruggle`), which subscribe to Firestore with `onSnapshot`.

### Firestore collections

| Collection | Contents |
| --- | --- |
| `users/{uid}` | Display name, email, photo, and `role` (`doer` or `supporter`) |
| `relationships` | The pair: `doerId`, `supporterId`, `status` (`pending` / `active`) |
| `invites` | One-time invite codes; the document id *is* the code, and it expires after 7 days |
| `goals` | Goals owned by a relationship, with progress and target dates |
| `timelineEntries` | Timeline events (`goal`, `reachout`, `meeting`, `metric`) |
| `events` | Struggle-button signals, including the selected mood |
| `messages` | Messages between the pair |
| `journalEntries` | Doer journal entries; comments live in the `comments` subcollection |
| `goalReviews` | Weekly reviews tied to a goal |
| `customStrategies` | Strategies the pair added to the struggle routine |

### Security rules and indexes

Rules and indexes live at the repository root and are the only thing protecting this data — the Firebase web config in `.env.local` is public.

| File | Purpose |
| --- | --- |
| `firestore.rules` | Every relationship-scoped collection is readable and writable only by the two accounts on that relationship |
| `storage.rules` | Journal images, scoped the same way |
| `firestore.indexes.json` | The composite indexes the app's queries need |

Deploy them with:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

An invite code is the invite document's id, so the rules can allow a direct `get` by code (knowing the code is the point) while refusing to list the collection — codes cannot be enumerated.

`npm run test:rules` boots the Firestore emulator and asserts the rules from the perspective of a doer, a supporter, and a stranger; it needs no Firebase project or credentials.

### Feature docs

- [`docs/journal.md`](../docs/journal.md) — journal entries, image uploads, comments
- [`docs/reviews.md`](../docs/reviews.md) — goal reviews, custom strategies, progress analytics

## Deployment

`npm run build` emits a static bundle to `dist/`, deployable to Firebase Hosting or any static host. The `VITE_FIREBASE_*` variables must be present at build time, since Vite inlines them into the bundle.
