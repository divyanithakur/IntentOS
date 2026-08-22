type IntentInputProps = {
  value: string;
  loading: boolean;
  error: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

const examples = [
  "Plan my weekend",
  "Organize my study schedule",
  "Plan a team meeting",
  "Create a travel checklist",
];

export function IntentInput({ value, loading, error, onChange, onSubmit, onClear }: IntentInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="rounded-[1.25rem] border border-[#17221d]/15 bg-[#fffdf8] p-5 shadow-[0_20px_60px_rgba(23,34,29,0.08)] sm:p-8">
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <label className="text-sm font-semibold" htmlFor="intent-input">What are you trying to do?</label>
          <span className="text-xs text-[#8a948e]">Intent input</span>
        </div>
        <textarea
          id="intent-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan a trip to Pune this weekend"
          className="min-h-40 w-full resize-none rounded-lg border border-[#17221d]/15 bg-[#f4f1ea] p-5 text-lg leading-7 outline-none transition-colors placeholder:text-[#9aa29d] focus:border-[#2e7d63] focus:ring-2 focus:ring-[#2e7d63]/15"
          aria-describedby={error ? "intent-error" : "intent-help"}
        />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p id="intent-help" className="text-xs text-[#8a948e]">Press Ctrl + Enter to analyze.</p>
          <div className="flex items-center gap-3">
            {value && <button className="px-2 py-3 text-sm text-[#53605a] transition-colors hover:text-[#17221d]" type="button" onClick={onClear}>Clear</button>}
            <button
              className="rounded-lg bg-[#17221d] px-5 py-3 text-sm font-semibold text-[#fffdf8] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Finding the signal..." : "Understand intent  ->"}
            </button>
          </div>
        </div>
        {error && <p id="intent-error" className="mt-4 text-sm text-[#b64b39]" role="alert">{error}</p>}
      </form>
      <div className="mt-8 border-t border-[#17221d]/10 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a948e]">Try an example</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              className="rounded-full border border-[#17221d]/15 px-3 py-2 text-xs text-[#53605a] transition-colors hover:border-[#2e7d63] hover:text-[#2e7d63]"
              type="button"
              key={example}
              onClick={() => onChange(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
