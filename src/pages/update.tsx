import { useEffect, useState } from "react";
import { Configuration, Me, MeUser, Tokens } from "ordercloud-javascript-sdk";
import { useRouter } from "next/router";

Configuration.Set({
  baseApiUrl: process.env.NEXT_PUBLIC_ORDERCLOUD_API_URL,
});

export default function UpdateUser() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [me, setMe] = useState<MeUser>();
  const { isReady, query } = useRouter();

  useEffect(() => {
    if (isReady) {
      const getMe = async () => {
        const result = await Me.Get();
        setMe(result);
      };
      getMe();
    }
  }, [isReady]);

  return me ? (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-purple-600">
          Update Your Profile
        </h2>
        <form
          id="userInfoForm"
          action="/api/users/update"
          method="POST"
          className="space-y-4"
        >
          <div>
            <input
              type="hidden"
              name="accessToken"
              defaultValue={Tokens.GetIdentityToken()}
            />
          </div>
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              defaultValue={
                me?.xp?.DisplayName || `${me.FirstName} ${me.LastName}`
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="givenName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              name="givenName"
              id="givenName"
              defaultValue={me.FirstName}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              name="surname"
              id="surname"
              defaultValue={me.LastName}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
          >
            Update
          </button>
        </form>
      </div>
    </main>
  ) : (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Loading...</p>
    </main>
  );
}
