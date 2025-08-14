import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ ok: false, error: 'Not signed in' });

  const { content, scheduled_time } = req.body || {};
  if (!content || !scheduled_time) return res.status(400).json({ ok: false, error: 'Missing content or time' });

  const x_user_id     = (session as any).twitterId || (session as any).user?.id || '';
  const x_username    = (session as any).username  || (session as any).user?.name || '';
  const access_token  = (session as any).access_token  || null;
  const refresh_token = (session as any).refresh_token || null;

  try {
    // keep latest tokens for the user so cron can post later
    if (x_user_id) {
      await supabaseAdmin
        .from('users')
        .upsert(
          { x_user_id, x_username, access_token, refresh_token },
          { onConflict: 'x_user_id' }
        );
    }

    // insert the scheduled tweet
    const { data, error } = await supabaseAdmin
      .from('scheduled_posts')
      .insert([{ content, scheduled_time, status: 'pending', x_user_id, x_username }])
      .select('id')
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message || 'Unknown error' });
  }
}
