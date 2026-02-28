# InspoLens

InspoLens is an AI-powered visual analysis tool that helps creatives turn images into structured inspiration.

Instead of endlessly scrolling for ideas, users can upload an image and instantly extract:

- 🎨 Color palettes
- 🔎 Aesthetic keywords
- 📝 Structured visual descriptions

The goal is to make creative research more intentional, searchable, and reusable.

👉 [Live Demo](https://inspo-lens.vercel.app) | [Project Overview](https://www.soniayeung.com/project/inspolens)

## What It Does

- Upload an image for AI analysis
- Extract dominant colors and semantic tags
- Generate structured aesthetic descriptions
- Save and manage analyses under user accounts
- Retrieve analyses with pagination and filtering
- Support both guest and authenticated modes

## Tech Stack

**Frontend**

- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend / Infrastructure**

- Supabase (Auth, PostgreSQL, Storage)
- Row Level Security (RLS)
- Custom PostgreSQL RPC functions

**AI**

- OpenAI API

**Deployment**

- Vercel

## Engineering Highlights

- Auth-aware session handling (hydration-safe)
- Database-level computation of save state
- Server-side pagination & filtering
- Structured AI output pipeline with normalized storage
- Access control via RLS policies

## Future Plans

- [ ] Improve onboarding and landing page clarity
- [ ] Implement search functionality
- [ ] Introduce collections to organize analyses
- [ ] Integrate AI image generation based on extracted metadata
- [ ] Develop a user dashboard

…and continue refining the product as the creative workflow becomes more structured and interconnected.

## Current Status

A functional public MVP with image analysis, user authentication, and saved analyses.

The core workflow (_upload → analyze → explore → save_) is complete.

Current focus: expanding creative workflows with search, collections, and deeper exploration of analyses.
