// functions/src/lib/openai.ts
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateContentWithOpenAI = async ({
  system,
  user,
}: {
  system: string;
  user: string;
}): Promise<string> => {
  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });

  return res.data.choices[0]?.message?.content ?? "";
};
