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
import { uuid } from "uuidv4";

Configuration.Set({
  baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL,
});

/**
 * Enables single sign on via ordercloud's openid connect feature: https://ordercloud.io/knowledge-base/sso-via-openid-connect
 * This endpoint will be called after a user has successfully logged in via their IDP but before they are redirected to the application
 * It is responsible for associating a user from the idp with a user from ordercloud and expects a username be returned
 */
const routeHandler: NextApiHandler<OpenIdConnectResponse> = async (
  request,
  response
) => {
  const payload = request.body as RequiredDeep<OpenIdConnectPayload>;

  try {
    if (!process.env.ORDERCLOUD_BUYER_ID) {
      throw new Error("Required environment variable BUYER_ID is not set");
    }

    console.log(`IDP token`, payload.TokenResponse?.id_token);

    // The claims (user details) from parsing IDP's ID token, claims here vary by provider
    const claims = parseJwt<any>(payload.TokenResponse?.id_token);

    console.log(`User claims decoded from IDP token`, JSON.stringify(claims, null, 4));

    const usersList = await Users.List(
      process.env.ORDERCLOUD_BUYER_ID,
      {
        filters: { Username: claims.email },
      },
      // access token has been granted elevated role BuyerUserAdmin required to list users
      { accessToken: payload.OrderCloudAccessToken }
    );

    const existingUser = usersList.Items[0];
    if (existingUser) {
      console.log(`Existing user found from different IDP, merge both identities into single user`);
      // Its possible the same user logged in via different IDPs (google vs azure vs email vs facebook) in which case we will simply
      // merge both idp identities into the single ordercloud user identity
      return response.status(200).json({
        Username: existingUser.Username,
      });
    }

    console.log(`No existing user found, create a new user on the fly and associate with the incoming IDP identity`);

    // create a new user in ordercloud on the fly to call out to associate with the incoming idp identity
    const newUserPayload = {
      Username: uuid(), // can be something else but you're responsible for ensuring uniqueness across seller org
      Email: claims.email || "NOT_AVAILABLE",
      FirstName: claims.given_name || "NOT_AVAILABLE",
      LastName: claims.family_name || "NOT_AVAILABLE",
      Active: true,
    };
    console.log(
      `New user to create in buyerID ${
        process.env.ORDERCLOUD_BUYER_ID
      } \n ${JSON.stringify(newUserPayload, null, 4)} `
    );

    const newUser = await Users.Create(
      process.env.ORDERCLOUD_BUYER_ID,
      newUserPayload,
      // access token has been granted elevated role BuyerUserAdmin required to create users
      { accessToken: payload.OrderCloudAccessToken }
    );

    return response.status(200).json({
      Username: newUser.Username,
    });
  } catch (error) {
    console.log(`An error occurred while creating the user`);
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
      ErrorMessage: `Successfully logged in via IDP but an error occured while creating the OrderCloud user. ${errorMessage}`,
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
