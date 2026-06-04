import { weatherAI } from '@/lib/weather-ai.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = searchParams.get('limit') ?? '20';
  const cursor = searchParams.get('cursor');

  const url = cursor
    ? `/trees/history?limit=${limit}&cursor=${cursor}`
    : `/trees/history?limit=${limit}`;

  const data = await weatherAI(url);
  return Response.json(data);
}