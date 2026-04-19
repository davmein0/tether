# Firebase Setup Guide for Image & Text Upload & Comments

## 1. **Enable Firebase Storage**

- Go to Firebase Console → Your Project → Storage
- Click "Get Started"
- Choose: `Start in test mode` (or production with rules below)
- Select your Cloud Storage location (usually same as Firestore)

## 2. **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Journal entries - both users in a relationship can read all entries
    // Only the author can create, update, or delete their own entries
    match /journalEntries/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;

      // Comments on journal entries - both users can read/write comments
      match /comments/{commentId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow delete: if request.auth != null &&
                         resource.data.authorId == request.auth.uid;
      }
    }

    // Messages - users can read messages from their relationships
    // Only the sender can create messages
    match /messages/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.senderId == request.auth.uid;
      allow update, delete: if false; // Messages are immutable
    }

    // Relationships - users can read their own relationship
    match /relationships/{relationshipId} {
      allow read: if request.auth != null &&
                     (resource.data.doerId == request.auth.uid ||
                      resource.data.supporterId == request.auth.uid);
    }
  }
}
```

## 3. **Firebase Storage Security Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Journal images - users can only upload their own
    match /journal/{relationshipId}/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. **Shared Journal Features**

The Journal page now allows both mentee and mentor to:

- **Write their own entries** with text and images
- **View their own entries** in a personal timeline
- **View their peer's entries** in a shared space
- **Comment on peer's entries** to provide encouragement and feedback

### Entry Commenting System

Each journal entry supports comments:

- **On peer entries**: Comment form visible to provide feedback
- **On own entries**: View comments from peer (read-only)
- **Real-time updates**: Comments appear instantly
- **Author labeling**: Each comment shows who wrote it ("You" vs peer name)

Tab navigation lets users switch between:

- **My entries** - Write new entries and review your own reflections
- **[Peer]'s entries** - Read your mentor/mentee's entries and leave comments

```tsx
// In your page component:
import JournalPage from "./pages/Journal";

<JournalPage relationshipId={relationship.id} userId={firebaseUser.uid} />;
```

## 5. **Validation & Limits**

The component includes:

- **Image types**: Only image files (jpg, png, gif, webp, etc.)
- **File size**: Max 5MB per image
- **Required fields**: At least text OR image must be provided
- **Storage path**: `journal/{relationshipId}/{userId}/{timestamp}_{filename}`
- **Comments**: Optional text comments (no character limit enforced client-side)

## 6. **Environment Variables**

Your `.env.local` already has `VITE_FIREBASE_STORAGE_BUCKET`, which is needed for Storage to work.

## 7. **Error Handling**

- Invalid file types are rejected with alert
- Oversized files are rejected with alert
- Failed uploads show error message
- Form is disabled during upload to prevent double-submissions
- Failed comment submissions show error alert

## 8. **Full Journal Architecture**

**How it works:**

- Each entry stores the `userId` (author) and `relationshipId` (the mentor-mentee pair)
- Both users can read all entries in their shared relationship
- Users can only write/edit/delete their own entries
- Comments are stored in a subcollection under each entry
- Both users can comment on the other's entries
- The Journal page automatically detects the peer's role (Mentor or Mentee) from the relationship document
- Tabs let each user switch between viewing their own and their peer's entries

**Data Structure:**

```typescript
interface JournalEntry {
  relationshipId: string; // Links to the mentee-mentor pair
  userId: string; // Who wrote this entry
  text: string; // Entry content
  imageUrl?: string; // Optional image from Firebase Storage
  createdAt: Timestamp; // Server timestamp
}

interface JournalComment {
  entryId: string; // Reference to parent entry
  authorId: string; // Who wrote the comment
  authorName?: string; // Display name (optional)
  text: string; // Comment content
  createdAt: Timestamp; // Server timestamp
}
```

**Privacy:**

- Entries are only accessible to the two users in the relationship
- Comments can be posted by either user
- Firestore rules enforce that users can only create entries for themselves
- Users can delete their own comments
- Images are stored with path: `journal/{relationshipId}/{userId}/...` for organization
