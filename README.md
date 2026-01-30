# Vesper

A women-centric, voice-first application offering interactive erotic storytelling and simulated "AI Domination."

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Database)
- **AI**: OpenAI Realtime API (Voice Chat) + ElevenLabs (TTS)
- **Audio**: Howler.js
- **Animations**: Framer Motion
- **Platform**: Mobile-First PWA

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- ElevenLabs API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env.local
```

3. Fill in your `.env.local` with:
   - Supabase URL and Anon Key
   - OpenAI API Key
   - ElevenLabs API Key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vesper/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities
│   └── supabase/         # Supabase clients
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Color Palette

- **Void**: `#000000` (Black - Primary background)
- **Paper**: `#ddd5cd` (Beige - Text/Secondary)
- **Lime**: `#b1c965` (Muted Lime Green - Accents)
- **Blood**: `#731424` (Deep Red - Alerts/Passion)

## Development Guidelines

See `.cursorrules` for development principles and guidelines.
