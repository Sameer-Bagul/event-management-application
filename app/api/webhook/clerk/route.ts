import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clerkClient, WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not defined in environment variables.');
    return new Response('Internal Server Error', { status: 500 });
  }

  // Retrieve headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id') || '';
  const svix_timestamp = headerPayload.get('svix-timestamp') || '';
  const svix_signature = headerPayload.get('svix-signature') || '';

  // Ensure headers exist
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers.');
    return new Response('Bad Request', { status: 400 });
  }

  // Retrieve raw body for signature verification
  const payload = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Unauthorized', { status: 401 });
  }

  // Extract event data
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id || '',
      email: email_addresses?.[0]?.email_address || '',
      username: username || '',
      firstName: first_name || '',
      lastName: last_name || '',
      photo: image_url || '',
    };

    const newUser = await createUser(user);

    if (newUser) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(id || '', {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: 'User Created', user: newUser });
  }

  if (eventType === 'user.updated') {
    const { image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      photo: image_url || '',
    };

    const updatedUser = await updateUser(id || '', user);
    return NextResponse.json({ message: 'User Updated', user: updatedUser });
  }

  if (eventType === 'user.deleted') {
    const deletedUser = await deleteUser(id || '');
    return NextResponse.json({ message: 'User Deleted', user: deletedUser });
  }

  return new Response('', { status: 200 });
}
