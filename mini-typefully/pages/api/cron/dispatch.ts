import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

/**
 * Placeholder dispatcher:
 * - Finds due posts
 * - Marks them as 'sent' with a fake id
 * TODO: Replace with real X API call in next step.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow from Vercel Cron (optional: you can add a secret header check)
  const now = new Date().toISOString();
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('id, content')
    .lte('scheduled_time', now)
    .eq('status', 'pending')
    .limit(5);

  if (error) return res.status(500).json({ error: error.message });

  if (!posts || posts.length === 0) return res.status(200).json({ ok: true, processed: 0 });

  const updates = posts.map(p => ({
    id: p.id,
    status: 'sent',
    posted_tweet_id: 'simulated-' + p.id
  }));

  const { error: upErr } = await supabase.from('scheduled_posts').upsert(updates, { onConflict: 'id' });
  if (upErr) return res.status(500).json({ error: upErr.message });

  return res.status(200).json({ ok: true, processed: posts.length });
}
