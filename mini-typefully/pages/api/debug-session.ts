import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ ok: false, error: 'no session' });
  res.json({
    ok: true,
    has_access_token: !!(session as any).access_token,
    username: (session as any).username,
    twitterId: (session as any).twitterId,
    // careful not to expose the full token in production; this is just to verify
    // scopes come from the grant, not always shown here, but token existing means grant succeeded
  });
}
