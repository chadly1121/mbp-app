import React from "react";
import { v4 as uuidv4 } from "uuid";

const getShares3 = () => {
  try {
    const raw = localStorage.getItem("shares");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const saveShares3 = (s: any) => localStorage.setItem("shares", JSON.stringify(s));

const getOrCreateToken = (cardId: string, mode: "viewer" | "editor") => {
  const s = getShares3();
  if (!s[cardId]) s[cardId] = { viewer: null, editor: null, accepted: [] };
  if (!s[cardId][mode]) s[cardId][mode] = uuidv4();
  saveShares3(s);
  return s[cardId][mode];
};

export function StrategicObjectiveCard({ id, title }: { id: string; title: string }) {
  const copyLink = (mode: "viewer" | "editor") => {
    const token = getOrCreateToken(id, mode);
    const url = `${window.location.origin}/share/${token}/${mode}`;
    navigator.clipboard.writeText(url);
    alert(`${mode} link copied!`);
  };
  return (
    <div className="border rounded p-3 mb-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="flex gap-2 mt-2">
        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => copyLink("viewer")}>
          Copy Viewer Link
        </button>
        <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => copyLink("editor")}>
          Copy Editor Link
        </button>
      </div>
    </div>
  );
}