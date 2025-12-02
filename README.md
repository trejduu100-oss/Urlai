# URLAI - URL Shortener

A modern URL shortener built with Next.js and Supabase.

## Features

- Shorten long URLs to compact links
- Automatic 1-month expiry for all links
- Copy, open, and delete shortened URLs
- Server-side persistence with Supabase
- Dark theme with modern UI

## Prerequisites

- Node.js 18+ (check with `node -v`)
- npm or yarn or pnpm
- A Supabase account and project
- Git

## Local Development Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/urlai.git
cd urlai
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Settings** > **API** to find your credentials

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Then add your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 5. Set Up the Database

Run the following SQL in your Supabase SQL Editor (**SQL Editor** > **New Query**):

\`\`\`sql
CREATE TABLE IF NOT EXISTS urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_expires_at ON urls(expires_at);

ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON urls FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON urls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON urls FOR DELETE USING (true);
\`\`\`

### 6. Run the Development Server

\`\`\`bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Update Short URL Domain (Optional)

For local development, the short URLs will display as `urlai.vercel.app/CODE`. 

To use your own domain, edit `components/url-shortener.tsx`:

\`\`\`tsx
const shortUrl = `http://localhost:3000/${newUrl.short_code}`
\`\`\`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

\`\`\`
urlai/
├── app/
│   ├── [code]/
│   │   └── route.ts        # Redirect handler for short URLs
│   ├── actions/
│   │   └── url-actions.ts  # Server actions for CRUD operations
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   └── url-shortener.tsx   # Main URL shortener component
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server Supabase client
├── scripts/
│   └── 001_create_urls_table.sql  # Database migration
└── README.md
\`\`\`

## Troubleshooting

### "Failed to create short URL" error

1. Check that your Supabase credentials are correct in `.env.local`
2. Ensure the `urls` table exists in your Supabase database
3. Verify RLS policies are set up correctly

### Short URL redirects not working

1. Make sure the `app/[code]/route.ts` file exists
2. Check that the short code exists in your database
3. Verify the URL hasn't expired (1 month limit)

### Environment variables not loading

1. Restart the development server after changing `.env.local`
2. Ensure variable names start with `NEXT_PUBLIC_` for client-side access
3. Check for typos in variable names

### Database connection issues

1. Check your Supabase project is running (not paused)
2. Verify your IP is not blocked in Supabase settings
3. Test the connection in Supabase dashboard

## Deployment Guides

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [vercel.com](https://vercel.com) and click "New Project"

3. Import your repository

4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Click "Deploy"

**Or deploy via CLI:**

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
\`\`\`

### Render

1. Push your code to GitHub/GitLab

2. Go to [render.com](https://render.com) and click "New Web Service"

3. Connect your repository

4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `Node`

5. Add environment variables in the "Environment" tab

6. Click "Create Web Service"

**Or use the `render.yaml` blueprint:**

\`\`\`bash
# Connect repo and Render will auto-detect render.yaml
\`\`\`

### Netlify

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [netlify.com](https://netlify.com) and click "Add new site"

3. Import your repository

4. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `.next`

5. Add environment variables in "Site settings" > "Environment variables"

6. Click "Deploy site"

**Or deploy via CLI:**

\`\`\`bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
\`\`\`

### Railway

1. Go to [railway.app](https://railway.app) and create a new project

2. Connect your GitHub repository

3. Add environment variables in the "Variables" tab

4. Railway auto-detects Next.js and deploys automatically

### Docker

\`\`\`bash
# Build the image
docker build -t urlai .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  urlai
\`\`\`

## Updating Your Domain

After deployment, update the short URL domain in `components/url-shortener.tsx`:

\`\`\`tsx
const shortUrl = `https://your-domain.com/code/${newUrl.short_code}`
\`\`\`

## License

MIT
