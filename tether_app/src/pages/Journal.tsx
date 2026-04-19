import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import JournalEntry from "../components/JournalEntry";
import JournalList from "../components/JournalList";
import type { Relationship } from "../types";

type Props = {
  relationshipId: string;
  userId: string;
};

type ViewMode = "mine" | "theirs";

export default function JournalPage({ relationshipId, userId }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("mine");
  const [peerUserId, setPeerUserId] = useState<string | null>(null);
  const [peerLabel, setPeerLabel] = useState<string>("Them");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelationship = async () => {
      try {
        const relationshipRef = doc(db, "relationships", relationshipId);
        const relationshipSnap = await getDoc(relationshipRef);

        if (!relationshipSnap.exists()) {
          setIsLoading(false);
          return;
        }

        const data = relationshipSnap.data() as Relationship;
        const otherUserId =
          data.doerId === userId ? data.supporterId : data.doerId;
        const label = data.doerId === userId ? "Mentor" : "Mentee";

        setPeerUserId(otherUserId);
        setPeerLabel(label);
      } catch (error) {
        console.error("Error fetching relationship:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelationship();
  }, [relationshipId, userId]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-8">
        <p className="text-stone-500">Loading...</p>
      </section>
    );
  }

  if (!peerUserId) {
    return (
      <section className="flex flex-col gap-8">
        <p className="text-stone-500">Unable to load shared journal.</p>
      </section>
    );
  }

  const tabButtonClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-full transition-colors ${
      isActive
        ? "bg-stone-900 text-white"
        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
    }`;

  return (
    <section className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Reflection</p>
        <h2 className="text-3xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
          Shared journal
        </h2>
        <p className="text-stone-600 mt-2">
          {viewMode === "mine"
            ? "Write and review your own entries"
            : `View ${peerLabel}'s reflections and growth`}
        </p>
      </div>

      <div className="flex gap-2 border-b border-stone-200">
        <button
          className={tabButtonClass(viewMode === "mine")}
          onClick={() => setViewMode("mine")}
          type="button"
        >
          My entries
        </button>
        <button
          className={tabButtonClass(viewMode === "theirs")}
          onClick={() => setViewMode("theirs")}
          type="button"
        >
          {peerLabel}'s entries
        </button>
      </div>

      {viewMode === "mine" ? (
        <div className="grid grid-cols-[1fr_minmax(300px,1fr)] gap-6 max-lg:grid-cols-1">
          <div>
            <JournalEntry
              relationshipId={relationshipId}
              userId={userId}
              onEntryCreated={() => {}}
            />
          </div>

          <aside>
            <div className="sticky top-8">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-4">
                  Your entries
                </h3>
              </div>
              <JournalList
                relationshipId={relationshipId}
                userId={userId}
                currentUserId={userId}
                peerLabel={peerLabel}
              />
            </div>
          </aside>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-4">
              {peerLabel}'s entries
            </h3>
          </div>
          <JournalList
            relationshipId={relationshipId}
            userId={peerUserId}
            currentUserId={userId}
            peerLabel={peerLabel}
          />
        </div>
      )}
    </section>
  );
}
