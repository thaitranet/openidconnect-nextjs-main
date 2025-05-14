// helpers/fetch.ts
import axios, { AxiosRequestConfig, Method } from "axios";

/**
 * Makes an Authorization "Bearer" request with the given accessToken to the given endpoint.
 * @param endpoint - The full API URL to call
 * @param accessToken - OAuth2 access token
 * @param method - HTTP method (GET, POST, PATCH, DELETE)
 * @param data - Request body or identifier (for DELETE)
 */
export const fetch = async (
  endpoint: string,
  accessToken: string,
  method: Method = "GET",
  data: any = null
): Promise<any> => {
  const options: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  console.log(`Request made to ${endpoint} at: ${new Date().toString()}`);

  try {
    switch (method) {
      case "GET":
        const getResponse = await axios.get(endpoint, options);
        return getResponse.data;
      case "POST":
        const postResponse = await axios.post(endpoint, data, options);
        return postResponse.data;
      case "PATCH":
        const patchResponse = await axios.patch(endpoint, data, options);
        return patchResponse.data;
      case "DELETE":
        const deleteUrl = typeof data === "string" ? `${endpoint}/${data}` : endpoint;
        const deleteResponse = await axios.delete(deleteUrl, options);
        return deleteResponse.data;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error: any) {
    console.error(`Error during ${method} request to ${endpoint}:`, error);
    throw error;
  }
};
