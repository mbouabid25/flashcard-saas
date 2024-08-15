import { NextResponse } from 'next/server';

// System prompt for the flashcard creation
const systemPrompt = `
You are a flashcard creator. You take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`;

export async function POST(req) {
  const OPENROUTER_API_KEY = 'sk-6wgrZZdthA-BRClg8XscvuNSDPmUYMolF_q7vvmygqT3BlbkFJtUKxY0e3-G31U2KY8ctKADJIuOgap8a52vUWSImgwA';

  const data = await req.text();

  try {
    // Make a fetch request to the OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": data }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error from OpenRouter API: ${response.statusText}`);
    }

    const completion = await response.json();
    const flashcards = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(flashcards.flashcards);

  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.error();
  }
}