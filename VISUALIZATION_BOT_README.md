# AI Visualization Bot

An automated system that generates visual explanations (infographics, diagrams, cartoons, and summary cards) for blog posts using Google Gemini AI.

## Features

- **Automatic Generation**: Periodically checks for new blog posts and generates visualizations
- **Multiple Visual Types**: Creates infographics, technical diagrams, visual explanations, and TL;DR summary cards
- **SVG-Based**: Generates lightweight, scalable SVG graphics
- **Cloud Storage**: Stores visualizations in Vercel Blob Storage
- **Seamless Integration**: Displays visualizations at the end of each blog post
- **No Authentication Required**: Visitors can view visualizations without logging in

## Architecture

```
┌─────────────┐
│ Notion Blog │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Vercel Cron Job     │ (runs hourly)
│ /api/check-new-posts│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Process Blog Post   │
│ - Extract text      │
│ - Generate visuals  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Google Gemini API   │
│ - Generate SVGs     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Vercel Blob Storage │
│ - Store SVGs        │
│ - Store metadata    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Blog Post Page      │
│ - Display visuals   │
└─────────────────────┘
```

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIza...`)

### 2. Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Blob**
3. Click "Create Blob Store"
4. Name it (e.g., "blog-visualizations")
5. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Configure Environment Variables

Add these to your `.env.local` file (for local development) and Vercel project settings (for production):

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Cron Job Security (generate with: openssl rand -base64 32)
CRON_SECRET=your_random_secret_here
```

### 4. Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "Add AI visualization bot"
git push

