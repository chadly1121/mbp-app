export type ObjID = string;
export type CollabRole = 'owner' | 'editor' | 'viewer';

export interface CollabMember {
  id: string;            // user id
  email: string;
  role: CollabRole;
  joinedAt: string;      // ISO
}

export interface CollabComment {
  id: string;
  objectiveId: ObjID;
  authorId: string;
  authorEmail: string;
  body: string;
  createdAt: string;     // ISO
}

export interface CollabActivity {
  id: string;
  objectiveId: ObjID;
  kind: 'invite' | 'comment' | 'status';
  data: Record<string, unknown>;
  at: string;            // ISO
}