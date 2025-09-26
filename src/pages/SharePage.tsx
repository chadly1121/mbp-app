import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const getShares = () => JSON.parse(localStorage.getItem("shares") || "{}");
const saveShares = (s: any) => localStorage.setItem("shares", JSON.stringify(s));

const acceptShare = (token: string, mode: "viewer"|"editor", cardId: string) => {
  const shares = getShares();
  if (!shares[cardId]) return;
  if (!shares[cardId].accepted) shares[cardId].accepted = [];
  if (!shares[cardId].accepted.includes(token)) {
    shares[cardId].accepted.push(token);
    saveShares(shares);
  }
};

export default function SharePage() {
  const { token, mode } = useParams();
  const navigate = useNavigate();
  const shares = getShares();
  let foundCardId: string | null = null;

  for (const [cardId, data] of Object.entries<any>(shares)) {
    if (data?.viewer === token || data?.editor === token) {
      // token must match mode as well
      const isViewer = data.viewer === token && mode === "viewer";
      const isEditor = data.editor === token && mode === "editor";
      if (isViewer || isEditor) {
        foundCardId = cardId;
        acceptShare(token!, mode as "viewer"|"editor", cardId);
        break;
      }
    }
  }

  if (!foundCardId) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Invalid or revoked link</h2>
        <button className="underline text-blue-600" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === "editor" ? "Editing" : "Viewing"} Objective #{foundCardId}
      </h2>
      {mode === "editor" ? (
        <textarea className="w-full h-32 border rounded p-2" placeholder="Edit content..." />
      ) : (
        <p className="text-gray-700">Read-only mode</p>
      )}
      <Link className="underline text-blue-600" to="/my-shares">Go to My Shares</Link>
    </div>
  );
}