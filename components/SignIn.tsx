"use client";

import { useState } from "react";
import { signIn as authenticate } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await authenticate("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage("Sign-in successful!");
      setTimeout(() => router.push("/dashboard"), 1000);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.svg')] bg-repeat"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl w-full">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src="/images/Logo.jpg"
                  alt="Converge Hospitality Logo"
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-white/20"></div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text font-serif">
                Converge Hospitality
              </span>
            </h1>

            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-slate-600 mb-4 font-light">
                Investor Portal test
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Access your investment portfolio, performance metrics, and
                financial documents for your hospitality investments.
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left Column - Features */}
            <div className="lg:col-span-2 space-y-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                  Your Investment Dashboard
                </h3>

                <div className="space-y-6">
                  {/* <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        Portfolio Analytics
                      </h4>
                      <p className="text-slate-600">
                        Real-time performance tracking and detailed financial
                        metrics
                      </p>
                    </div>
                  </div> */}

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        Financial Documents
                      </h4>
                      <p className="text-slate-600">
                        Secure access to statements, reports, and tax documents
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        Secure Access
                      </h4>
                      <p className="text-slate-600">
                        Bank-level security with encrypted data transmission
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Divider */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="hidden lg:block w-px h-96 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
            </div>

            {/* Right Column - Sign In Form */}
            <div className="lg:col-span-2">
              <div className="luxury-card p-8 sm:p-10 max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    Welcome Back
                  </h3>
                  <p className="text-slate-600">
                    Sign in to access your investment portal
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter your username"
                      className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl 
                               focus:border-gray-500 focus:ring-0 transition-colors duration-200
                               placeholder-slate-400 bg-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-xl 
                               focus:border-gray-500 focus:ring-0 transition-colors duration-200
                               placeholder-slate-400 bg-white"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex justify-end">
                    <a
                      href="/forgot-password"
                      className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Forgot your password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-base font-semibold text-white 
                             bg-gradient-to-r from-gray-600 to-green-600 rounded-xl 
                             hover:from-gray-700 hover:to-green-700 
                             focus:outline-none focus:ring-4 focus:ring-gray-200
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200 transform hover:scale-[1.02]
                             shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {message && (
                  <div
                    className={`mt-6 p-4 rounded-lg text-center font-medium ${
                      message.includes("successful")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500">
                    Need help? Contact your account manager or
                    <a
                      href="mailto:support@convergehospitality.com"
                      className="text-green-600 hover:text-green-700 ml-1"
                    >
                      support@convergehospitality.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
