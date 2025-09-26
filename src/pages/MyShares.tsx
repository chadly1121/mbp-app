import React from "react";
import { Link } from "react-router-dom";

const getShares = () => {
  try {
    const raw = localStorage.getItem("shares");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("shares parse error", e);
    return {};
  }
};
const saveShares = (s: any) => {
  try {
    localStorage.setItem("shares", JSON.stringify(s));
  } catch (e) {
    console.error("shares save error", e);
  }
};

export default function MyShares() {
  const [tick, setTick] = React.useState(0);
  const shares = getShares();
  const accepted: { cardId: string; mode: "viewer" | "editor"; token: string }[] = [];

  for (const [cardId, data] of Object.entries<any>(shares)) {
    const acc = Array.isArray(data.accepted) ? data.accepted : [];
    acc.forEach((token: string) => {
      const mode =
        data.viewer === token ? "viewer" : data.editor === token ? "editor" : null;
      if (mode) accepted.push({ cardId, mode, token });
    });
  }

  const revoke = (cardId: string, token: string) => {
    const s = getShares();
    const data = s[cardId];
    if (!data) return;
    if (data.viewer === token) data.viewer = null;
    if (data.editor === token) data.editor = null;
    data.accepted = (data.accepted || []).filter((t: string) => t !== token);
    saveShares(s);
    setTick((n) => n + 1);
  };

  if (!accepted.length) return <p className="p-6">No shares accepted yet.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">My Shared Objectives</h2>
      <ul className="space-y-2">
        {accepted.map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <Link className="underline text-blue-600" to={`/share/${s.token}/${s.mode}`}>
              Objective #{s.cardId} ({s.mode})
            </Link>
            <button
              onClick={() => revoke(s.cardId, s.token)}
              className="text-red-600 underline text-sm"
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}