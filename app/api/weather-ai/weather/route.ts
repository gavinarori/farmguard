import { weatherAI } from '@/lib/weather-ai.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const days = searchParams.get('days') ?? '7';
  const ai = searchParams.get('ai') ?? 'true';
  const units = searchParams.get('units') ?? 'metric';
  const lang = searchParams.get('lang') ?? 'en';

  const data = await weatherAI(
    `/weather?lat=${lat}&lon=${lon}&days=${days}&ai=${ai}&units=${units}&lang=${lang}`
  );

  return Response.json(data);
}