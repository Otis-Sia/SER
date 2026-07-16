import { NextResponse } from 'next/server';

export function proxy(request) {
  const basicAuth = request.headers.get('authorization');
  
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // Decode base64 Basic Auth string
    const [user, pwd] = atob(authValue).split(':');

    if (
      user === process.env.ADMIN_USERNAME &&
      pwd === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.next();
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
