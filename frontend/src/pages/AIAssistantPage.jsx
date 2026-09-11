import { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService.js';
import { getErrorMessage } from '../services/api.js';
import ChatMessage from '../components/ai/ChatMessage.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

const SUGGESTED_QUESTIONS = [
  'Show low stock items',
  "What's our total inventory value?",
  'Show inventory in Warehouse A',
  'Which products are out of stock?',
  'Show recent stock movements',
  'Which category has the highest inventory value?',
  'What products were added this week?',
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm the NLC Inventory Assistant. Ask me about stock levels, product availability, categories, suppliers or recent transactions - I'll look up real inventory data for you.",
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    const history = messages
      .filter((m) => !m.error)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(message, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply, toolsUsed: res.toolsUsed }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: getErrorMessage(err), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  const clearConversation = () => setMessages([WELCOME_MESSAGE]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <Card className="hidden w-64 shrink-0 lg:block" title="Suggested Questions">
        <div className="space-y-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">NLC Inventory Assistant</h3>
            <p className="text-xs text-slate-400">Powered by Claude - read-only, tool-based inventory queries</p>
          </div>
          <Button variant="ghost" size="sm" onClick={clearConversation}>
            Clear Conversation
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} {...m} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white">🤖</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 p-4">
          <input
            className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Ask about stock levels, categories, suppliers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" loading={loading} disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
