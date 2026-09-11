import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// GET — list all gulf properties with optional filters
export async function GET(req) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const type = searchParams.get('type');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const from = (page - 1) * limit;

  let query = supabase
    .from('gulf_properties')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (country) query = query.eq('country', country);
  if (city) query = query.ilike('city', `%${city}%`);
  if (type) query = query.eq('property_type', type);

  const { data, count, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ properties: data || [], total: count || 0, page, limit });
}

// POST — add new gulf property
export async function POST(req) {
  const supabase = getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from('gulf_properties')
    .insert([body])
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ property: data });
}

// DELETE — remove a gulf property
export async function DELETE(req) {
  const supabase = getSupabase();
  const { id } = await req.json();
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabase.from('gulf_properties').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
