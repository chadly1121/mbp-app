import { useEffect, useMemo, useState } from 'react';
import { listMembers, inviteMember, removeMember, listComments, addComment, listActivity, createInviteLink } from '@/lib/collab/api';
import type { ObjID, CollabMember, CollabComment, CollabRole, CollabActivity } from '@/lib/collab/types';
import { isList, safeTs } from '@/lib/safe';

type Props = { objectiveId: ObjID };

export default function CollaborationPanel({ objectiveId }: Props) {
  const [members, setMembers] = useState<CollabMember[]>([]);
  const [comments, setComments] = useState<CollabComment[]>([]);
  const [activity, setActivity] = useState<CollabActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setErr(null);
      const [m, c, a] = await Promise.all([
        listMembers(objectiveId), listComments(objectiveId), listActivity(objectiveId)
      ]);
      setMembers(isList<CollabMember>(m) ? m : []);
      setComments(isList<CollabComment>(c) ? c : []);
      setActivity(isList<CollabActivity>(a) ? a : []);
    } catch (e: any) {
      setErr(e?.message ?? 'Load error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [objectiveId]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollabRole>('editor');
  const canSubmitInvite = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  
  // Invite link state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollabRole>('viewer');
  const [inviteLink, setInviteLink] = useState<string>('');

  async function onInvite() {
    try { await inviteMember(objectiveId, email, role); setEmail(''); await refresh(); }
    catch (e: any) { setErr(e?.message ?? 'Invite failed'); }
  }
  async function onRemove(e: string) {
    try { await removeMember(objectiveId, e); await refresh(); }
    catch (err: any) { setErr(err?.message ?? 'Remove failed'); }
  }
  async function onAddComment(body: string) {
    if (!body.trim()) return;
    try { await addComment(objectiveId, body.trim()); await refresh(); }
    catch (e: any) { setErr(e?.message ?? 'Comment failed'); }
  }
  
  async function onCreateInvite() {
    if (!inviteEmail.trim()) return;
    try { 
      const link = await createInviteLink(objectiveId, inviteEmail.trim(), inviteRole); 
      setInviteLink(link);
      setErr(null);
    }
    catch (e: any) { setErr(e?.message ?? 'Invite link creation failed'); }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading collaborators…</div>;
  return (
    <div className="space-y-6">
      {err && <div className="text-red-600 text-sm">{err}</div>}

      {/* Members */}
      <section className="space-y-2">
        <h3 className="font-medium">Collaborators</h3>
        <div className="flex gap-2">
          <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="email@domain.com"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
          <select className="border rounded px-2 py-1 text-sm" value={role}
                  onChange={(e)=>setRole(e.target.value as CollabRole)}>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button className="rounded px-3 py-1 text-sm bg-black text-white disabled:opacity-50"
                  disabled={!canSubmitInvite} onClick={onInvite}>Invite</button>
        </div>
        <ul className="text-sm divide-y">
          {members.map(m => (
            <li key={m.id+m.email} className="py-2 flex items-center justify-between">
              <span>{m.email} · {m.role}</span>
              <button className="text-xs underline" onClick={()=>onRemove(m.email)}>Remove</button>
            </li>
          ))}
          {members.length === 0 && <li className="py-2 text-muted-foreground">No collaborators yet</li>}
        </ul>
        
        {/* Invite via link section */}
        <div className="space-y-2 pt-4 border-t">
          <div className="text-sm font-medium">Invite via Link</div>
          <div className="flex gap-2">
            <input 
              className="border rounded px-2 py-1 text-sm flex-1" 
              placeholder="email@domain.com"
              value={inviteEmail} 
              onChange={(e) => setInviteEmail(e.target.value)} 
            />
            <select 
              className="border rounded px-2 py-1 text-sm" 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value as CollabRole)}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button 
              className="rounded px-3 py-1 text-sm bg-black text-white disabled:opacity-50" 
              disabled={!inviteEmail.trim()}
              onClick={onCreateInvite}
            >
              Create Link
            </button>
          </div>
          {inviteLink && (
            <div className="text-xs break-all bg-gray-50 p-2 rounded">
              <div className="font-mono text-blue-600">{inviteLink}</div>
              <button 
                className="mt-1 text-blue-600 underline hover:text-blue-800" 
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  // Could show a toast here
                }}
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comments */}
      <section className="space-y-2">
        <h3 className="font-medium">Comments</h3>
        <CommentBox onSubmit={onAddComment} />
        <ul className="text-sm space-y-3">
          {comments.map(c => (
            <li key={c.id} className="border rounded p-2">
              <div className="text-xs text-muted-foreground">
                {c.authorEmail} · {renderDate(c.createdAt)}
              </div>
              <div>{c.body}</div>
            </li>
          ))}
          {comments.length === 0 && <li className="text-muted-foreground">No comments yet</li>}
        </ul>
      </section>

      {/* Activity */}
      <section className="space-y-2">
        <h3 className="font-medium">Activity</h3>
        <ul className="text-xs space-y-1">
          {activity.map(a => (
            <li key={a.id}>
              {renderDate(a.at)} · {a.kind}
            </li>
          ))}
          {activity.length === 0 && <li className="text-muted-foreground">No recent activity</li>}
        </ul>
      </section>
    </div>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [v, setV] = useState('');
  return (
    <div className="flex gap-2">
      <input className="border rounded px-2 py-1 text-sm flex-1"
             placeholder="Add a comment…" value={v} onChange={(e)=>setV(e.target.value)} />
      <button className="rounded px-3 py-1 text-sm bg-black text-white"
              onClick={()=>{ onSubmit(v); setV(''); }}>Post</button>
    </div>
  );
}

function renderDate(x: string | Date | null | undefined) {
  const ts = safeTs(x);
  if (ts == null) return '—';
  try { return new Date(ts).toLocaleString(); } catch { return '—'; }
}