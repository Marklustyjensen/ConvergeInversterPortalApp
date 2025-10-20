// export default function SignIn() {
//   return (
//     <>
//       <p>Sign In Component Placeholder</p>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { signIn as authenticate } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await authenticate("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Sign-in successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        {/* Logo and Welcome Text */}
        <div className="text-center mb-6 sm:mb-10">
          <img
            src="/images/Logo.jpg"
            alt="Logo"
            className="w-32 sm:w-40 md:w-[200px] mb-4 sm:mb-6 mx-auto"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl px-4">
            Welcome to Converge Hospitality&apos;s{" "}
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>incident reporting platform
          </h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-4 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left order-2 lg:order-1 px-4">
            <p className="text-sm sm:text-base leading-relaxed">
              Efficiently manage and document incidents with ease.{" "}
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>This platform ensures a
              seamless reporting process, <br className="hidden md:block" />
              <span className="md:hidden"> </span>streamlined communication, and
              enhanced <br className="hidden md:block" />
              <span className="md:hidden"> </span>operational transparency.
            </p>
          </div>

          {/* Right Column - Sign In Form */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="w-full max-w-sm mx-4 sm:mx-0 p-6 sm:p-8 rounded-2xl shadow-xl bg-white">
              <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6 text-[#5c9c45]">
                Sign In
              </h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5c9c45] focus:border-transparent"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5c9c45] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-base font-medium text-white bg-[#5c9c45] rounded-lg hover:bg-[#4a8238] transition focus:outline-none focus:ring-2 focus:ring-[#5c9c45] focus:ring-offset-2"
                >
                  Sign In
                </button>
              </form>

              {message && (
                <p
                  className={`mt-4 text-center text-sm font-medium ${
                    message.includes("successful")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
