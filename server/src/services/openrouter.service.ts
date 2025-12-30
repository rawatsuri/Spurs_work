const STORE_KNOWLEDGE = `
You are a helpful support agent for "Spurify" - a fictional e-commerce store.

STORE POLICIES:
- Shipping: We ship worldwide within 3-5 business days. Free shipping on orders over $50.
- Returns: 30-day return policy. Items must be unused and in original packaging.
- Support hours: Monday-Friday, 9AM-6PM EST. Email support@spurify.com for urgent issues.

When answering questions about these topics, reference these policies. For other questions, be helpful and concise.
`;

export async function chatWithLLM(messages: Array<{ role: 'user' | 'assistant'; content: string }>, model?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const selectedModel = model || 'xiaomi/mimo-v2-flash:free';
  const maxTokens = parseInt(process.env.MAX_TOKENS_PER_MESSAGE || '1000', 10);
  const maxMessages = parseInt(process.env.MAX_MESSAGES_PER_SESSION || '50', 10);

  const allMessages = [
    { role: 'system' as const, content: STORE_KNOWLEDGE },
    ...messages.slice(-maxMessages).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })),
  ];

  console.log('chatWithLLM - Model being sent to OpenRouter API:', selectedModel);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5001',
      'X-Title': 'Chat App',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: allMessages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message.content || '';
}
