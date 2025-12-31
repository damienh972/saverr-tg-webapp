import React, { useState, ChangeEvent, FormEvent } from "react";
import { apiJson } from "../lib/api";

type TransactionDirection = "EURO_TO_RDC" | "RDC_TO_EURO";
type ModeOption = { value: string; label: string };
type FundsMode = "BANK_WIRE" | "MOBILE_MONEY" | "STABLE" | "CASH";

interface FormData {
  transactionDirection: TransactionDirection;
  isEscrow: boolean;
  amount: string;
  currency: "euro" | "usd" | "cdf" | "usdc" | "";
  depositMode: FundsMode | "";
  receiveMode: FundsMode | "";
}

interface TransactionSubmitResponse {
  ok: boolean;
  transaction_id?: string;
  message?: string;
  error?: string;
}

export default function TransactionForm() {
  const [formData, setFormData] = useState<FormData>({
    transactionDirection: "EURO_TO_RDC",
    isEscrow: false,
    amount: "",
    currency: "",
    depositMode: "",
    receiveMode: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get available deposit options based on transaction direction
  // Cash is only available for RDC_TO_EURO transactions on deposit
  const getDepositOptions = (): ModeOption[] => {
    const baseOptions: ModeOption[] = [
      { value: "BANK_WIRE", label: "Virement bancaire (IBAN)" },
      { value: "MOBILE_MONEY", label: "Mobile Money" },
      { value: "STABLE", label: "Stablecoin" },
    ];

    if (formData.transactionDirection === "RDC_TO_EURO") {
      return [{ value: "CASH", label: "Espèces" }, ...baseOptions];
    }
    return baseOptions;
  };

  // Get available receive options based on transaction direction
  // Cash is only available for EURO_TO_RDC transactions on receive
  const getReceiveOptions = (): ModeOption[] => {
    const baseOptions: ModeOption[] = [
      { value: "BANK_WIRE", label: "Virement bancaire (IBAN)" },
      { value: "MOBILE_MONEY", label: "Mobile Money" },
      { value: "STABLE", label: "Stablecoin" },
    ];

    if (formData.transactionDirection === "EURO_TO_RDC") {
      return [{ value: "CASH", label: "Espèces" }, ...baseOptions];
    }
    return baseOptions;
  };

  const handleChange = (
    field: keyof FormData,
    value: string | boolean
  ): void => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset deposit/receive modes if they become invalid after direction change
      if (field === "transactionDirection") {
        const depositOpts = getDepositOptions().map((o) => o.value);
        const receiveOpts = getReceiveOptions().map((o) => o.value);

        if (!depositOpts.includes(prev.depositMode as string)) {
          updated.depositMode = "";
        }
        if (!receiveOpts.includes(prev.receiveMode as string)) {
          updated.receiveMode = "";
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Veuillez saisir un montant valide");
      setLoading(false);
      return;
    }

    if (!formData.currency) {
      setError("Veuillez sélectionner une devise");
      setLoading(false);
      return;
    }

    if (!formData.depositMode || !formData.receiveMode) {
      setError("Veuillez sélectionner les modes de dépôt et réception");
      setLoading(false);
      return;
    }

    try {
      const response = await apiJson<TransactionSubmitResponse>(
        "/api/transaction/submit",
        {
          method: "POST",
          body: {
            type: formData.isEscrow ? "ESCROW" : "TRANSFER",
            direction: formData.transactionDirection,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            funds_in: formData.depositMode,
            funds_out: formData.receiveMode,
          },
        }
      );

      if (response.ok) {
        alert(`Demande envoyée avec succès ! ID: ${response.transaction_id}`);
        // Reset form
        setFormData({
          transactionDirection: "EURO_TO_RDC",
          isEscrow: false,
          amount: "",
          currency: "",
          depositMode: "",
          receiveMode: "",
        });
      } else {
        setError(response.error || "Erreur serveur");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    !formData.amount ||
    !formData.currency ||
    !formData.depositMode ||
    !formData.receiveMode ||
    loading;

  return (
    <div className="container">
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 18 }}>
          Nouvelle transaction
        </div>
        <div className="muted" style={{ marginBottom: 24 }}>
          Configurez votre transfert en quelques clics
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction direction and escrow option */}
          <div className="row" style={{ marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
                Type de transaction
              </div>
              <select
                className="form-select"
                value={formData.transactionDirection}
                onChange={(e) =>
                  handleChange(
                    "transactionDirection",
                    e.target.value as TransactionDirection
                  )
                }
                disabled={formData.isEscrow || loading}
                style={{ fontSize: 15 }}
              >
                <option value="EURO_TO_RDC">Euro → RDC</option>
                <option value="RDC_TO_EURO">RDC → Euro</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className="checkbox-wrapper" style={{ marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={formData.isEscrow}
                  onChange={(e) => handleChange("isEscrow", e.target.checked)}
                  disabled={loading}
                  style={{ width: 18, height: 18, accentColor: "#2d6cff" }}
                />
                <span
                  style={{ fontSize: 14, color: "#ff6b6b", marginLeft: 10 }}
                >
                  Avec séquestre
                </span>
              </label>
            </div>
          </div>

          {/* Amount input */}
          <div className="form-group">
            <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
              Montant à transférer
            </div>
            <input
              type="number"
              className="form-input"
              placeholder="Entrez un montant"
              value={formData.amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("amount", e.target.value)
              }
              min="0"
              step="0.01"
              disabled={loading}
              style={{ fontSize: 16 }}
            />
          </div>

          {/* Currency selection */}
          <div className="form-group">
            <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
              Devise
            </div>
            <select
              className="form-select"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              disabled={loading}
              style={{ fontSize: 16 }}
            >
              <option value="">Sélectionnez une devise</option>
              <option value="euro">Euro (EUR)</option>
              <option value="usd">Dollar américain (USD)</option>
              <option value="cdf">Franc congolais (CDF)</option>
              <option value="usdc">USD Coin (USDC)</option>
            </select>
          </div>

          {/* Deposit and receive modes */}
          <div className="row">
            <div style={{ flex: 1, marginRight: 12 }}>
              <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
                Mode de dépôt
              </div>
              <select
                className="form-select"
                value={formData.depositMode}
                onChange={(e) =>
                  handleChange("depositMode", e.target.value as FundsMode)
                }
                disabled={loading}
                style={{ fontSize: 16 }}
              >
                <option value="">Sélectionnez</option>
                {getDepositOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <div className="muted" style={{ fontSize: 14, marginBottom: 8 }}>
                Mode de réception
              </div>
              <select
                className="form-select"
                value={formData.receiveMode}
                onChange={(e) =>
                  handleChange("receiveMode", e.target.value as FundsMode)
                }
                disabled={loading}
                style={{ fontSize: 16 }}
              >
                <option value="">Sélectionnez</option>
                {getReceiveOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 12, color: "#ff9aa2", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={isSubmitDisabled}
            style={{
              marginTop: 24,
              fontWeight: 600,
              opacity: isSubmitDisabled ? 0.5 : 1,
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Envoi en cours…" : "Envoyer la demande"}
          </button>
        </form>
      </div>
    </div>
  );
}
