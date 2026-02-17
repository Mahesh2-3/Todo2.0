export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (custom sign-in page)
     * - public files with extensions: .png, .jpg, .jpeg, .gif, .mp4, .svg
     */
    "/((?!api|_next/static|_next/image|favicon.ico|signin|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.mp4$|.*\\.svg$).*)",
  ],
};