# Deploy will happen automatically via Vercel GitHub integration
```

### 5. Verify Cron Job

After deployment:
1. Go to your Vercel project dashboard
2. Navigate to **Cron Jobs**
3. Verify that `/api/check-new-posts` is scheduled to run hourly
4. You can manually trigger it to test

## Usage

### Automatic Generation (Recommended)

The cron job runs every hour and automatically:
1. Checks for new blog posts
2. Identifies posts without visualizations
3. Generates visualizations for up to 5 posts per run
4. Stores them in Vercel Blob Storage

**No action required** - it runs automatically!

### Manual Generation

To manually generate visualizations for a specific post:

```bash
curl -X POST https://your-domain.com/api/generate-visuals \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-blog-post-slug"}'
```

Or use the manual trigger in your browser:

```javascript
fetch('/api/generate-visuals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slug: 'your-blog-post-slug' })
})
```

### View Visualizations

Visualizations appear automatically at the end of each blog post once generated. No action needed from readers!

## API Endpoints

### `GET /api/check-new-posts`

Cron job endpoint that checks for new posts and generates visualizations.

**Security**: Requires `Authorization: Bearer <CRON_SECRET>` header

**Response**:
```json
{
  "message": "Cron job completed",
  "totalPosts": 10,
  "postsWithoutVisuals": 3,
  "processed": 3,
  "succeeded": 2,
  "failed": 1,
  "errors": [...]
}
```

### `POST /api/generate-visuals`

Manually trigger visualization generation for a specific post.

**Request**:
```json
{
  "slug": "your-blog-post-slug",
  "postId": "optional-notion-page-id"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Visualizations generated successfully",
  "slug": "your-blog-post-slug"
}
```

### `GET /api/visualizations/[slug]`

Fetch visualization metadata for a blog post.

**Response**:
```json
{
  "slug": "your-slug",
  "postId": "notion-page-id",
  "status": "completed",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "visualizations": {
    "infographic": {
      "url": "https://...",
      "type": "svg",
      "generatedAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  }
}
```

## Visualization Types

1. **Infographic** 📊
   - Key points visualized with icons
   - Vertical layout
   - Perfect for summarizing main concepts

2. **TL;DR Summary** 📝
   - Quick summary card
   - Social media friendly
   - Great for sharing

3. **Visual Explanation** 🎨
   - Abstract cartoon/illustration
   - Friendly and approachable
   - Explains concepts visually

4. **Technical Diagram** 🔷
   - Flowcharts and architecture diagrams
   - Process flows
   - Technical relationships

## Customization

### Modify Visual Styles

Edit prompts in `src/lib/gemini-service.ts`:

- Change colors (currently cyan/blue theme)
- Adjust layout sizes
- Modify content emphasis
- Add/remove visual elements

### Add More Visualization Types

1. Add new type to `src/lib/visualizations.ts`:
```typescript
export type VisualizationType = "infographic" | "cartoon" | "summaryCard" | "diagram" | "yourNewType";
```

2. Create generator function in `src/lib/gemini-service.ts`

3. Add to processing pipeline in `src/lib/process-blog-post.ts`

4. Update display component in `src/components/VisualizationsSection.tsx`

### Change Generation Frequency

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/check-new-posts",
    "schedule": "0 */2 * * *"  // Every 2 hours instead of every hour
  }]
}
```

Cron schedule format: `minute hour day month day-of-week`

Examples:
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM

## Cost Estimates

### Google Gemini API
- **Free Tier**: 60 requests per minute
- **Cost**: ~$0.001 per request (very affordable)
- **Per Blog Post**: ~4 requests (one per visualization type)
- **Example**: 100 blog posts = $0.40

### Vercel Blob Storage
- **Free Tier**: 500GB storage, 1TB bandwidth
- **Cost After Free**: $0.15/GB storage
- **Per Visualization**: ~50KB average (SVG)
- **Example**: 100 posts × 4 visuals × 50KB = 20MB (~free)

### Vercel Functions
- **Free Tier**: 100GB-hours, 100ms edge compute
- **Generation Time**: ~30 seconds per post
- **Well within free tier** for most use cases

## Troubleshooting

### Visualizations Not Appearing

1. **Check if generation completed**:
   ```bash
   curl https://your-domain.com/api/visualizations/your-slug
   ```

2. **Check Vercel function logs**:
   - Go to Vercel dashboard → Deployments → Functions
   - Look for errors in `/api/check-new-posts` or `/api/generate-visuals`

3. **Verify environment variables**:
   - Ensure `GEMINI_API_KEY` is set
   - Ensure `BLOB_READ_WRITE_TOKEN` is set

### Generation Fails

1. **Gemini API quota exceeded**:
   - Wait a few minutes and try again
   - Check your API quota at Google AI Studio

2. **Invalid SVG generated**:
   - Check function logs for SVG validation errors
   - Try regenerating with `/api/generate-visuals`

3. **Timeout errors**:
   - Increase Vercel function timeout in `vercel.json`:
   ```json
   {
     "functions": {
       "src/app/api/generate-visuals/route.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

### Cron Job Not Running

1. **Verify cron configuration**:
   - Check `vercel.json` is committed and deployed
   - Verify in Vercel dashboard → Cron Jobs

2. **Check authorization**:
   - Ensure `CRON_SECRET` matches in env vars and headers

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Test manual trigger
curl -X POST http://localhost:3000/api/generate-visuals \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-post"}'
```

### File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── check-new-posts/
│   │   │   └── route.ts          # Cron job endpoint
│   │   ├── generate-visuals/
│   │   │   └── route.ts          # Manual trigger endpoint
│   │   └── visualizations/
│   │       └── [slug]/
│   │           └── route.ts      # Get visualizations API
│   └── blog/
│       └── [slug]/
│           └── page.tsx          # Blog post page (with visualizations)
├── components/
│   └── VisualizationsSection.tsx # Visualization display component
└── lib/
    ├── blob-storage.ts           # Vercel Blob operations
    ├── gemini-service.ts         # Google Gemini AI integration
    ├── process-blog-post.ts      # Orchestration logic
    └── visualizations.ts         # Metadata management
```

## Future Enhancements

- [ ] Video generation (animated explanations)
- [ ] Interactive diagrams
- [ ] Multiple language support
- [ ] Custom visual templates per category
- [ ] Admin dashboard for managing visualizations
- [ ] Regenerate button for readers
- [ ] Social media auto-sharing with visuals

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Check [Google Gemini API docs](https://ai.google.dev/docs)
4. Check [Vercel Blob docs](https://vercel.com/docs/storage/vercel-blob)

## License

Same as the main project license.
