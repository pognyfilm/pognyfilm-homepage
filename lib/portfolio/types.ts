export type PortfolioStatus = "draft" | "published" | "hidden";
export type PortfolioImageStage = "before" | "during" | "after" | "general";

export type PortfolioImage = {
  id?: string;
  storage_path: string;
  public_url?: string;
  alt_text: string | null;
  stage: PortfolioImageStage;
  caption: string | null;
  sort_order: number;
};

export type PortfolioItem = {
  id: string;
  slug: string;
  title: string;
  region: string | null;
  place: string | null;
  category: string | null;
  installation_type: string | null;
  product: string | null;
  installation_date: string | null;
  summary: string | null;
  description: string | null;
  blog_url: string | null;
  youtube_url: string | null;
  cover_image_path: string | null;
  cover_image_alt_text: string | null;
  before_title: string | null;
  before_description: string | null;
  during_title: string | null;
  during_description: string | null;
  after_title: string | null;
  after_description: string | null;
  cover_public_url?: string;
  status: PortfolioStatus;
  is_featured: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  portfolio_images?: PortfolioImage[];
  tags?: string[];
};

export type PortfolioSaveInput = {
  id: string;
  title: string;
  category: string;
  installationType: string;
  product: string;
  description: string;
  blogUrl: string;
  youtubeUrl: string;
  coverImagePath: string;
  beforeTitle: string;
  beforeDescription: string;
  duringTitle: string;
  duringDescription: string;
  afterTitle: string;
  afterDescription: string;
  status: PortfolioStatus;
  isFeatured: boolean;
  sortOrder: number;
  tags: string[];
  images: PortfolioImage[];
  removedStoragePaths: string[];
};
