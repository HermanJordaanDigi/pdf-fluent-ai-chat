# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Claro-Doc** is a document translation and analysis application that translates PDFs to English and provides AI-generated summaries and insights. The app is built with React/TypeScript/Vite and uses Supabase for authentication and database, with external N8N webhooks for PDF processing.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (with dev mode enabled)
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Authentication Flow
- **AuthContext** ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)) provides global auth state using Supabase Auth
- User sessions are automatically persisted and managed via `onAuthStateChange` listener
- Protected features redirect unauthenticated users to `/auth` route

### PDF Processing Pipeline
The application follows a multi-stage processing pipeline:

1. **Upload**: User uploads PDF via [useFileUpload](src/hooks/useFileUpload.ts)
2. **Translation**: PDF sent to N8N webhook (`https://jordaandigi.app.n8n.cloud/webhook-test/pdf`) with FormData containing `PDF` field (uppercase) and `user_id`
3. **Summary Generation**: Optional GET request to `/webhook-test/summary` with query params `user_id` and `filename`
4. **Insights Generation**: Optional GET request to `/webhook-test/key-points` with query params `user_id` and `filename`

**Important**: The N8N webhook expects the form field to be named `PDF` (uppercase), not `pdf`.

### Custom Hooks Architecture
The app uses a composition pattern for managing PDF operations:

- **usePdfOperations** ([src/hooks/usePdfOperations.ts](src/hooks/usePdfOperations.ts)) - Main orchestrator that composes:
  - **useFileUpload** - Handles PDF upload and translation
  - **useSummaryGeneration** - Generates AI summaries from translated PDFs
  - **useInsightsGeneration** - Extracts key insights from translated PDFs
- **useChatMode** - Manages chat interface state and message history
- **useAutoGenerate** - Handles automatic generation of summaries/insights based on toggle state

### Database Schema
Two main tables in Supabase (see [migration](supabase/migrations/20251222164310_8e99dc3f-936f-4537-944e-65f4b9b1ce48.sql)):

- **profiles**: User profile information (auto-created on signup via trigger)
- **translations**: Translation history with fields for `file_name`, `original_language`, `target_language`, `summary`, `insights`, and `status`

Both tables have Row Level Security (RLS) enabled - users can only access their own data.

### Webhook Response Parsing
The summary and insights hooks use flexible parsing strategies to handle various response formats from N8N webhooks. They check multiple possible field names (`summary`, `insights`, `text`, `result`, `content`, `message`) and can handle both array and object responses. See [useSummaryGeneration.ts](src/hooks/useSummaryGeneration.ts) and [useInsightsGeneration.ts](src/hooks/useInsightsGeneration.ts) for implementation details.

### State Management
- **React Query** (`@tanstack/react-query`) for server state (configured in [App.tsx](src/App.tsx))
- **React Context** for auth state
- **Local component state** for UI interactions
- No Redux or other global state management library

### Routing
Simple React Router setup in [App.tsx](src/App.tsx):
- `/` - Main application (Index page)
- `/auth` - Authentication page
- `*` - 404 Not Found page

Add new routes ABOVE the catch-all `*` route.

### UI Components
- Built with **shadcn/ui** (Radix UI primitives + Tailwind)
- UI components in [src/components/ui/](src/components/ui/)
- Custom application components in [src/components/](src/components/)
- Toast notifications via Sonner
- Theme support via `next-themes`

## Important Technical Details

### Supabase Configuration
Supabase client is initialized in [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) using environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

TypeScript types are auto-generated in [src/integrations/supabase/types.ts](src/integrations/supabase/types.ts).

### Path Aliases
The project uses `@/` as an alias for the `src/` directory (configured in [vite.config.ts](vite.config.ts)).

### Lovable Integration
This project was created with Lovable.dev and includes the `lovable-tagger` plugin for development mode. The plugin is only active when running in development mode.

## Working with N8N Webhooks

When modifying webhook interactions:
1. The PDF upload endpoint expects multipart form data with `PDF` (uppercase) as the file field name
2. Summary and insights endpoints use GET requests with query parameters
3. All endpoints require `user_id` for tracking
4. Response parsing is flexible - check the hooks for the parsing strategies used

## Database Operations

When working with the database:
- Use the Supabase client from `@/integrations/supabase/client`
- Types are available via `@/integrations/supabase/types`
- Remember that RLS policies are enforced - users can only access their own data
- The `translations` table stores metadata about translations, not the actual PDF files
