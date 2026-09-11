import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [
    { count: totalProperties },
    { data: citiesData },
    { count: cachedCities },
    { count: totalUsers },
    { count: activeBots },
  ] = await Promise.all([
    supabase.from('gulf_properties').select('*', { count: 'exact', head: true }),
    supabase.from('gulf_properties').select('city'),
    supabase.from('gulf_city_cache').select('*', { count: 'exact', head: true }),
    supabase.from('users_subscription').select('*', { count: 'exact', head: true }),
    supabase.from('bots').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
  ]);

  const uniqueCities = new Set((citiesData || []).map(r => r.city)).size;

  return Response.json({
    totalProperties: totalProperties || 0,
    uniqueCities,
    cachedCities: cachedCities || 0,
    totalUsers: totalUsers || 0,
    activeBots: activeBots || 0,
  });
}
