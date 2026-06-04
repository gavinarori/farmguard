import { weatherAI } from '@/lib/weather-ai.server';

export async function POST(req: Request) {
  const formData = await req.formData();

  const res = await fetch(
    'https://api.weather-ai.co/v1/trees/analyze',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WEATHER_AI_KEY}`,
      },
      body: formData,
    }
  );

  const json = await res.json();

  return Response.json(json, { status: res.status });
}