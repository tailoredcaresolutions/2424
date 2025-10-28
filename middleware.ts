import { auth } from './auth';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedRoutes = ['/session', '/review', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users to /auth
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/auth', nextUrl));
  }

  // Redirect authenticated users away from /auth to /session
  if (isLoggedIn && nextUrl.pathname === '/auth') {
    return Response.redirect(new URL('/session', nextUrl));
  }

  return null;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
