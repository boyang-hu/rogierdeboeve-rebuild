export type MediaItem = {
  src: string;
  alt: string;
  type: "image" | "video";
  size: {
    width: string;
    height: string;
  };
};

export type Project = {
  id: string;
  data: {
    active?: boolean;
    title: string;
    slug: string;
    date: string;
    url?: string;
    thumbnail: {
      src: string;
      alt: string;
      type?: "jpg" | "webp" | "mp4";
      darkness?: number;
      darknessColor?: string;
      saturation?: number;
      mouseLightness?: number;
    };
    colors: {
      primary: string;
      secondary: string;
      media?: string;
      invert?: string;
      blocks?: string;
    };
    content: MediaItem[];
    ambient?: number;
    contrast?: number;
    saturation?: number;
    darkenOverview?: number;
    darkenDetail?: number;
    client?: string;
    agency?: string;
    year?: string;
    role?: string;
    description: string;
  };
};

export type AwardGroup = {
  id: string;
  data: {
    title: string;
    items: Array<{
      title: string;
      type: string;
      year: string;
    }>;
  };
};
