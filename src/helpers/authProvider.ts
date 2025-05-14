// helpers/authProvider.ts

import type { NextApiRequest, NextApiResponse } from "next";

const AUTHORITY = `https://${process.env.TENANT_SUBDOMAIN}.ciamlogin.com/${process.env.TENANT_SUBDOMAIN}.onmicrosoft.com`;
const POST_LOGOUT_REDIRECT_URI =
  process.env.NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI || "https://localhost:3000";

export const serverLogout = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const logoutUrl = `${AUTHORITY}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
    `${POST_LOGOUT_REDIRECT_URI}`
  )}`;

  // Clear any auth-related cookies
  res.setHeader("Set-Cookie", [
    `auth_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    `refresh_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`, // if applicable
  ]);

  // Redirect to Azure AD logout
  res.redirect(logoutUrl);
};
