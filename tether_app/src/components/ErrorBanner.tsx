type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      className="flex items-start justify-between gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm"
      role="alert"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          className="shrink-0 text-red-900 underline underline-offset-2 font-medium bg-transparent border-0 p-0 cursor-pointer"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  );
}
