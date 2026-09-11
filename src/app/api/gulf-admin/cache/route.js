import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// GET — list all gulf_city_cache entries
export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('gulf_city_cache')
    .select('city_key, country, updated_at, properties')
    .order('updated_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const enriched = (data || []).map(row => ({
    city_key: row.city_key,
    country: row.country,
    updated_at: row.updated_at,
    property_count: Array.isArray(row.properties) ? row.properties.length : 0,
  }));

  return Response.json({ cache: enriched });
}

// DELETE — clear one city or all
export async function DELETE(req) {
  const supabase = getSupabase();
  const { city_key, clearAll } = await req.json();

  let error;
  if (clearAll) {
    ({ error } = await supabase.from('gulf_city_cache').delete().neq('city_key', '__none__'));
  } else {
    if (!city_key) return Response.json({ error: 'city_key required' }, { status: 400 });
    ({ error } = await supabase.from('gulf_city_cache').delete().eq('city_key', city_key));
  }

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
