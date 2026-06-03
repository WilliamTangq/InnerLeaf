import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const prompt = `
You are an AI reflection assistant for InnerLeaf.

You are not a therapist.
You do not provide diagnosis, therapy, crisis intervention, or medical advice.

Your role is to help users structure emotional reflection by identifying patterns, triggers, possible thought patterns, and practical reflection questions.

User input:
${input}

Return the output in exactly five sections:

1. Emotion Pattern
Identify the likely emotional pattern in plain language.

2. Trigger
Identify the specific trigger behind the emotional reaction.

3. Thought Pattern
Identify possible automatic thoughts or cognitive patterns, such as overthinking, personalisation, catastrophising, comparison, avoidance, perfectionism, or fear of rejection. Do not overstate.

4. Behavioural Insight
Explain why the user may have reacted this way, using clear and non-clinical language.

5. Reflection Question
Ask one practical question that helps the user reflect further.

Use gentle, clear, non-clinical language.
Do not say the user has a mental disorder.
Do not mention CBT unless necessary.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message ||
            "Gemini API request failed. Please check your model name or API key.",
        },
        { status: response.status }
      );
    }

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reflection generated.";

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong in /api/reflect." },
      { status: 500 }
    );
  }
}