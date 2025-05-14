// pages/api/auth/signout.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Optional: server-side auth helper if needed
import { serverLogout } from "../../../helpers/authProvider"; // adjust path if different

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await serverLogout(req, res);
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ error: "Logout failed" });
  }
}
