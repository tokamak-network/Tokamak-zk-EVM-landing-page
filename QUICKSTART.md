# 🚀 Quick Start Guide - AI Visualization Bot

## What Does This Do?

Every time you publish a blog post in Notion, this bot automatically generates 4 types of visualizations:

1. **📊 Infographic** - Key points with icons
2. **📝 Summary Card** - TL;DR version
3. **🎨 Visual Explanation** - Friendly cartoon/illustration
4. **🔷 Technical Diagram** - Flowcharts and architecture

These appear automatically at the bottom of each blog post. No action needed from readers!

## Setup (5 Minutes)

### Step 1: Get Google Gemini API Key (2 min)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 2: Enable Vercel Blob Storage (2 min)

1. Go to Vercel Dashboard → Your Project
2. Click "Storage" → "Blob"
3. Click "Create Blob Store"
4. Name it (e.g., "blog-visuals")
5. Copy the token shown

### Step 3: Generate Cron Secret (30 sec)

Run in terminal:
```bash
openssl rand -base64 32
```

Copy the output.

### Step 4: Add to Vercel (30 sec)

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add these three:

```
GEMINI_API_KEY=your_key_from_step_1
BLOB_READ_WRITE_TOKEN=your_token_from_step_2
CRON_SECRET=your_secret_from_step_3
```

### Step 5: Deploy

```bash
git add .
git commit -m "Add AI visualization bot"
git push
```

Done! 🎉

## How It Works

1. **Every hour**, Vercel runs a cron job
2. Checks for blog posts without visualizations
3. Generates visuals for up to 5 posts
4. Stores them in Vercel Blob Storage
5. They appear automatically on blog post pages

## Testing Locally

Create `.env.local`:
```bash
cp env.example .env.local
# Edit .env.local with your keys
```

Test manual generation:
```bash
npm run dev

# In another terminal:
curl -X POST http://localhost:3000/api/generate-visuals \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-blog-slug"}'
```

Visit: http://localhost:3000/blog/your-slug

## Manual Trigger (if needed)

To manually generate for a specific post:

```bash
curl -X POST https://your-domain.com/api/generate-visuals \
  -H "Content-Type: application/json" \
  -d '{"slug": "your-blog-slug"}'
```

## Verify It's Working

1. Go to Vercel Dashboard → Cron Jobs
2. You should see `/api/check-new-posts` scheduled hourly
3. Check your blog posts - new ones will have visualizations within an hour!

## Costs

- **Free tier is enough!** 
- Gemini API: First 60 requests/min free
- Vercel Blob: First 500GB free
- For 100 blog posts: ~$0.40 total

## Troubleshooting

**Visualizations not showing?**
- Wait 1-2 hours (cron job runs hourly)
- Check Vercel → Functions → Logs for errors
- Verify environment variables are set

**Want to regenerate?**
```bash
curl -X POST https://your-domain.com/api/generate-visuals \
  -H "Content-Type: application/json" \
  -d '{"slug": "post-slug"}'
```

## More Help

- Full documentation: `VISUALIZATION_BOT_README.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`

That's it! Your blog now has AI-powered visualizations. 🎨✨
