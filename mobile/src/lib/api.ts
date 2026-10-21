const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://ukhikers2.onrender.com/api'
).replace(/\/$/, '');

export type Trek = {
  _id: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  price?: number;
  duration?: string;
  difficulty?: string;
  location?: string;
  tags?: string[];
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export function resolveMediaUrl(path?: string) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  // The website stores some trek images as paths relative to the site root.
  const origin = API_BASE_URL.replace(/\/api$/, '');
  return `${origin}/${path.replace(/^\//, '')}`;
}

export async function getTreks(): Promise<Trek[]> {
  const response = await fetch(`${API_BASE_URL}/blogs`);
  if (!response.ok) {
    throw new Error(`Unable to load treks (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as ApiResponse<Trek[]>;
  if (!Array.isArray(result.data)) {
    throw new Error(result.message || 'The trek service returned an unexpected response.');
  }

  return result.data;
}

export async function getTrekById(id: string): Promise<Trek> {
  const response = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Unable to load this trek (HTTP ${response.status}).`);
  }

  const result = (await response.json()) as ApiResponse<Trek>;
  if (!result.data) {
    throw new Error(result.message || 'Trek not found.');
  }

  return result.data;
}
