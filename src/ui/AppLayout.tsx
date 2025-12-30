import React, { useEffect } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useMe } from "../hooks/useMe";
import Start from "./Start";
import Wallet from "./Wallet";

export default function AppLayout() {
  const loc = useLocation();
  const { user, loading, err } = useMe();

  // Initialize Telegram WebApp (expand view, mark as ready)
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    try {
      tg?.ready?.();
      tg?.expand?.();
    } catch { }
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 700 }}>Bienvenue chez Saverr</div>
          <div className="muted">Chargement…</div>
        </div>
      </div>
    );
  }

  // Error state (e.g., missing initData, backend offline)
  if (err) {
    return (
      <div className="container">
        <div className="card" style={{ color: "#ff9aa2" }}>
          Erreur: {err}
        </div>
      </div>
    );
  }

  const kyc = user?.kyc_status || "NOT_STARTED";
  const isApproved = kyc === "APPROVED";
  const hasWallet = !!user?.user_tw_eoa;

  // Step 1: KYC verification (NOT_STARTED / SUBMITTED / REJECTED / APPROVED)
  if (!isApproved) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 700 }}>Saverr, votre assistant personnalisé</div>
          <div className="muted">Étape 1/2 : Identification et vérifications</div>
        </div>
        <Start kycStatus={kyc} />
      </div>
    );
  }

  // Step 2: Wallet creation (if KYC approved but wallet missing)
  if (!hasWallet) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 700 }}>Saverr, votre assistant personnalisé</div>
          <div className="muted">Étape 2/2 : Création du portefeuille électronique</div>
        </div>
        <Wallet />
      </div>
    );
  }

  // Onboarding complete => normal navigation (Home / Me / Transactions)
  // Automatically redirect "/" and "/wallet" to /home
  if (loc.pathname === "/" || loc.pathname === "/wallet" || loc.pathname === "/kyc") {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Bienvenue chez Saverr</div>
            <div className="muted">KYC: {kyc}</div>
          </div>
          {loc.pathname !== "/home" && (
            <Link className="btn secondary" to="/home">
              Menu
            </Link>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
