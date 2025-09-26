import { createClient } from '@supabase/supabase-js';
import type { CollabMember, CollabComment, CollabActivity, ObjID, CollabRole } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: true } }
);

const ok = <T>(rows: T[] | null | undefined) => Array.isArray(rows) ? rows : [];

export async function listMembers(objectiveId: ObjID): Promise<CollabMember[]> {
  const { data, error } = await supabase
    .from('objective_collab_members')
    .select('user_id:id, email, role, joined_at:joined_at')
    .eq('objective_id', objectiveId);
  if (error) throw error;
  return ok(data).map((r: any) => ({
    id: String(r.user_id),
    email: String(r.email ?? ''),
    role: r.role as CollabRole,
    joinedAt: String(r.joined_at ?? new Date().toISOString()),
  }));
}

export async function inviteMember(objectiveId: ObjID, email: string, role: CollabRole) {
  const { error } = await supabase.from('objective_collab_members').insert({
    objective_id: objectiveId, email, role,
  });
  if (error) throw error;
  await addActivity(objectiveId, 'invite', { email, role });
}

export async function removeMember(objectiveId: ObjID, email: string) {
  const { error } = await supabase
    .from('objective_collab_members')
    .delete()
    .eq('objective_id', objectiveId)
    .eq('email', email);
  if (error) throw error;
}

export async function listComments(objectiveId: ObjID): Promise<CollabComment[]> {
  const { data, error } = await supabase
    .from('objective_comments')
    .select('id, objective_id, author_id, author_email, body, created_at')
    .eq('objective_id', objectiveId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ok(data).map((r: any) => ({
    id: String(r.id),
    objectiveId: String(r.objective_id),
    authorId: String(r.author_id ?? ''),
    authorEmail: String(r.author_email ?? ''),
    body: String(r.body ?? ''),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  }));
}

export async function addComment(objectiveId: ObjID, body: string) {
  const { data: user } = await supabase.auth.getUser();
  const email = user?.user?.email ?? 'unknown';
  const authorId = user?.user?.id ?? 'unknown';
  const { error } = await supabase.from('objective_comments').insert({
    objective_id: objectiveId, author_id: authorId, author_email: email, body,
  });
  if (error) throw error;
  await addActivity(objectiveId, 'comment', { authorEmail: email });
}

export async function listActivity(objectiveId: ObjID): Promise<CollabActivity[]> {
  const { data, error } = await supabase
    .from('objective_activity')
    .select('id, objective_id, kind, data, created_at')
    .eq('objective_id', objectiveId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return ok(data).map((r: any) => ({
    id: String(r.id),
    objectiveId: String(r.objective_id),
    kind: r.kind,
    data: r.data ?? {},
    at: String(r.created_at ?? new Date().toISOString()),
  }));
}

export async function addActivity(objectiveId: ObjID, kind: CollabActivity['kind'], data: object) {
  const { error } = await supabase.from('objective_activity').insert({
    objective_id: objectiveId, kind, data,
  });
  if (error) throw error;
}