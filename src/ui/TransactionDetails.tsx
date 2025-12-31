import React, { useState } from "react";
import { TransferButton } from "./TransferButton";
import { updateTransactionStatus } from "../lib/api";
import { apiJson } from "../lib/api";
import { getFundsInInstructions, getFundsOutInstructions } from "../lib/transactionUtils";

type Tx = {
  id: string;
  reference?: string;
  amount: number;
  currency?: string;
  status?: string;
  created?: string;
  funds_in?: string;
  funds_out?: string;
  iban?: string;
  phone?: string;
};

type Props = {
  tx: Tx;
  onClose: () => void;
  onUpdated: (tx: Tx) => void; // Callback to update the transaction list
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Créée",
  PROCESSING: "En cours",
  DEPOSITED: "dépot effectué",
  TRANSFERRED: "transfer effectué",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

function formatStatus(status?: string) {
  if (!status) return "Inconnu";
  return STATUS_LABELS[status] || status;
}

export default function TransactionDetails({ tx, onClose, onUpdated }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleStatusChange(status: "PROCESSING" | "CANCELLED" | "TRANSFERRED") {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateTransactionStatus(tx.id, status);
      onUpdated(updated.transaction ?? updated);
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const simulateDeposit = async (txId: string) => {
    if (isSimulating) return;

    setIsSimulating(true);
    try {
      await apiJson(`/api/transaction/${txId}/simulate_deposit`, {
        method: "POST"
      });
    } catch (error) {
      console.error("❌ Simulation échouée:", error);
    }
  };

  return (
    <div className="card" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>Détails de la transaction</div>
          <button onClick={onClose}>✖</button>
        </div>

        {error && <div style={{ color: "#ff9aa2", marginBottom: 8 }}>{error}</div>}

        <div style={{ marginBottom: 6 }}>Référence : <b>{tx.reference ?? tx.id}</b></div>
        <div style={{ marginBottom: 6 }}>
          Montant : {tx.amount ?? "—"} {tx.currency ?? ""}
        </div>
        <div style={{ marginBottom: 6 }}>
          Statut : <span className="badge">{formatStatus(tx.status)}</span>
        </div>
        <div style={{ marginBottom: 6 }}>
          Créée le : <span className="muted">{tx.created || ""}</span>
        </div>

        {tx.status === "CREATED" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <p>Votre demande de transaction est en cours de traitement.</p>
          </div>
        )}

        {tx.status === "PROCESSING" && tx.funds_in && (
          <div className="card" style={{ marginTop: 16, padding: 12, background: "#f8f9fa" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Instructions de dépôt</div>
            <pre style={{
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              whiteSpace: "pre-wrap",
              lineHeight: 1.4
            }}>
              {getFundsInInstructions(tx.funds_in)}
            </pre>
            <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
              Copiez ces informations et effectuez le dépôt
            </div>
            <button
              style={{
                marginTop: 12,
                opacity: isSimulating ? 0.5 : 1,
                cursor: isSimulating ? "not-allowed" : "pointer" }}
              className="btn"
              disabled={isSimulating}
              onClick={() => simulateDeposit(tx.id)}
            >
              {isSimulating ? "dépot effectué" : "Simuler le dépôt"}
            </button>
          </div>
        )}

        {tx.status === "DEPOSITED" && (
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <TransferButton amount={tx.amount} callback={handleStatusChange} />
          </div>
        )}

        {tx.status === "COMPLETED" && tx.funds_out && (
          <div className="card" style={{ marginTop: 16, padding: 12, background: "#f0f9f0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>🎉 Instructions de retrait</div>
            <pre style={{
              background: "#fff",
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
              whiteSpace: "pre-wrap",
              lineHeight: 1.4
            }}>
              {getFundsOutInstructions(tx.funds_out, tx.iban, tx.phone)}
            </pre>
          </div>
        )}

        {loading && <div className="muted" style={{ marginTop: 8 }}>Traitement en cours…</div>}
      </div>
    </div>
  );
}
