import { OAuth2Client } from "google-auth-library";
import jwt from 'jsonwebtoken';

const scopes = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export async function POST(req) {
  try {
    const { idToken } = await req.json();    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { email, name } = payload;
    const authToken = jwt.sign(
      {
        email,
        name,
        scopes,
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    );
    return new Response(JSON.stringify({ authToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}