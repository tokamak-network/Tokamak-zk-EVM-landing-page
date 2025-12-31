"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BlogContextValue {
  slug: string;
  title: string;
  authorEmail?: string;
  author?: string;
}

interface GlobalBlogContextValue {
  blogData: BlogContextValue | null;
  setBlogData: (data: BlogContextValue | null) => void;
}

const GlobalBlogContext = createContext<GlobalBlogContextValue>({
  blogData: null,
  setBlogData: () => {},
});

// Provider that wraps the entire app (in layout.tsx)
export function GlobalBlogProvider({ children }: { children: ReactNode }) {
  const [blogData, setBlogData] = useState<BlogContextValue | null>(null);

  return (
    <GlobalBlogContext.Provider value={{ blogData, setBlogData }}>
      {children}
    </GlobalBlogContext.Provider>
  );
}

// Hook for ChatWidget to read blog data
export function useBlogContext(): BlogContextValue | null {
  const { blogData } = useContext(GlobalBlogContext);
  return blogData;
}

// Component to set blog data (used in blog pages)
interface BlogDataSetterProps {
  slug: string;
  title: string;
  authorEmail?: string;
  author?: string;
}

export function BlogDataSetter({ slug, title, authorEmail, author }: BlogDataSetterProps) {
  const { setBlogData } = useContext(GlobalBlogContext);

  useEffect(() => {
    // Set blog data when component mounts
    setBlogData({ slug, title, authorEmail, author });
    
    // Clear blog data when component unmounts (leaving blog page)
    return () => {
      setBlogData(null);
    };
  }, [slug, title, authorEmail, author, setBlogData]);

  return null; // This component doesn't render anything
}

// Legacy BlogProvider for backwards compatibility (wraps children)
interface BlogProviderProps {
  children: ReactNode;
  slug: string;
  title: string;
  authorEmail?: string;
  author?: string;
}

export function BlogProvider({
  children,
  slug,
  title,
  authorEmail,
  author,
}: BlogProviderProps) {
  return (
    <>
      <BlogDataSetter slug={slug} title={title} authorEmail={authorEmail} author={author} />
      {children}
    </>
  );
}
