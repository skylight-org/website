interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg px-6 py-4 text-red-200">
        <p className="font-semibold mb-1">Error</p>
        <p className="text-sm text-red-300">{message}</p>
      </div>
    </div>
  );
}

