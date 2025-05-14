import type { NextApiRequest, NextApiResponse } from "next";
import { updateUserDetails } from "../../../helpers/users";
import { Tokens } from "ordercloud-javascript-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!req.body) {
      return res.status(400).json({ error: "Empty request body" });
    }

    const { displayName, givenName, surname, accessToken } = req.body;

    await updateUserDetails(accessToken, {
      displayName,
      givenName,
      surname,
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ error: "Failed to update user details" });
  }
}
