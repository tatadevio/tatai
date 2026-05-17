import { NextRequest, NextResponse } from "next/server";

// Auth middleware is enabled once NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is added to Vercel env vars.
// Until then, all routes are accessible so the site loads correctly.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
