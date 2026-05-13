'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceRoleClient } from '@lumina/db/server';

function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/');
}

export async function signUpAction(formData: FormData): Promise<void> {
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';
  const tenantName = ((formData.get('tenantName') as string) ?? '').trim();

  if (!email || !password) {
    redirect(`/auth/signup?error=${encodeURIComponent('Email and password are required')}`);
  }

  if (password !== confirmPassword) {
    redirect(`/auth/signup?error=${encodeURIComponent('Passwords do not match')}`);
  }

  if (!tenantName) {
    redirect(`/auth/signup?error=${encodeURIComponent('Journal name is required')}`);
  }

  const supabase = await createServerSupabaseClient();
  const serviceClient = await createServiceRoleClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

  if (authError || !authData.user) {
    redirect(
      `/auth/signup?error=${encodeURIComponent(authError?.message ?? 'Signup failed')}`,
    );
  }

  const subdomain = generateSubdomain(tenantName) || authData.user.id.slice(0, 8);

  const { data: tenant, error: tenantError } = await serviceClient
    .from('tenants')
    .insert({ name: tenantName, subdomain })
    .select()
    .single();

  if (tenantError || !tenant) {
    redirect(
      `/auth/signup?error=${encodeURIComponent(tenantError?.message ?? 'Failed to create journal')}`,
    );
  }

  const { error: mapError } = await serviceClient
    .from('user_tenant_map')
    .insert({ user_id: authData.user.id, tenant_id: tenant.id });

  if (mapError) {
    redirect(
      `/auth/signup?error=${encodeURIComponent(mapError.message ?? 'Failed to link account')}`,
    );
  }

  // Refresh session so the next JWT has tenant_id injected by the custom access token hook
  await supabase.auth.refreshSession();

  redirect('/');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
