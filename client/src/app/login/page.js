import Link from 'next/link';

export const metadata = {
  title: 'Sign In | Scouts Emergency Response',
};

export default function Login() {
  return (
    <section className="form-container page-hero page-hero--compact">
      <h1>Sign In</h1>
      <p className="text-center">
        Welcome back. Sign in to access SER resources and updates.
      </p>

      <form id="auth-form" action="#" method="post" data-mode="login">
        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />

        <button type="submit" className="btn">Sign In</button>
        <p id="auth-msg" className="msg" aria-live="polite" style={{ textAlign: 'center', marginTop: '0.75rem' }}></p>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Don&apos;t have an account?{' '}
        <Link href="/login/signup">Sign up here</Link>
      </p>
    </section>
  );
}
