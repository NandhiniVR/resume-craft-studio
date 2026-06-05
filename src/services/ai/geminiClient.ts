import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Executes a prompt against Google Gemini 2.5 Flash.
 * Automatically switches to mock responses if the VITE_GEMINI_API_KEY is not defined.
 * 
 * @param prompt Input user prompt
 * @param systemInstruction Directives or structural guidelines for the AI model
 * @param isJson Whether the model output should be parsed as JSON
 * @returns The response text or JSON string
 */
export async function queryGemini(
  prompt: string,
  systemInstruction?: string,
  isJson: boolean = true
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'dummy-api-key') {
    console.warn(
      'VITE_GEMINI_API_KEY is not configured. Falling back to simulated response mock.'
    );
    throw new Error('NO_API_KEY');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const fullPrompt = systemInstruction
      ? `System Directive:\n${systemInstruction}\n\nUser Prompt:\n${prompt}`
      : prompt;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: isJson ? 'application/json' : 'text/plain',
        temperature: 0.2,
      },
    });

    const text = result.response.text();
    if (!text) {
      throw new Error('Received empty response from Gemini');
    }
    return text;
  } catch (error) {
    console.error('Gemini query execution failed:', error);
    throw error;
  }
}
