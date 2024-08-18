import { NextResponse } from 'next/server';

const systemPrompt = `
You are a flashcard creator. You take in text and one flashcards from it. Make sure to create exactly 1 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    { "front": "Question 1", "back": "Answer 1" },
  ]
}
`;

export async function POST(req) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const requestData = await req.text(); // Read request body as text

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": requestData },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch data from API.' }, { status: 500 });
    }

    const responseText = await response.text(); // Get raw response text

    try {
      const jsonResponse = JSON.parse(responseText); // Parse outer JSON
      const flashcardsContent = jsonResponse.choices[0].message.content;

      const flashcards = JSON.parse(flashcardsContent); // Parse inner JSON
      return NextResponse.json({ flashcard: flashcards.flashcards[0] }); // Adjust to ma
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return NextResponse.json({ error: 'Failed to parse response from API.' }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return NextResponse.json({ error: 'Failed to fetch data from API.' }, { status: 500 });
  }
}