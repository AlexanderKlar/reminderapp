import { withClerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
export default withClerkMiddleware((req: NextRequest) => {
  const { userId } = getAuth(req);
  const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') || 
                    req.nextUrl.pathname.startsWith('/sign-up');
  
  if (!userId && !isAuthPage) {
    const signInUrl = new URL('/sign-in', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 