"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { Search, X, Calendar } from "lucide-react";

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");

  // Extract unique tags and authors
  const { allTags, allAuthors } = useMemo(() => {
    const tagsSet = new Set<string>();
    const authorsSet = new Set<string>();

    posts.forEach((post) => {
      post.tags.forEach((tag) => tagsSet.add(tag));
      if (post.author) authorsSet.add(post.author);
    });

    return {
      allTags: Array.from(tagsSet).sort(),
      allAuthors: Array.from(authorsSet).sort(),
    };
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => post.tags.includes(tag));

      // Author filter
      const matchesAuthor =
        selectedAuthor === "" ||
        post.author === selectedAuthor;

      return matchesSearch && matchesTags && matchesAuthor;
    });

    // Sort posts by date (latest first)
    filtered.sort((a, b) => {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

    return filtered;
  }, [posts, searchQuery, selectedTags, selectedAuthor]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedAuthor("");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedTags.length > 0 ||
    selectedAuthor !== "";

  return (
    <div className="w-full">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4fc3f7]"
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[#1a2347]/60 border border-[#4fc3f7] text-white placeholder:text-white/50 focus:border-[#028bee] focus:outline-none focus:ring-2 focus:ring-[#028bee]/20 transition-all duration-300"
            style={{
              fontFamily: '"IBM Plex Mono"',
              fontSize: "16px",
              borderRadius: 0,
            }}
          />
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Tags Filter */}
          <div className="flex-1">
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm border transition-all duration-300 ${
                      selectedTags.includes(tag)
                        ? "bg-[#028bee] border-[#028bee] text-white"
                        : "bg-transparent border-[#4fc3f7] text-[#4fc3f7] hover:bg-[#4fc3f7]/10"
                    }`}
                    style={{
                      fontFamily: '"IBM Plex Mono"',
                      borderRadius: 0,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Author and Clear */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Author Filter Dropdown */}
            {allAuthors.length > 0 && (
              <div className="relative">
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 bg-[#1a2347] border border-[#4fc3f7] text-white focus:border-[#028bee] focus:outline-none focus:ring-2 focus:ring-[#028bee]/20 transition-all duration-300 cursor-pointer"
                  style={{
                    fontFamily: '"IBM Plex Mono"',
                    fontSize: "14px",
                    borderRadius: 0,
                  }}
                >
                  <option value="" style={{ backgroundColor: '#1a2347', color: 'white' }}>All Authors</option>
                  {allAuthors.map((author) => (
                    <option key={author} value={author} style={{ backgroundColor: '#1a2347', color: 'white' }}>
                      {author}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#4fc3f7]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-[#4fc3f7] border border-[#4fc3f7] hover:bg-[#4fc3f7] hover:text-white transition-all duration-300 whitespace-nowrap"
                style={{
                  fontFamily: '"IBM Plex Mono"',
                  fontSize: "14px",
                  borderRadius: 0,
                }}
              >
                <X size={16} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between pt-2 border-t border-[#4fc3f7]/20">
          <p
            className="text-white/70 text-sm"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 min-h-[320px] flex flex-col items-center justify-center">
          <Search size={48} className="text-[#4fc3f7]/30 mb-4" />
          <p
            className="text-white text-lg mb-2"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            No articles found
          </p>
          <p
            className="text-white/60 text-sm"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            Try different search terms or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative bg-gradient-to-b from-[#0a1930] to-[#1a2347] border-2 border-[#4fc3f7]/40 hover:border-[#4fc3f7]/70 transition-all duration-300 hover:shadow-lg hover:shadow-[#4fc3f7]/20 overflow-hidden flex flex-col"
            >
              {/* Cover Image or Placeholder */}
              {post.coverImage ? (
                <div className="w-full h-48 overflow-hidden border-b-2 border-[#4fc3f7]/40">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[#0a1930] via-[#1a2347] to-[#0a1930] border-b-2 border-[#4fc3f7]/40 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Grid Background Pattern */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, #4fc3f7 1px, transparent 1px),
                      linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    opacity: 0.15
                  }}></div>
                  
                  {/* Corner Decorations */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 text-3xl text-[#4fc3f7]">✦</div>
                    <div className="absolute bottom-4 right-4 text-3xl text-[#4fc3f7]">✦</div>
                  </div>
                  
                  {/* Main Content - Post Title */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-6">
                    {/* Brand Logo/Text */}
                    <div
                      className="text-sm font-bold text-[#4fc3f7]/60 tracking-wider"
                      style={{
                        fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                      }}
                    >
                      TOKAMAK zk-EVM
                    </div>
                    
                    {/* Post Title */}
                    <h3
                      className="text-lg font-bold text-[#4fc3f7] text-center line-clamp-3"
                      style={{
                        fontFamily: '"IBM Plex Mono"',
                        letterSpacing: '0.02rem',
                      }}
                    >
                      {post.title}
                    </h3>
                  </div>
                </div>
              )}

              {/* Content - Flex Grow */}
              <div className="p-6 flex flex-col flex-grow">
                {/* Tags - Always show below image */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-[#028bee] text-white"
                        style={{
                          fontFamily: '"IBM Plex Mono"',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2
                  className="text-2xl font-bold mb-3 text-[#4fc3f7] group-hover:text-[#29b6f6] transition-colors"
                  style={{
                    fontFamily: '"IBM Plex Mono"',
                  }}
                >
                  {post.title}
                </h2>

                {/* Description */}
                <p
                  className="text-white mb-4 line-clamp-3 flex-grow"
                  style={{
                    fontFamily: '"IBM Plex Mono"',
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  {post.description}
                </p>

                {/* Meta and Read More - Always at Bottom */}
                <div className="mt-auto">
                  {/* Meta */}
                  <div
                    className="flex items-center gap-4 text-sm text-[#4fc3f7]/70 mb-4"
                    style={{
                      fontFamily: '"IBM Plex Mono"',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {post.author && (
                      <>
                        <span>•</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>

                  {/* Read More */}
                  <div
                    className="inline-flex items-center gap-2 text-[#4fc3f7] group-hover:text-[#028bee] transition-all font-semibold"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    <span>Read more →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
