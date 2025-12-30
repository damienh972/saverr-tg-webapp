import React, { useEffect, useState } from "react";
import { apiJson } from "../lib/api";

type MeResp = {
  user: any | null;
};

export default function Me() {
  const [data, setData] = useState<MeResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiJson<MeResp>("/api/me")
      .then(setData)
      .catch((e) => setErr(e.message ?? "Erreur"));
  }, []);

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Mes informations</div>
      {err && <div style={{ color: "#ff9aa2" }}>{err}</div>}
      {!data && !err && <div className="muted">Chargement…</div>}
      {data?.user && (
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
          {JSON.stringify(data.user, null, 2)}
        </pre>
      )}
      {data?.user === null && (
        <div className="muted">Vous n'avez pas encore de compte</div>
      )}
    </div>
  );
}
