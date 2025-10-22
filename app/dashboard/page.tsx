"use client";

import React from "react";
import InvestorDashboard from "./investorDashboard";
import AdminDashboard from "./adminDashboard";
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
    <>{session.user?.admin ? <AdminDashboard /> : <InvestorDashboard />}</>
  );
};

export default Dashboard;
