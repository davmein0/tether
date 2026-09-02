# Journal

The journal is a shared reflection space for a relationship. Both people write their own entries — text, an image, or both — read each other's, and comment on them.

Rendered by `pages/Journal.tsx`, with `components/JournalEntry.tsx` (composer), `components/JournalList.tsx` (feed), and `components/JournalComments.tsx` (thread):

```tsx
<JournalPage relationshipId={relationship.id} userId={firebaseUser.uid} />
```

Tabs switch between your own entries and your partner's. The comment form appears on your partner's entries; on your own you see their comments read-only. Everything updates live through `onSnapshot`.

## Data

```typescript
interface JournalEntry {
  relationshipId: string;  // the pair this entry belongs to
  userId: string;          // author
  text: string;
  imageUrl?: string;       // Firebase Storage download URL
  createdAt: Timestamp;
}

// journalEntries/{entryId}/comments/{commentId}
interface JournalComment {
  entryId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt: Timestamp;
}
```

Images upload to `journal/{relationshipId}/{userId}/{timestamp}_{filename}`.

## Access

Authorization lives in `firestore.rules` and `storage.rules` at the repo root — those files are the source of truth, and `npm run test:rules` covers this collection. In short:

- Only the two accounts on the relationship can read the entries or comments; membership is read from the relationship document, not from anything the client sends.
- Entries are writable only by their author, and an entry cannot be moved to another relationship.
- Comments require current membership to post, edit, or delete; `authorId` is immutable, so a comment cannot be reattributed.
- Storage writes are limited to the uploader's own path, to `image/*` content, and to 10 MB. The composer additionally rejects non-images and files over 5 MB client-side, so the rule is the outer bound rather than the message the user normally sees.

## Setup

Enable Storage on the Firebase project, pick a bucket location, then deploy the committed rules — **not** the console's test mode:

```bash
firebase deploy --only firestore:rules,storage
```

`VITE_FIREBASE_STORAGE_BUCKET` must be set in `.env.local` for uploads to resolve.
