import { retrieveLaunchParams, requestContact } from "@tma.js/sdk";

export type TmaLaunch = {
  initDataRaw: string | unknown;
  initData?: ReturnType<typeof retrieveLaunchParams>["initData"];
  user?: { id: number; first_name?: string; last_name?: string; username?: string };
};

/**
 * Safely retrieves Telegram Mini App launch parameters.
 * Tries the SDK method first, falls back to window.Telegram.WebApp if unavailable.
 */
export function getLaunchSafe() {
  try {
    const { initDataRaw, initData } = retrieveLaunchParams();
    if (initDataRaw) {
      // Handle both function and direct property access for user data
      return { initDataRaw, initData, user: (initData as any)?.user?.() ?? (initData as any)?.user };
    }
  } catch (e) { 
    console.log("Failed to retrieve TMA launch params:", e);
  }

  // Fallback to legacy Telegram WebApp API
  const tg = (window as any).Telegram?.WebApp;
  const initDataRaw = tg?.initData;
  const user = tg?.initDataUnsafe?.user;

  return {
    initDataRaw: initDataRaw || "",
    initData: undefined,
    user: user ? { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username } : undefined,
  };
}

export async function requestContactSafe() {
  return requestContact();
}
