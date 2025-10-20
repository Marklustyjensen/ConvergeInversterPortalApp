"use client";

import React from "react";
import InvesterDashboard from "./investerDashboard";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();

  if (session === undefined) {
    return <h1>Loading...</h1>;
  }

  if (session === null) {
    return <h1>Access Denied</h1>;
  }

  return (
    <>
      {!session.user?.admin ? (
        <InvesterDashboard />
      ) : (
        <h1>
          Access Denied - Admin users are not allowed to access the investor
          dashboard
        </h1>
      )}
    </>
  );
};

export default Dashboard;
