import { weatherAI } from '@/lib/weather-ai.server';

export async function GET() {
  const data = await weatherAI('/usage');
  return Response.json(data);
}