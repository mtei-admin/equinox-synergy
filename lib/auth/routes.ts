export const PUBLIC_ROUTES = ["/login", "/auth/callback"] as const;

export const DEALER_HOME = "/dealer";
export const ADMIN_HOME = "/admin";
export const LOGIN_ROUTE = "/login";

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function homeRouteForRole(role: "dealer" | "employee"): string {
  return role === "employee" ? ADMIN_HOME : DEALER_HOME;
}
