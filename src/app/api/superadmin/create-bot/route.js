import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { userId, name, website_url, welcome_message } = await req.json();
    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const botName = name || 'Gulf Real Estate Assistant';
    const welcome = welcome_message || `Hi there! 👋 I'm ${botName}. Looking for property to buy or rent in Dubai, Abu Dhabi, Riyadh, or Jeddah? Ask me anything!`;

    const { data: bot, error } = await supabaseAdmin.from('bots').insert({
      user_id: userId,
      name: botName,
      industry: 'Real Estate',
      website_url: website_url || '',
      welcome_message: welcome,
      system_prompt: `You are an expert AI Real Estate Advisor for ${botName}. Help clients search, buy, rent, and invest in properties across UAE and Saudi Arabia.`,
      primary_color: '#D4A843',
      bot_avatar: '🌴',
      status: 'Active'
    }).select().single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Link bot_id to users_subscription
    await supabaseAdmin
      .from('users_subscription')
      .update({ bot_id: bot.id })
      .eq('user_id', userId);

    return Response.json({ success: true, bot });
  } catch (e) {
    console.error('Error creating bot:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
