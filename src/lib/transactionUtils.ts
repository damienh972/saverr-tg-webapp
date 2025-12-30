/**
 * Escapes special Markdown characters to prevent formatting issues.
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

/**
 * Generates a random French IBAN for bank wire transfers.
 */
export function generateIBAN(): string {
  const checkDigits = Math.floor(Math.random() * 90) + 10;
  const bankCode = Math.floor(Math.random() * 9000) + 1000;
  const branchCode = Math.floor(Math.random() * 9000) + 1000;
  const accountNumber = Math.floor(Math.random() * 900000000000) + 100000000000;
  return `FR${checkDigits}${bankCode}${branchCode}${accountNumber
    .toString()
    .slice(0, 4)}${accountNumber.toString().slice(4, 8)}${accountNumber
      .toString()
      .slice(8, 12)}${Math.floor(Math.random() * 90) + 10}`;
}

/**
 * Generates a random Mobile Money phone number (DRC format).
 */
export function generateMobileMoneyNumber(): string {
  const prefix = Math.floor(Math.random() * 900) + 100;
  const middle = Math.floor(Math.random() * 900) + 100;
  const end = Math.floor(Math.random() * 900) + 100;
  return `+243 ${prefix} ${middle} ${end}`;
}

/**
 * Returns a random cash deposit address from predefined locations in Kinshasa.
 */
export function generateCashAddress(): string {
  const addresses = [
    "Avenue Kasa-Vubu, Immeuble Saverr, Bureau 12, Kinshasa/Gombe",
    "Boulevard du 30 Juin, Centre Commercial, Niveau 2, Kinshasa/Gombe",
    "Avenue Batetela, Agence Saverr, Kinshasa/Lingwala",
    "Route de Matadi, Point de Service Saverr, Kinshasa/Kalamu",
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}

/**
 * Generates user instructions for depositing funds based on the selected method.
 * Returns formatted Markdown text with specific details for each payment method.
 */
export function getFundsInInstructions(fundsIn: string): string {
  switch (fundsIn) {
    case "BANK_WIRE":
      const iban = generateIBAN();
      return `💳 *IBAN de transfert :*\n\`${escapeMarkdown(iban)}\`\n\nEffectuez votre virement vers cet IBAN pour finaliser votre transaction (cela peut prendre jusqu'à 2 jours ouvrés)`;
    case "MOBILE_MONEY":
      return `📱 *Bénéficiaire :*\n${generateMobileMoneyNumber()}\n\nEnvoyez les fonds à ce numéro Mobile Money.`;
    case "CASH":
      const address = generateCashAddress();
      return `📍 *Point de dépôt :*\nVeuillez vous rendre à :\n${address}\npour déposer vos fonds.`;
    case "CRYPTO":
      return `⏳ Transfert en cours de traitement.\nVous serez notifié dès la réception des fonds.`;
    default:
      return "";
  }
}

/**
 * Generates user instructions for receiving funds based on the selected method.
 * Uses provided IBAN or phone number if available, otherwise shows placeholder.
 */
export function getFundsOutInstructions(fundsOut: string, iban?: string, phone?: string): string {
  switch (fundsOut) {
    case "BANK_WIRE":
      const userIban = iban || "IBAN non disponible";
      return `💳 *Fonds envoyés sur votre compte :*\nIBAN : \`${escapeMarkdown(userIban)}\`\n\nLes fonds ont été transférés sur votre compte bancaire.`;
    case "MOBILE_MONEY":
      const userPhone = phone || "Numéro non disponible";
      return `📱 *Fonds envoyés :*\nLes fonds ont été envoyés sur votre numéro Mobile Money : ${userPhone}\n\nVérifiez votre solde dans quelques instants.`;
    case "CASH":
      return `✅ Notre partenaire vous remercie de votre visite.\nLes fonds ont été remis en espèces selon les modalités convenues.`;
    case "CRYPTO":
      return `🔐 *Fonds déposés dans votre coffre numérique.*\nVos cryptomonnaies sont disponibles dans votre portefeuille.`;
    default:
      return "";
  }
}

export const toUSDC = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 1_000_000));
};
