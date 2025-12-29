import { useEffect, useState } from "react";
import { apiJson } from "../lib/api";
import { getLaunchSafe } from "../lib/tma";

export type MeUser = {
  id: string;
  telegram_user_id?: string;
  kyc_status?: "NOT_STARTED" | "SUBMITTED" | "APPROVED" | "REJECTED" | string;
  user_tw_eoa?: string | null;
  iban?: string | null;
  phone?: string | null;
};

export function useMe() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setErr(null);
      const r = await apiJson<{ user: MeUser | null }>("/api/me");
      setUser(r.user);
      setLoading(false);
    } catch (e: any) {
      setErr(e.message || "Erreur");
      setLoading(false);
    }
  };

  // Initialize and set up polling as fallback if WebSocket fails
  useEffect(() => {
    refresh();
    const pollId = setInterval(refresh, 15000); // Poll every 15 seconds
    return () => clearInterval(pollId);
  }, []);

  // WebSocket connection for real-time updates (KYC status, wallet changes)
  useEffect(() => {
    const launch = getLaunchSafe();
    const initDataRaw = String(launch.initDataRaw ?? "");
    if (!initDataRaw) return;

    const WS_BASE = import.meta.env.VITE_WS_BASE_URL;
    const wsUrl = `${WS_BASE}/ws?initData=${encodeURIComponent(initDataRaw)}`;
    const ws = new WebSocket(wsUrl);

    ws.onerror = (e) => console.error("WS error", e);

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        // Refresh user data when KYC or wallet status changes
        if (data?.type === "kyc_updated" || data?.type === "wallet_updated") {
          refresh();
        }
      } catch { }
    };

    return () => ws.close();
  }, []);

  return { user, loading, err, refresh };
}
