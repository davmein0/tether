import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Without this, a render error blanks the page — a bad failure mode for an app
 * someone may be opening in a difficult moment.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="max-w-[680px] mx-auto px-4 py-16 flex flex-col gap-4">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-amber-700">
          Something broke
        </p>
        <h1 className="text-3xl font-bold text-stone-900 leading-snug [font-family:var(--font-serif)]">
          Tether hit an unexpected error.
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          Reloading usually fixes it. If you need support right now, reach out to
          your partner directly or contact a professional service.
        </p>
        <div>
          <button
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors border-0"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }
}
