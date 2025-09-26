/**
 * Type definitions for sharing functionality
 */
export interface ShareData {
  viewer: string | null;
  editor: string | null;
  accepted: string[];
}

export interface SharesStorage {
  [cardId: string]: ShareData;
}

export interface AcceptedShare {
  cardId: string;
  mode: 'viewer' | 'editor';
  token: string;
}

export type ShareMode = 'viewer' | 'editor';