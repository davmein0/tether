# Firebase Setup Guide for Image & Text Upload

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
    // Allow users to read/write journalEntries for their own relationships
    match /journalEntries/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }

    // Existing rules for other collections...
    match /messages/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.senderId == request.auth.uid;
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

## 4. **Usage Example**

```tsx
import JournalEntry from "../components/JournalEntry";
import JournalList from "../components/JournalList";

export default function JournalPage({ relationshipId, userId }: Props) {
  return (
    <div>
      <JournalEntry
        relationshipId={relationshipId}
        userId={userId}
        onEntryCreated={() => console.log("Entry created!")}
      />
      <JournalList relationshipId={relationshipId} />
    </div>
  );
}
```

## 5. **Validation & Limits**

The component includes:

- **Image types**: Only image files (jpg, png, gif, webp, etc.)
- **File size**: Max 5MB per image
- **Required fields**: At least text OR image must be provided
- **Storage path**: `journal/{relationshipId}/{userId}/{timestamp}_{filename}`

## 6. **Environment Variables**

Your `.env.local` already has `VITE_FIREBASE_STORAGE_BUCKET`, which is needed for Storage to work.

## 7. **Error Handling**

- Invalid file types are rejected with alert
- Oversized files are rejected with alert
- Failed uploads show error message
- Form is disabled during upload to prevent double-submissions
