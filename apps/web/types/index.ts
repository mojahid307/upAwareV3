/**
 * Shared domain types — mirror the Prisma enums + models from apps/api/prisma/schema.prisma.
 * Keeping these co-located in the frontend ensures the UI and API stay in sync.
 */

export enum Role {
  USER = "USER",
  VOLUNTEER = "VOLUNTEER",
  AUTHORITY = "AUTHORITY",
  ADMIN = "ADMIN",
}

export enum Category {
  TRAFFIC = "TRAFFIC",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  SAFETY = "SAFETY",
  HEALTH = "HEALTH",
  ENVIRONMENT = "ENVIRONMENT",
  CRIME = "CRIME",
  OTHER = "OTHER",
}

export enum Severity {
  EMERGENCY = "EMERGENCY",
  NORMAL = "NORMAL",
}

export enum Status {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  ward?: number | null;
  role: Role;
  isVolunteer: boolean;
  points: number;
}

/** Lightweight author projection embedded in feed/post responses. */
export interface Author {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  category: Category;
  severity: Severity;
  status: Status;
  lat: number;
  lng: number;
  address?: string | null;
  ward?: number | null;
  mediaUrls: string[];
  isAnon: boolean;
  aiAllowed: boolean;
  upvoteCount: number;
  author: Author;
  hasVoted?: boolean;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

/** Pin color derived from severity/status per the spec's Map Pin Logic table. */
export type PinColor = "red" | "amber" | "teal";

export function pinColorFor(post: {
  severity: Severity;
  status: Status;
}): PinColor {
  if (post.status === Status.RESOLVED) return "teal";
  if (post.severity === Severity.EMERGENCY) return "red";
  return "amber";
}
