const Anthropic = require('@anthropic-ai/sdk');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const toolDefinitions = require('../ai/toolDefinitions');
const inventoryTools = require('../ai/inventoryTools');

const MAX_TOOL_ROUNDS = 5;
const REQUEST_TIMEOUT_MS = 20000;

const SYSTEM_PROMPT = `You are the NLC Inventory Assistant, a helpful internal tool embedded in the NLC Inventory Management System.

You answer questions about products, stock levels, categories, suppliers, locations and stock transactions by calling the read-only tools provided to you. Never guess numbers - always call a tool to get real data before answering.

Rules you must always follow:
- You can ONLY read inventory data through the provided tools. You have no ability to create, update, delete, or modify anything, and no access to users, passwords, authentication tokens or system configuration.
- If the user asks you to delete, modify, add stock, remove stock, or perform any write/destructive action, politely refuse and explain that the assistant is read-only - such actions must be performed through the Inventory, Stock In/Out or Adjustment screens by an authorized user.
- If the user asks about anything outside inventory (system internals, other users' credentials, unrelated topics), politely decline and redirect to inventory-related questions.
- Keep answers concise, concrete, and formatted with numbers/units. Prefer short bullet points or a small summary over long prose when listing multiple products.
- If a tool returns no results, say so plainly rather than inventing data.`;

let client = null;
function getClient() {
  if (!env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: REQUEST_TIMEOUT_MS });
  return client;
}

async function executeTool(name, input) {
  const fn = inventoryTools[name];
  if (!fn) {
    return { error: `Unknown tool '${name}'` };
  }
  try {
    return await fn(input || {});
  } catch (err) {
    return { error: `Tool '${name}' failed: ${err.message}` };
  }
}

/**
 * Runs the tool-use conversation loop with Claude and returns the final
 * natural-language answer plus a trace of which tools were used (for UI transparency).
 */
async function chatWithAssistant(userMessage, history = []) {
  const anthropic = getClient();
  if (!anthropic) {
    throw ApiError.internal(
      'AI assistant is not configured. Set ANTHROPIC_API_KEY in the backend environment.'
    );
  }

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const toolsUsed = [];

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const response = await anthropic.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions,
        messages,
      });

      const toolUseBlocks = response.content.filter((block) => block.type === 'tool_use');

      if (toolUseBlocks.length === 0) {
        const text = response.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n')
          .trim();
        return { reply: text || "I couldn't generate a response for that.", toolsUsed };
      }

      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of toolUseBlocks) {
        toolsUsed.push({ tool: block.name, input: block.input });
        const result = await executeTool(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    return {
      reply: "I gathered some data but couldn't finalize an answer in time. Please try rephrasing your question.",
      toolsUsed,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err?.status === 401) {
      throw ApiError.internal('AI assistant authentication failed. Check the ANTHROPIC_API_KEY value.');
    }
    if (err?.status === 429) {
      throw new ApiError(429, 'AI assistant is rate-limited right now. Please try again shortly.');
    }
    if (err?.name === 'APIConnectionTimeoutError' || err?.code === 'ETIMEDOUT') {
      throw new ApiError(504, 'AI assistant timed out. Please try again.');
    }
    if (err?.status >= 400 && err?.status < 500) {
      throw ApiError.badRequest(`AI assistant rejected the request: ${err.message}`);
    }
    throw ApiError.internal('AI assistant is temporarily unavailable. Please try again later.');
  }
}

module.exports = { chatWithAssistant };
