import Link from "next/link";
import { useRouter } from "next/router";
import { Configuration, Me, MeUser, Tokens } from "ordercloud-javascript-sdk";
import { useEffect, useState } from "react";

Configuration.Set({
  baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL,
});

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [me, setMe] = useState<MeUser>();
  const { isReady, query } = useRouter();
  const [identityToken, setIdentityToken] = useState<string>();

  useEffect(() => {
    if (isReady) {
      const orderCloudToken = query["token"];
      const idpToken = query["idpToken"];
      const refreshToken = query["refreshToken"];

      if (!orderCloudToken) {
        const apiUrl = process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL;
        const cid = process.env.NEXT_PUBLIC_ORDERCLOUD_CLIENT_ID;
        const oidcId = process.env.NEXT_PUBLIC_ORDERCLOUD_OPEN_ID_CONNECT_ID;

        let openidurl = `${apiUrl}/ocrplogin?id=${oidcId}&cid=${cid}`;
        if (process.env.NEXT_PUBLIC_IDENTITY_PROVIDER === "azure") {
          // This forwards response_mode=form_post to Azure's Authorization endpoint so that
          // the request is sent as a POST request instead of a GET request
          // which doesn't have the same character limits as the default GET request
          // and can cause issues on particularly large IDP tokens (many claims)
          openidurl += `&customParams=response_mode%3Dform_post`;
        }

        // kickstart the login flow
        console.log("Redirecting to: ", openidurl);
        window.location.href = openidurl;
      } else {
        // Now that we have the ordercloud token we could use the Javascript SDK to store it and interact with the API as usual
        Tokens.SetAccessToken(orderCloudToken?.toString());
        if (refreshToken) {
          Tokens.SetRefreshToken(refreshToken?.toString());
        }

        setIdentityToken(idpToken?.toString());
        Tokens.SetIdentityToken(`${idpToken}`);
        setIsAuthenticated(true);
      }
    }
  }, [isReady, query]);

  useEffect(() => {
    const getMe = async () => {
      const result = await Me.Get();
      setMe(result);
    };
    if (isAuthenticated) {
      getMe();
    }
  }, [isAuthenticated]);

  return me ? (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl text-center mb-8">
          Welcome{" "}
          <span className="text-purple-600">
            {me.FirstName !== "NOT_AVAILBLE" && me.FirstName}{" "}
            {me.LastName !== "NOT_AVAILABLE" && me.LastName}
          </span>
        </h2>

        <div className="flex gap-4 mb-6">
          <Link
            href="/update"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Update Account
          </Link>
          <Link
            href="/api/auth/signout"
            className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Sign Out
          </Link>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-600">
            OrderCloud User
          </h3>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
            {JSON.stringify(me, null, 2)}
          </pre>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-600">
            OrderCloud Access Token
          </h3>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
            {Tokens.GetAccessToken()}
          </pre>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-600">
            OrderCloud Refresh Token
          </h3>
          {Tokens.GetRefreshToken() ? (
            <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
              {Tokens.GetRefreshToken()}
            </pre>
          ) : (
            <i>
              No refresh token found, to enable this make sure that your
              OrderCloud API Client has a RefreshTokenDuration set to a value
              greater than zero.
            </i>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-purple-600">
            IDP Token
          </h3>
          {identityToken ? (
            <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
              {identityToken}
            </pre>
          ) : (
            <i>
              No IDP token found.
              {process.env.NEXT_PUBLIC_IDENTITY_PROVIDER === "azure" &&
                " This can be enabled by including the the Azure Application (client) ID in the OpenIDConnect.AdditionalIdpScopes array in OrderCloud"}
            </i>
          )}
        </div>
      </div>
    </main>
  ) : (
    <main>Loading...</main>
  );
}
