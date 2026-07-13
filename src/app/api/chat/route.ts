import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { prompt, content, use_rag, thinking_mode } = await req.json();
  const userPrompt = prompt ?? content ?? "Hello";

  const mockReply = `Here's what I know about "${userPrompt}": SmartHub uses SSE streaming so the AI response appears token by token, just like this. When your FastAPI backend is connected, this text will come from a real LLM like Ollama or GPT-4.`;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const words = mockReply.split(' ');
      let i = 0;

      const interval = setInterval(() => {
        if (i >= words.length) {
          controller.enqueue(encoder.encode('event: done\n\n'));
          controller.close();
          clearInterval(interval);
          return;
        }

        const chunk = `data: ${JSON.stringify({ delta: words[i] + ' ' })}\n\n`;
        controller.enqueue(encoder.encode(chunk));
        i += 1;
      }, 40);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
