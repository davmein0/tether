import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../services/firebase";
import { storage } from "../services/firebase";
import type { JournalEntry as JournalEntryType } from "../types";
import "./JournalEntry.css";

type Props = {
  relationshipId: string;
  userId: string;
  onEntryCreated?: () => void;
};

export default function JournalEntry({
  relationshipId,
  userId,
  onEntryCreated,
}: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitEntry = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !image) {
      alert("Please add text or an image");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | undefined;

      // Upload image to Firebase Storage if provided
      if (image) {
        const storageRef = ref(
          storage,
          `journal/${relationshipId}/${userId}/${Date.now()}_${image.name}`
        );
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Create journal entry in Firestore
      const entry: Omit<JournalEntryType, "createdAt"> & {
        createdAt?: unknown;
      } = {
        relationshipId,
        userId,
        text: trimmedText,
        ...(imageUrl && { imageUrl }),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "journalEntries"), entry);

      // Reset form
      setText("");
      clearImage();
      onEntryCreated?.();
    } catch (error) {
      console.error("Error creating journal entry:", error);
      alert("Failed to create entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="journal-entry">
      <div className="journal-input-section">
        <label htmlFor="journal-text" className="journal-label">
          What's on your mind?
        </label>
        <textarea
          id="journal-text"
          className="journal-textarea"
          placeholder="Write your thoughts, reflections, or progress..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {preview && (
        <div className="journal-image-preview">
          <img src={preview} alt="Preview" />
          <button
            className="journal-remove-image"
            onClick={clearImage}
            type="button"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
      )}

      <div className="journal-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={isLoading}
          className="journal-file-input"
          aria-label="Upload image"
        />
        <button
          className="journal-button journal-button-secondary"
          onClick={() => fileInputRef.current?.click()}
          type="button"
          disabled={isLoading || !!preview}
        >
          📷 Add image
        </button>
        <button
          className="journal-button journal-button-primary"
          onClick={submitEntry}
          type="button"
          disabled={isLoading || (!text.trim() && !image)}
        >
          {isLoading ? "Saving..." : "Save entry"}
        </button>
      </div>
    </div>
  );
}