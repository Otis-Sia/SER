import Link from 'next/link';

export const metadata = {
  title: 'Sign Up | Scouts Emergency Response',
};

export default function Signup() {
  return (
    <section className="form-container page-hero page-hero--compact">
      <h1>Create an Account</h1>
      <p className="text-center">
        Join Scouts Emergency Response and be part of a community ready to serve.
      </p>

      <form id="auth-form" action="#" method="post" data-mode="register">
        <label htmlFor="full_name">Full Name</label>
        <input type="text" id="full_name" name="full_name" required />

        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" required />

        <label htmlFor="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" name="confirm-password" required />

        <button type="submit" className="btn btn-accent">Sign Up</button>
        <p id="auth-msg" className="msg" aria-live="polite" style={{ textAlign: 'center', marginTop: '0.75rem' }}></p>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </p>
    </section>
  );
}
