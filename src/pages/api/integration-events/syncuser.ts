import { NextApiHandler } from "next";
import { withOcWebhookAuth } from "@ordercloud/catalyst";
import {
  Configuration,
  OpenIdConnectPayload,
  OpenIdConnectResponse,
  RequiredDeep,
  Users,
} from "ordercloud-javascript-sdk";
import { isOrderCloudError } from "@/utils";
import { jwtDecode as parseJwt } from "jwt-decode";

Configuration.Set({
  baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL,
});

/**
 * Enables single sign on via ordercloud's openid connect feature: https://ordercloud.io/knowledge-base/sso-via-openid-connect
 * this endpoint gets called by the OrderCloud API whenever a user needs to get a new ordercloud token via openidconnect AFTER first login
 * it is responsible for updating user details in ordercloud when they have changed in the idp
 */
const routeHandler: NextApiHandler<OpenIdConnectResponse> = async (
  request,
  response
) => {
  const payload = request.body as RequiredDeep<OpenIdConnectPayload>;

  // the ordercloud user associated with the user in the IDP
  const existingUser = payload.ExistingUser;
  console.log("existingUser", existingUser);

  // The claims (user details) from parsing IDPs ID token, claims here vary by provider
  const claims = parseJwt<any>(payload.TokenResponse.id_token);
  console.log("claims", claims);

  // we should sync the user if Email, FirstName, or LastName have changed
  const shouldSyncUser =
    existingUser.Email !== claims.email && existingUser.Username !== "NOT_AVAILABLE" ||
    (existingUser.FirstName !== claims.given_name &&
      existingUser.FirstName !== "NOT_AVAILABLE") ||
    (existingUser.LastName !== claims.family_name &&
      existingUser.LastName !== "NOT_AVAILABLE");

  // if there is no reason to sync the user then simply return a success response
  if (!shouldSyncUser) {
    console.log("Not syncing user as no changes detected");
    console.log("Username: ", existingUser?.Username);
    return response.status(200).json({
      Username: existingUser.Username,
    });
  }

  console.log("Syncing user, changes detected");
  try {
    const updatedUserBody = {
      Email: claims.email || "NOT_AVAILABLE",
      FirstName: claims.given_name || "NOT_AVAILABLE",
      LastName: claims.family_name || "NOT_AVAILABLE",
    }
    console.log(`syncing user ${existingUser.ID} in ${existingUser.CompanyID} with body: ${JSON.stringify(updatedUserBody)}`);
    const updatedUser = await Users.Patch(
      existingUser.CompanyID,
      existingUser.ID,
      updatedUserBody,
      // access token has been granted elevated role BuyerUserAdmin required to patch users
      { accessToken: payload.OrderCloudAccessToken }
    );
    console.log("Success! Updated user with username: ", updatedUser.Username);
    return response.status(200).json({
      Username: updatedUser.Username,
    });
  } catch (error) {
    console.log(`An error occurred while syncing the user`);
    let errorMessage: string;
    if (isOrderCloudError(error)) {
      errorMessage = error.isOrderCloudError
        ? JSON.stringify(error.errors)
        : error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unknown error occurred";
    }
    console.log(errorMessage);
    return response.status(200).json({
      ErrorMessage:
        errorMessage ||
        `Successfully logged in via IDP but an error occured while updating the OrderCloud user. ${errorMessage}`,
    });
  }
};

// withOCWebhookAuth needs the raw body in order to validate the payload is coming from ordercloud
export const config = {
  api: {
    bodyParser: false,
  },
};
export default withOcWebhookAuth(routeHandler);
