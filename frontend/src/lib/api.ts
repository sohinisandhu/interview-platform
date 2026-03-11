import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL, timeout: 90000 });

// ─── Request: attach token ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: handle 401, token refresh ──────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const orig = error.config as any;
    if (error.response?.status === 401 && !orig._retry) {
      if ((error.response.data as any)?.code === "TOKEN_EXPIRED") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
            .then((token) => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); })
            .catch((err) => Promise.reject(err));
        }
        orig._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          api.defaults.headers.Authorization = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          orig.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(orig);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      localStorage.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  updatePreferences: (data: any) => api.patch("/auth/preferences", data),
};

// ─── Resume ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("resume", file);
    return api.post("/resume/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    });
  },
  analyze: (data: { resumeId: string; jobDescription: string; jobRole: string }) =>
    api.post("/resume/analyze", data),
  getAll: () => api.get("/resume"),
  getById: (id: string) => api.get(`/resume/${id}`),
  delete: (id: string) => api.delete(`/resume/${id}`),
};

// ─── Interview ─────────────────────────────────────────────────────────────────
export const interviewAPI = {
  start: (data: {
    resumeId?: string; jobRole: string; jobDescription?: string;
    mode: string; resumeAnalysis?: any;
  }) => api.post("/interview/start", data),
  submitAnswer: (sessionId: string, data: {
    questionIndex: number; answerText: string; timeTakenSeconds?: number; audioUrl?: string;
  }) => api.post(`/interview/${sessionId}/answer`, data),
  complete: (sessionId: string) => api.post(`/interview/${sessionId}/complete`),
  getSession: (sessionId: string) => api.get(`/interview/${sessionId}`),
  abandon: (sessionId: string) => api.patch(`/interview/${sessionId}/abandon`),
};

// ─── Speech ────────────────────────────────────────────────────────────────────
export const speechAPI = {
  transcribe: (audioBlob: Blob) => {
    const form = new FormData();
    form.append("audio", audioBlob, "recording.webm");
    return api.post("/speech/transcribe", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ─── History ───────────────────────────────────────────────────────────────────
export const historyAPI = {
  getAll: (params?: { page?: number; limit?: number; mode?: string }) =>
    api.get("/history", { params }),
  getStats: () => api.get("/history/stats"),
  getDetail: (id: string) => api.get(`/history/${id}`),
};

export default api;
