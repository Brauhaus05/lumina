import Link from 'next/link';
import { signUpAction } from '../actions';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-background px-4"
    >
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--foreground)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--background)',
            fontFamily: 'var(--font-heading, var(--font-sans))',
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
          }}
          aria-hidden
        >
          L
        </div>
        <span
          style={{
            fontFamily: 'var(--font-heading, var(--font-sans))',
            fontSize: '1.5rem',
            letterSpacing: '0.1em',
            color: 'var(--foreground)',
          }}
          className="uppercase"
        >
          Lumina
        </span>
      </div>

      {/* Card */}
      <div
        style={{ border: '1px solid var(--border)', background: 'var(--card)', width: '100%', maxWidth: '400px' }}
        className="p-8"
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading, var(--font-sans))',
            fontSize: '1rem',
            letterSpacing: '0.1em',
          }}
          className="mb-6 uppercase text-foreground"
        >
          Create Your Journal
        </h1>

        {error && (
          <p
            style={{ color: 'var(--destructive)', fontSize: '0.75rem', letterSpacing: '0.04em' }}
            className="mb-4 border border-destructive px-3 py-2"
          >
            {error}
          </p>
        )}

        <form action={signUpAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tenantName"
              style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}
              className="uppercase"
            >
              Journal Name
            </label>
            <input
              id="tenantName"
              name="tenantName"
              type="text"
              required
              placeholder="Braulio's Journal"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}
              className="uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}
              className="uppercase"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}
              className="uppercase"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              padding: '0.6rem 1.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              marginTop: '0.5rem',
            }}
            className="uppercase"
          >
            Create Journal
          </button>
        </form>

        <p
          style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '1.5rem' }}
          className="text-center"
        >
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ color: 'var(--foreground)', textDecoration: 'underline' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
