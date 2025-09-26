import { v4 as uuidv4 } from "uuid";
import { SharesStorage, ShareMode } from "@/types/shares";
import { logger } from "@/utils/logger";

/**
 * Safely retrieve shares from localStorage with error handling
 */
export const safeGetShares = (): SharesStorage => {
  try {
    const raw = localStorage.getItem("shares");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    logger.error("Failed to parse shares from localStorage", error);
    return {};
  }
};

/**
 * Safely save shares to localStorage with error handling
 */
export const safeSaveShares = (shares: SharesStorage): void => {
  try {
    localStorage.setItem("shares", JSON.stringify(shares));
  } catch (error) {
    logger.error("Failed to save shares to localStorage", error);
  }
};

/**
 * Get existing token or create new one for sharing
 */
export const getOrCreateToken = (cardId: string, mode: ShareMode): string => {
  const shares = safeGetShares();
  
  if (!shares[cardId]) {
    shares[cardId] = { viewer: null, editor: null, accepted: [] };
  }
  
  if (!shares[cardId][mode]) {
    shares[cardId][mode] = uuidv4();
    safeSaveShares(shares);
  }
  
  return shares[cardId][mode]!;
};

/**
 * Accept a share invite
 */
export const acceptShare = (token: string, mode: ShareMode, cardId: string): void => {
  const shares = safeGetShares();
  
  if (!shares[cardId]) return;
  
  if (!shares[cardId].accepted) {
    shares[cardId].accepted = [];
  }
  
  if (!shares[cardId].accepted.includes(token)) {
    shares[cardId].accepted.push(token);
    safeSaveShares(shares);
  }
};

/**
 * Revoke a share by removing token
 */
export const revokeShare = (cardId: string, token: string): void => {
  const shares = safeGetShares();
  const data = shares[cardId];
  
  if (!data) return;
  
  if (data.viewer === token) data.viewer = null;
  if (data.editor === token) data.editor = null;
  
  data.accepted = (data.accepted || []).filter((t: string) => t !== token);
  safeSaveShares(shares);
};