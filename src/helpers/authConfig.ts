// helpers/authConfig.ts

// Define the expected environment variable type
const GRAPH_API_ENDPOINT: string = process.env.GRAPH_API_ENDPOINT ?? "https://graph.microsoft.com/";

// Construct the "me" endpoint for the signed-in user
const fields = ["id", "givenName", "surname", "displayName", "mail", "userPrincipalName", "jobTitle", "mobilePhone", "officeLocation", "country", "city", "state", "postalCode"];
export const GRAPH_ME_ENDPOINT = `${GRAPH_API_ENDPOINT}v1.0/me`;
export const GRAPH_ME_ENDPOINT_SELECT = `${GRAPH_API_ENDPOINT}v1.0/me?$select=${fields.join(",")}`;
