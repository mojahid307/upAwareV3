import axios, { AxiosError, type AxiosInstance } from "axios";
import type { ApiError, AuthResponse, Post, User, Comment, LeaderboardUser, WardInfo } from "@/types";
import { MOCK_POSTS, MOCK_CURRENT_USER, MOCK_COMMENTS, MOCK_LEADERBOARD, MOCK_WARDS } from "@/lib/mock-data";
import { Category, Severity, Status } from "@/types";
import type { FeedSort } from "@/lib/domain";

/**
 * API base + mock-mode flag.
 * When NEXT_PUBLIC_API_URL is unset, the client serves mock data locally so the
 * frontend is fully demoable without a backend.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export const IS_MOCK = API_URL.length === 0;

export interface FeedQuery {
  ward?: number;
  category?: Category;
  severity?: Severity;
  status?: Status;
  sort?: FeedSort;
  page?: number;
  limit?: number;
}

/** Extract the spec's standard { error, code } payload from any axios failure. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError && err.response?.data) {
    return err.response.data as ApiError;
  }
  return { error: "Something went wrong. Please try again.", code: "NETWORK" };
}

/** Lazily-created axios instance — only built when a real API URL exists. */
let _client: AxiosInstance | null = null;
function client(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: API_URL,
      headers: { "Content-Type": "application/json" },
    });
    // Attach JWT from localStorage on every request.
    _client.interceptors.request.use((config) => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("ua_access") : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
  return _client;
}

/* ----------------------------- Posts API ----------------------------- */

const SORT_FNS: Record<FeedSort, (a: Post, b: Post) => number> = {
  hot: (a, b) => b.upvoteCount - a.upvoteCount,
  new: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  top: (a, b) => b.upvoteCount - a.upvoteCount,
};

export async function fetchPosts(query: FeedQuery = {}): Promise<Post[]> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().get<Post[]>("/posts", { params: query });
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn("[api] Backend unreachable or failed. Falling back to local mock data.", err);
    }
  }
  await delay(350);
  let list = [...MOCK_POSTS];
  if (query.ward != null) list = list.filter((p) => p.ward === query.ward);
  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.severity) list = list.filter((p) => p.severity === query.severity);
  if (query.status) list = list.filter((p) => p.status === query.status);
  list.sort(SORT_FNS[query.sort ?? "hot"]);
  return list;
}

export async function fetchPost(id: string): Promise<Post> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().get<Post>(`/posts/${id}`);
      if (data) return data;
    } catch (err) {
      console.warn("[api] Backend post query failed. Falling back to mock post.", err);
    }
  }
  await delay(250);
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) throw { response: { status: 404, data: { error: "Post not found", code: "NOT_FOUND" } } };
  return post;
}

export interface CreatePostInput {
  title: string;
  body: string;
  category: Category;
  severity: Severity;
  lat: number;
  lng: number;
  address?: string;
  ward?: number;
  isAnon: boolean;
  aiAllowed: boolean;
  mediaUrls?: string[];
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  if (IS_MOCK) {
    await delay(500);
    const now = new Date().toISOString();
    const newPost: Post = {
      id: `post_${Date.now()}`,
      ...input,
      address: input.address ?? null,
      ward: input.ward ?? null,
      mediaUrls: input.mediaUrls ?? [],
      status: Status.OPEN,
      upvoteCount: 0,
      author: {
        id: input.isAnon ? "anon" : MOCK_CURRENT_USER.id,
        name: input.isAnon ? "Anonymous" : MOCK_CURRENT_USER.name,
      },
      hasVoted: false,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    MOCK_POSTS.unshift(newPost);
    return newPost;
  }
  const { data } = await client().post<Post>("/posts", input);
  return data;
}

export async function updatePostStatus(
  id: string,
  status: Status,
  resolvedNote?: string
): Promise<Post> {
  if (IS_MOCK) {
    await delay(300);
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (!post) throw new Error("Post not found");
    post.status = status;
    post.updatedAt = new Date().toISOString();
    return post;
  }
  const { data } = await client().patch<Post>(`/posts/${id}`, { status, resolvedNote });
  return data;
}

export async function toggleVote(postId: string): Promise<{ upvoteCount: number; hasVoted: boolean }> {
  if (IS_MOCK) {
    await delay(150);
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");
    post.hasVoted = !post.hasVoted;
    post.upvoteCount += post.hasVoted ? 1 : -1;
    return { upvoteCount: post.upvoteCount, hasVoted: post.hasVoted };
  }
  const { data } = await client().post(`/posts/${postId}/vote`);
  return data;
}

/* ----------------------------- Comments API ----------------------------- */

export async function fetchComments(postId: string): Promise<Comment[]> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().get<Comment[]>(`/posts/${postId}/comments`);
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn("[api] Failed to fetch comments from backend. Falling back to mock comments.", err);
    }
  }
  await delay(300);
  return MOCK_COMMENTS[postId] || [];
}

