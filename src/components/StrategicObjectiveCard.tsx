import React from "react";
import { getOrCreateToken } from "@/utils/shareUtils";
import { ShareMode } from "@/types/shares";

export function StrategicObjectiveCard({ id, title }: { id: string; title: string }) {
  const copyLink = (mode: ShareMode) => {
    const token = getOrCreateToken(id, mode);
    const url = `${window.location.origin}/shared/${token}/${mode}`;
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