import { NextResponse } from 'next/server';

const systemPrompt = `
You are a flashcard generator focused on creating 12 highly effective flashcards that aid in fast memorization and retention. 
Each flashcard should have a simple question or prompt on the front and a clear, concise answer on the back. Use proven learning techniques like chunking, mnemonics, and active recall to enhance memory. 
The language should be straightforward, making complex concepts easy to understand. Your response must be formatted strictly as valid JSON with no additional text or explanations. Only return the flashcards in the following format:
{
  "flashcards":[
    { "front": "Question 1", "back": "Answer 1" },
    { "front": "Question 2", "back": "Answer 2" }
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
      return NextResponse.json(flashcards); // Return the flashcards in the expected format
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return NextResponse.json({ error: 'Failed to parse response from API.' }, { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return NextResponse.json({ error: 'Failed to fetch data from API.' }, { status: 500 });
  }
}
