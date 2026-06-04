import { weatherAI } from '@/lib/weather-ai.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const data = await weatherAI(
    `/current?lat=${lat}&lon=${lon}&ai=false`
  );

  return Response.json(data);
}