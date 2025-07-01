// functions/src/lib/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateContentWithOpenAI = async ({
  system,
  user,
}: {
  system: string;
  user: string;
}): Promise<string> => {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });

  return res.choices[0]?.message.content ?? "";
};
