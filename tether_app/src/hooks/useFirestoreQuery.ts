import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import type { Query } from "firebase/firestore";
import type { WithId } from "../types";

export type QueryState<T> = {
  items: WithId<T>[];
  loading: boolean;
  error: Error | null;
};

const LOADING = { items: [], loading: true, error: null };

/**
 * Subscribes to a Firestore query, keeping the document id alongside the data
 * and surfacing listener failures (a missing composite index, or rules that
 * reject the read) so callers can render them instead of only logging.
 */
export function useFirestoreQuery<T>(
  buildQuery: () => Query,
  deps: unknown[],
): QueryState<T> {
  const key = JSON.stringify(deps);
  // The key is stored with the result so a dependency change reads as loading
  // straight away, without clearing state from inside the effect.
  const [state, setState] = useState<QueryState<T> & { key: string }>({
    ...LOADING,
    key,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      buildQuery(),
      (snapshot) => {
        setState({
          items: snapshot.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as WithId<T>,
          ),
          loading: false,
          error: null,
          key,
        });
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setState({ items: [], loading: false, error, key });
      },
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state : LOADING;
}
