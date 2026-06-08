const OpenAI = require('openai');
const logger = require('./loggerService');

const useOpenRouter = !!process.env.OPENROUTER_API_KEY;

const openai = new OpenAI({
  apiKey: useOpenRouter ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY,
  baseURL: useOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
});

const MODEL = useOpenRouter ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo';

const SYSTEM_PROMPTS = {
  summarize: `You are an AI assistant for a team collaboration platform. Summarize the following chat messages concisely.
Format your response as JSON with these fields:
- summary: A 2-3 sentence overview
- keyPoints: Array of 3-5 bullet points
- tasks: Array of action items mentioned
- decisions: Array of decisions made

Respond ONLY with valid JSON.`,

  actionItems: `Extract all action items, tasks, and to-dos from the following chat messages.
Format your response as JSON:
- tasks: Array of { task, assignee (if mentioned), deadline (if mentioned) }

Respond ONLY with valid JSON.`,

  ask: `You are a helpful AI assistant embedded in a team collaboration platform.
Answer the user's question based on the chat history provided.
Be concise and specific. If the answer isn't in the chat history, say so.`,

  generateEmbedding: null,
};

async function summarizeMessages(messages) {
  try {
    const text = messages
      .map((m) => {
        const sender = m.sender?.name || m.sender?.email || 'Unknown';
        const content = m.text || (m.messageType === 'file' ? `[File: ${m.fileName}]` : '');
        return `${sender}: ${content}`;
      })
      .join('\n');

    if (!text.trim()) {
      return {
        summary: 'No messages to summarize.',
        keyPoints: [],
        tasks: [],
        decisions: [],
      };
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.summarize },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content.trim();
    try {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || '',
        keyPoints: parsed.keyPoints || [],
        tasks: parsed.tasks || [],
        decisions: parsed.decisions || [],
      };
    } catch {
      return {
        summary: content,
        keyPoints: [],
        tasks: [],
        decisions: [],
      };
    }
  } catch (error) {
    logger.error(`AI summarize error: ${error.message}`);
    throw new Error('AI summarization failed');
  }
}

async function askAI(question, context) {
  try {
    let contextText = '';

    if (context.workspace) {
      const ws = context.workspace;
      contextText += `WORKSPACE: "${ws.name}"\n`;
      contextText += `MEMBERS (${ws.totalMembers}): ${ws.members.join(', ')}\n`;
      contextText += `CHANNELS (${ws.totalChannels}): ${ws.channelNames.join(', ')}\n\n`;
    }

    if (context.messages && context.messages.length > 0) {
      contextText += 'RECENT MESSAGES:\n';
      contextText += context.messages
        .map((m) => {
          const sender = m.sender?.name || m.sender?.email || 'Unknown';
          const time = new Date(m.createdAt).toLocaleString();
          const content = m.text || (m.messageType === 'file' ? `[File: ${m.fileName}]` : '');
          return `[${time}] ${sender}: ${content}`;
        })
        .join('\n');
    } else {
      contextText += '(No recent messages)';
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.ask },
        { role: 'user', content: `Workspace Context:\n${contextText}\n\nQuestion: ${question}` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.error(`AI ask error: ${error.message}`);
    throw new Error('AI query failed');
  }
}

async function generateActionItems(messages) {
  try {
    const text = messages
      .map((m) => {
        const sender = m.sender?.name || m.sender?.email || 'Unknown';
        const content = m.text || '';
        return `${sender}: ${content}`;
      })
      .join('\n');

    if (!text.trim()) {
      return { tasks: [] };
    }

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.actionItems },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    try {
      const parsed = JSON.parse(content);
      return { tasks: parsed.tasks || [] };
    } catch {
      return { tasks: [] };
    }
  } catch (error) {
    logger.error(`AI action items error: ${error.message}`);
    throw new Error('AI action items failed');
  }
}

async function generateEmbedding(text) {
  if (useOpenRouter) {
    logger.warn('Embeddings not supported with OpenRouter, skipping semantic search');
    throw new Error('Embeddings require an OpenAI API key');
  }
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.error(`AI embedding error: ${error.message}`);
    throw new Error('Embedding generation failed');
  }
}

module.exports = {
  summarizeMessages,
  askAI,
  generateActionItems,
  generateEmbedding,
};
