import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LOGIN_ROUTE, homeRouteForRole } from "@/lib/auth/routes";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect(LOGIN_ROUTE);
  }

  redirect(homeRouteForRole(session.profile.role));
}
