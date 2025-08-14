import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Minimal helper to post a tweet with the user's access token
async function postTweet(accessToken: string, text: string) {
  const r = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Safety: don't allow random browsers to trigger this.
  // Vercel Cron automatically includes this header.
  if (!req.headers['x-vercel-cron']) {
    return res.status(401).json({ ok: false, error: 'Not from Vercel Cron' });
  }

  const nowIso = new Date().toISOString();

  // 1) Find up to 10 posts that are due right now
  const { data: due, error } = await supabaseAdmin
    .from('scheduled_posts')
    .select('id, content, x_user_id')
    .eq('status', 'pending')
    .lte('scheduled_time', nowIso)
    .order('scheduled_time', { ascending: true })
    .limit(10);

  if (error) return res.status(500).json({ ok: false, error: error.message });

  const results: any[] = [];

  for (const row of due ?? []) {
    // 2) Load the user's token
    const { data: user, error: uerr } = await supabaseAdmin
      .from('users')
      .select('access_token')
      .eq('x_user_id', row.x_user_id)
      .single();

    if (uerr || !user?.access_token) {
      await supabaseAdmin.from('scheduled_posts')
        .update({ status: 'needs_reauth' })
        .eq('id', row.id);
      results.push({ id: row.id, ok: false, reason: 'no access token' });
      continue;
    }

    // 3) Try to post
    const { ok, status, json } = await postTweet(user.access_token, row.content);

    if (ok) {
      await supabaseAdmin.from('scheduled_posts')
        .update({ status: 'sent' })
        .eq('id', row.id);
      results.push({ id: row.id, ok: true, tweet_id: json?.data?.id });
    } else if (status === 401 || status === 403) {
      // Token expired or app lacks permission: ask user to log in again with write scope
      await supabaseAdmin.from('scheduled_posts')
        .update({ status: 'needs_reauth' })
        .eq('id', row.id);
      results.push({ id: row.id, ok: false, status, reason: 'unauthorized', body: json });
    } else {
      await supabaseAdmin.from('scheduled_posts')
        .update({ status: 'failed' })
        .eq('id', row.id);
      results.push({ id: row.id, ok: false, status, body: json });
    }
  }

  return res.json({ ok: true, processed: results.length, results });
}
