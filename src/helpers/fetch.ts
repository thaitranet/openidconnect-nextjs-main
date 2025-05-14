// helpers/fetch.ts
import axios, { AxiosRequestConfig, Method, AxiosResponse } from "axios";

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
): Promise<AxiosResponse<any>> => {
  const options: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  console.log(`Request made to ${endpoint} at: ${new Date().toString()}`);

  try {
    switch (method) {
      case "GET":
        return await axios.get(endpoint, options);
      case "POST":
        return await axios.post(endpoint, data, options);
      case "PATCH":
        return await axios.patch(endpoint, data, options);
      case "DELETE":
        const deleteUrl = typeof data === "string" ? `${endpoint}/${data}` : endpoint;
        return await axios.delete(deleteUrl, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error: any) {
    console.error(`Error during ${method} request to ${endpoint}:`, error?.response?.data || error.message);
    throw error;
  }
};
