import { NextResponse } from 'next/server';

export async function proxy(request) {
  const basicAuth = request.headers.get('authorization');
  
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // Decode base64 Basic Auth string
    const [user, pwd] = atob(authValue).split(':');

    const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
      console.error("FIREBASE_API_KEY is not defined in environment variables");
      return new NextResponse('Configuration error.', { status: 500 });
    }

    try {
      const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user,
          password: pwd,
          returnSecureToken: true
        })
      });

      if (authRes.ok) {
        const authData = await authRes.json();
        const response = NextResponse.next();
        // Pass the authenticated email downstream so server components can apply RBAC
        response.headers.set('x-admin-username', authData.email);
        return response;
      }
    } catch (error) {
      console.error("Firebase auth verification error:", error);
    }
  }

  // If no auth or wrong credentials, trigger the browser's native login prompt
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Access"',
    },
  });
}

// Ensure the middleware only runs for /admin paths
export const config = {
  matcher: ['/admin/:path*'],
};
