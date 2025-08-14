import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { content, scheduled_time } = req.body as { content: string; scheduled_time: string };
  if (!content || !scheduled_time) return res.status(400).json({ error: 'Missing content or time' });

  // ensure user exists
  const userId = (session as any).providerAccountId as string;
  const username = (session as any).username as string | undefined;
  const { data: existing } = await supabase.from('users').select('id').eq('x_user_id', userId).maybeSingle();
  let dbUserId = existing?.id;
  if (!dbUserId) {
    const { data, error } = await supabase.from('users').insert([{ x_user_id: userId, x_username: username }]).select('id').single();
    if (error) return res.status(500).json({ error: error.message });
    dbUserId = data.id;
  }

  const { error } = await supabase.from('scheduled_posts').insert([{
    user_id: dbUserId,
    content,
    scheduled_time: new Date(scheduled_time).toISOString(),
    status: 'pending'
  }]);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
