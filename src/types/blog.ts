export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  publishDate: string;
  tags: string[];
  coverImage?: string;
  author?: string;
  content?: string; // Markdown content
}

export interface NotionPage {
  id: string;
  properties: {
    Title: {
      title: Array<{ plain_text: string }>;
    };
    Slug: {
      rich_text: Array<{ plain_text: string }>;
    };
    Description: {
      rich_text: Array<{ plain_text: string }>;
    };
    Published: {
      checkbox: boolean;
    };
    PublishDate: {
      date: { start: string } | null;
    };
    Tags: {
      multi_select: Array<{ name: string }>;
    };
    CoverImage?: {
      files: Array<{ file?: { url: string }; external?: { url: string } }>;
    };
    Author?: {
      rich_text: Array<{ plain_text: string }>;
    };
  };
  cover?: {
    file?: { url: string };
    external?: { url: string };
  };
}

