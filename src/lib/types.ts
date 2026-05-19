export type MediaType = "video" | "pdf" | "image";

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  size: number;
  uploadedAt: string;
  lessonId?: string;
  previewUrl?: string;
}
