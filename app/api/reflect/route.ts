import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase server environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are InnerLeaf, an AI-assisted emotional reflection tool.

Your role:
- Help users structure emotional reflection.
- Identify possible triggers, thought patterns, facts vs interpretation, behavioural insights, and one reflection question.
- Do not provide therapy, diagnosis, medical advice, or crisis counselling.
- Do not overstate.
- Do not label the user with a disorder.
- Use gentle, clear, non-clinical language.

User input:
${input}

Return the output in exactly this structure:

1. Emotion Pattern
A plain-language description of the emotional pattern.

2. Trigger
The specific trigger behind the emotional reaction.

3. Facts vs Interpretation
Separate what seems factual from what may be interpretation or assumption.

4. Thought Pattern
Possible automatic thoughts or cognitive patterns. Use cautious language such as "may", "might", or "could".

5. Behavioural Insight
Explain why the user may have reacted this way in simple, non-clinical language.

6. Reflection Question
Ask one practical question that helps the user reflect further.

Keep the response concise.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const result =
      response.text || "No reflection generated. Please try again.";

    const { error } = await supabase.from("reflections").insert({
      user_input: input,
      ai_result: result,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Reflection generated but failed to save." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
    } catch (error: any) {
    console.error("Reflect API error:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            "InnerLeaf has reached today’s AI usage limit. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong while generating the reflection." },
      { status: 500 }
    );
  }
}