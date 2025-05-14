// helpers/users.ts
import { GRAPH_ME_ENDPOINT } from "./authConfig";
import { fetch } from "./fetch";

interface GraphUser {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  mobilePhone?: string;
  officeLocation?: string;
  [key: string]: any; // allows for additional dynamic fields
}

/**
 * Fetches the signed-in user's profile from Microsoft Graph.
 * @param accessToken - OAuth2 access token
 * @returns GraphUser object
 * @throws Error if profile data is missing or invalid
 */
export const getUserDetails = async (accessToken: string): Promise<GraphUser> => {
  const graphResponse = await fetch(GRAPH_ME_ENDPOINT, accessToken);

  if (!graphResponse?.id) {
    console.error("Failed to fetch profile data");
    throw new Error("Failed to fetch profile data");
  }

  return graphResponse as GraphUser;
};