export async function createComment(
  postId: string,
  input: { body: string; isAnon?: boolean; parentId?: string | null }
): Promise<Comment> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().post<Comment>(`/posts/${postId}/comments`, input);
      if (data) return data;
    } catch (err) {
      console.warn("[api] Failed to post comment to backend. Falling back to local mock.", err);
    }
  }
  await delay(350);
  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    body: input.body,
    isAnon: !!input.isAnon,
    postId,
    parentId: input.parentId || null,
    author: input.isAnon
      ? { id: "anon", name: "Anonymous" }
      : { id: MOCK_CURRENT_USER.id, name: MOCK_CURRENT_USER.name, isVolunteer: MOCK_CURRENT_USER.isVolunteer },
    createdAt: new Date().toISOString(),
    replies: [],
  };

  if (!MOCK_COMMENTS[postId]) {
    MOCK_COMMENTS[postId] = [];
  }

  if (input.parentId) {
    const parent = MOCK_COMMENTS[postId].find((c) => c.id === input.parentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(newComment);
    } else {
      MOCK_COMMENTS[postId].push(newComment);
    }
  } else {
    MOCK_COMMENTS[postId].push(newComment);
  }

  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (post) {
    post.commentCount = (post.commentCount || 0) + 1;
  }

  return newComment;
}

export async function deleteComment(id: string): Promise<void> {
  if (!IS_MOCK) {
    try {
      await client().delete(`/comments/${id}`);
      return;
    } catch (err) {
      console.warn("[api] Delete comment on backend failed. Updating local mock.", err);
    }
  }
  await delay(200);
  Object.keys(MOCK_COMMENTS).forEach((postId) => {
    MOCK_COMMENTS[postId] = MOCK_COMMENTS[postId].filter((c) => c.id !== id);
  });
}

/* ----------------------------- AI Suggestions API ----------------------------- */

export async function getAISuggestions(postId: string): Promise<string[]> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().post<{ suggestions: string[] }>(`/posts/${postId}/ai-suggest`);
      if (data?.suggestions) return data.suggestions;
    } catch (err) {
      console.warn("[api] AI suggestions API call failed. Using heuristic fallback.", err);
    }
  }
  await delay(800);
  const post = MOCK_POSTS.find((p) => p.id === postId);
  const wardText = post?.ward ? `Ward ${post.ward}` : "local ward";
  return [
    `File an official grievance with the City Corporation (DSCC/DNCC) engineering division attaching photos and referencing ${wardText}.`,
    `Submit a formal request to the Ward Councillor's office to inspect and include this section in the municipal maintenance schedule.`,
    `Mobilize local community volunteers to document impacts and coordinate with nearby beat officers and relevant utilities (WASA/BRTA).`
  ];
}

/* ----------------------------- Ward & Leaderboard API ----------------------------- */

export async function fetchLeaderboard(ward?: number): Promise<LeaderboardUser[]> {
  if (!IS_MOCK) {
    try {
      const { data } = await client().get<LeaderboardUser[]>("/users/leaderboard", {
        params: { ward },
      });
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn("[api] Leaderboard fetch failed. Falling back to mock leaderboard.", err);
    }
  }
  await delay(300);
  let list = [...MOCK_LEADERBOARD];
  if (ward != null) {
    list = list.filter((u) => u.ward === ward);
  }
  return list;
}

export async function fetchWardInfo(wardNumber: number): Promise<WardInfo> {
  if (IS_MOCK) {
    await delay(200);
    const found = MOCK_WARDS.find((w) => w.wardNumber === wardNumber);
    if (found) return found;
    return {
      wardNumber,
      name: `Dhaka Ward ${wardNumber}`,
      areaNames: [`Dhaka Sector / Area ${wardNumber}`],
      totalPosts: 14,
      openIssues: 8,
      resolvedIssues: 6,
      councillorOffice: `Ward ${wardNumber} Councillor Community Centre, Dhaka`,
      emergencyPhone: "01700-000000",
    };
  }
  // Construct from posts or mock
  const posts = await fetchPosts({ ward: wardNumber });
  return {
    wardNumber,
    name: `Ward ${wardNumber}`,
    areaNames: [`Ward ${wardNumber} Area`],
    totalPosts: posts.length,
    openIssues: posts.filter((p) => p.status === Status.OPEN).length,
    resolvedIssues: posts.filter((p) => p.status === Status.RESOLVED).length,
  };
}

/* ----------------------------- Auth & Profile API ----------------------------- */

export async function register(input: {
  name: string;
  email: string;
  password: string;
  ward?: number;
}): Promise<AuthResponse> {
  if (IS_MOCK) {
    await delay(600);
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { ...MOCK_CURRENT_USER, name: input.name, email: input.email, ward: input.ward ?? null },
    };
  }
  const { data } = await client().post<AuthResponse>("/auth/register", input);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  if (IS_MOCK) {
    await delay(500);
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: MOCK_CURRENT_USER,
    };
  }
  const { data } = await client().post<AuthResponse>("/auth/login", input);
  return data;
}

export async function fetchMe(): Promise<User> {
  if (IS_MOCK) {
    await delay(150);
    return MOCK_CURRENT_USER;
  }
  const { data } = await client().get<User>("/users/me");
  return data;
}

export async function updateProfile(input: {
  name?: string;
  ward?: number | null;
  isVolunteer?: boolean;
}): Promise<User> {
  if (IS_MOCK) {
    await delay(300);
    Object.assign(MOCK_CURRENT_USER, input);
    return { ...MOCK_CURRENT_USER };
  }
  const { data } = await client().patch<User>("/users/me", input);
  return data;
}

/* ----------------------------- helpers ----------------------------- */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
