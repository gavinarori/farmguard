import { weatherAI } from '@/lib/weather-ai.server';

export async function GET() {
  const data = await weatherAI('/trees/quota');
  return Response.json(data);
}