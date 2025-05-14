import { GRAPH_ME_ENDPOINT, GRAPH_ME_ENDPOINT_SELECT } from "./authConfig";
import { fetch } from "./fetch";
import { AxiosResponse } from "axios";

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
  const graphResponse: AxiosResponse = await fetch(GRAPH_ME_ENDPOINT_SELECT, accessToken);

  if (!graphResponse?.data?.id) {
    console.error("Failed to fetch profile data");
    throw new Error("Failed to fetch profile data");
  }

  return graphResponse.data as GraphUser;
};

/**
 * Updates the signed-in user's profile in Microsoft Graph.
 * @param accessToken - OAuth2 access token
 * @param body - Fields to update (e.g., displayName, givenName, surname)
 * @throws Error if update fails
 */
export const updateUserDetails = async (
  accessToken: string,
  body: Record<string, any>
): Promise<void> => {
  try {
    const response: AxiosResponse = await fetch(GRAPH_ME_ENDPOINT, accessToken, "PATCH", body);

    if (response.status === 204) {
      console.log("User details updated successfully.");
    } else {
      console.error("Failed to update user details:", response.data);
      throw new Error("Failed to update user details.");
    }
  } catch (error: any) {
    console.error("An error occurred while updating user details:", error?.response?.data || error.message);
    throw error;
  }
};
