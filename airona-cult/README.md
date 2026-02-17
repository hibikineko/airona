# Airona Cult - BPSR Community Hub

A Next.js-based community website for Blue Protocol Star Resonance (BPSR) fans!

## Features

- � **Airona Character Page** - Learn about Airona's personality and lore
- 🖼️ **Community Gallery** - Auto-scrolling carousels showcasing fanart, screenshots, and sesbian content
- 🧩 **Memory Puzzle Game** - Fun Airona-themed memory matching game
- 📤 **Admin Upload** - Secure admin-only content upload with Discord authentication
- 🎨 **Cute Theme** - Minimalistic design with Airona's signature green colors
- 🌙 **Dark/Light Mode** - Toggle between themes for comfortable viewing

## Tech Stack

- Next.js 14+
- Material-UI (MUI)
- NextAuth.js (Discord login)
- Supabase (Database & Storage)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages
  - `/airona` - Airona character information page
  - `/gallery` - Community gallery with auto-scrolling carousels
  - `/game/card` - Memory puzzle game
  - `/upload` - Admin-only content upload page
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and API helpers
- `/public` - Static assets

## Environment Variables

Create a `.env.local` file with:

```
NEXTAUTH_SECRET=your-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_DISCORD_IDS=discord_id_1,discord_id_2,discord_id_3
```

**Note:** `ADMIN_DISCORD_IDS` should be a comma-separated list of Discord user IDs who have permission to upload content. To get your Discord ID, enable Developer Mode in Discord settings and right-click your profile.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
