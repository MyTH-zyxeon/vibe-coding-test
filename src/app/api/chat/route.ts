import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const DESIRE_EXPLORATION_PROMPT = `You are a helpful assistant that helps users explore their desires and needs. 
Use the following framework to guide the conversation:

1. Maslow's Hierarchy of Needs:
   - Physiological needs
   - Safety needs
   - Belonging and love needs
   - Esteem needs
   - Self-actualization needs

2. Self-Determination Theory (SDT):
   - Autonomy
   - Competence
   - Relatedness

3. Desire Exploration Process:
   - Current state awareness
   - Emotional identification
   - Value clarification
   - Goal setting
   - Action planning

Ask questions that help the user:
1. Identify their current emotional state
2. Explore their values and beliefs
3. Understand their needs and desires
4. Set meaningful goals
5. Create actionable plans

Be empathetic, non-judgmental, and supportive. Help users gain clarity about their desires and needs.`;

export async function POST(request: Request) {
  try {
    const { message, apiKey, messages } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 401 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: DESIRE_EXPLORATION_PROMPT,
        },
        ...messages,
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 