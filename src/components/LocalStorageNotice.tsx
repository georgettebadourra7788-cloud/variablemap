export function LocalStorageNotice() {
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50 p-4 text-sm text-navy-900">
      <p className="font-semibold">Your research stays on your device.</p>
      <p className="mt-1 text-navy-800">
        Projects save automatically to this browser’s local storage and are not uploaded to a VariableMap server. Clearing browser data,
        private browsing, or changing device or browser may make them unavailable — export important work (CSV or backup file) regularly.
      </p>
    </div>
  );
}
