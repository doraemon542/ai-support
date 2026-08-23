import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';

export interface AiReplyResult {
  reply: string;
  confidence: number;
  tags: string[];
}

@Injectable()
export class AiService {
  private client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  private modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  private knowledgeBase = [
    'We offer refunds within 14 days of purchase, no questions asked.',
    'Support hours are 9am-6pm, Sunday to Thursday (Dhaka time).',
    'Orders usually ship within 2-3 business days.',
  ];

  private retrieveContext(query: string): string {
    return this.knowledgeBase.join('\n');
  }

  async generateReply(userMessage: string): Promise<AiReplyResult> {
    const context = this.retrieveContext(userMessage);

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: userMessage,
      config: {
        systemInstruction: `You are a support agent assistant. Use the context below to answer.
Context:
${context}`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['reply', 'confidence', 'tags'],
        },
      },
    });

    const raw = response.text ?? '{}';

    try {
      return JSON.parse(raw);
    } catch {
      return { reply: raw, confidence: 0.3, tags: ['unparsed'] };
    }
  }
}