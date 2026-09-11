export default function ChatMessage({ role, content, toolsUsed, error }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
            isUser ? 'bg-brand-600 text-white' : error ? 'bg-red-100 text-red-600' : 'bg-slate-800 text-white'
          }`}
        >
          {isUser ? '🧑' : '🤖'}
        </div>
        <div>
          <div
            className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
              isUser
                ? 'rounded-tr-sm bg-brand-600 text-white'
                : error
                ? 'rounded-tl-sm border border-red-200 bg-red-50 text-red-700'
                : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'
            }`}
          >
            {content}
          </div>
          {toolsUsed?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {toolsUsed.map((t, i) => (
                <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500" title={JSON.stringify(t.input)}>
                  🔧 {t.tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
