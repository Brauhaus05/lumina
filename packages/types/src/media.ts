export interface MediaMetadata {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  cloudinaryPublicId?: string;
}

export interface Media {
  id: string;
  tenant_id: string;
  url: string;
  alt_text: string | null;
  metadata: MediaMetadata | null;
}

export type MediaInsert = Omit<Media, 'id'>;
