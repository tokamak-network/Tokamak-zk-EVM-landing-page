import type { ExtendedRecordMap } from "notion-types";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: string; // "Prod" or "Staging"
  publishDate: string;
  tags: string[];
  coverImage?: string;
  author?: string;
  recordMap?: ExtendedRecordMap; // Full page content for react-notion-x
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
      select: { name: string } | null;
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
