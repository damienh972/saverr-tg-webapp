import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThirdwebProvider } from "thirdweb/react";
import { init } from "@tma.js/sdk";

import AppLayout from "./ui/AppLayout";
import Start from "./ui/Start";
import NewTransaction from "./ui/NewTransaction";
import Wallet from "./ui/Wallet";
import Home from "./ui/Home";
import Me from "./ui/Me";
import Transactions from "./ui/Transactions";

init();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Start kycStatus=""/>} />
            {/* <Route path="/kyc" element={<KycStatus />} /> */}
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/home" element={<Home />} />
            <Route path="/me" element={<Me />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/new-transaction" element={<NewTransaction />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>,
);
