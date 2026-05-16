/**
 * Supabase Edge Function — stripe-webhook
 * Marks a user as Pro after a successful Stripe Checkout.
 *
 * DEPLOY:
 *   supabase functions deploy stripe-webhook --no-verify-jwt
 *
 * Then in Stripe Dashboard → Webhooks → Add endpoint:
 *   URL:    https://<YOUR_PROJECT>.supabase.co/functions/v1/stripe-webhook
 *   Events: checkout.session.completed
 *           customer.subscription.deleted   (optional: revoke Pro on cancel)
 *
 * ENV VARS — set in Supabase Dashboard → Edge Functions → stripe-webhook → Secrets:
 *   STRIPE_WEBHOOK_SECRET   (from Stripe Dashboard → Webhooks → Signing secret)
 *   SUPABASE_SERVICE_ROLE_KEY  (from Supabase → Settings → API → service_role)
 *   SUPABASE_URL               (your project URL)
 */

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe           from 'https://esm.sh/stripe@13?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

serve(async (req: Request) => {
  /* ── Verify Stripe signature ── */
  const signature = req.headers.get('stripe-signature');
  const body      = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  /* ── Handle events ── */
  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session;
    const userId   = session.metadata?.userId ?? session.client_reference_id;

    if (!userId) {
      console.warn('[stripe-webhook] No userId in session metadata');
      return new Response('Missing userId', { status: 400 });
    }

    /* Update user_metadata.is_pro via Admin API */
    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { is_pro: true },
    });
    if (authErr) {
      console.error('[stripe-webhook] auth.admin.updateUserById failed:', authErr.message);
      return new Response('Auth update failed', { status: 500 });
    }

    /* Also update the profiles table */
    const { error: dbErr } = await supabaseAdmin
      .from('profiles')
      .update({ is_pro: true, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (dbErr) {
      console.warn('[stripe-webhook] profiles update failed (non-fatal):', dbErr.message);
    }

    console.log(`[stripe-webhook] ✓ User ${userId} marked as Pro`);
  }

  /* Optional: revoke Pro on subscription cancellation */
  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object as Stripe.Subscription;
    /*
     * You'll need to store the Stripe customer ID → Supabase user ID mapping
     * in your profiles table or Stripe metadata to look up the user here.
     */
    console.log('[stripe-webhook] subscription deleted for customer:', sub.customer);
    // TODO: look up userId by sub.customer and set is_pro = false
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
