# Eunoia - AI Therapy Chat Application

## Overview

Eunoia is a comprehensive AI-powered therapy chat application that provides users with personalized therapy sessions through various AI therapist personalities. The application combines real-time chat, voice interaction, crisis detection, and session management to create a supportive mental health platform.

## User Preferences

Preferred communication style: Customizable, default is english.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for therapist responses and session analysis
- **Session Management**: In-memory storage with planned database persistence

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend
- **Tables**: Users, Sessions, Messages, Crisis Events
- **Migrations**: Auto-generated in `./migrations` directory

## Key Components

### AI Therapist System
- **Multiple Personalities**: Four distinct therapist personas (Empathetic, Analytical, Supportive, Mindful)
- **Personalized Responses**: Each therapist has unique system prompts and response styles
- **CBT Integration**: Cognitive Behavioral Therapy techniques embedded in responses
- **Crisis Detection**: Real-time monitoring for mental health crisis keywords

### Communication Interfaces
- **Text Chat**: Traditional text-based therapy sessions
- **Voice Interface**: Speech-to-text and text-to-speech capabilities
- **Real-time Interaction**: Immediate response system with loading states

### Session Management
- **Session Tracking**: Complete conversation history and metadata
- **Summary Generation**: AI-powered session summaries with key topics and techniques
- **Goal Setting**: User-defined therapy goals and progress tracking
- **Duration Monitoring**: Session timing and engagement metrics

### Crisis Intervention
- **Keyword Detection**: Real-time monitoring for crisis-related language
- **Immediate Response**: Automatic crisis modal with resources
- **Emergency Resources**: Direct access to crisis hotlines and support services
- **Documentation**: Crisis event logging for continuity of care

## Data Flow

1. **User Onboarding**: Personality selection → Voice selection → Goal setting
2. **Session Creation**: Settings validation → Database session creation → Initial therapist greeting
3. **Message Exchange**: User input → crisis detection → AI processing → Response generation → Storage
4. **Session Conclusion**: Summary generation → Progress tracking → Resource recommendations

## External Dependencies

### AI Services
- **Enhanced Therapeutic AI**: Sophisticated rule-based system with four distinct therapist personalities
- **Context-Aware Responses**: Emotional content analysis, therapeutic needs assessment, and personalized interventions
- **Professional Crisis Detection**: Comprehensive multi-category crisis assessment with imminent risk evaluation

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Connection**: Environment variable-based configuration

### UI Components
- **Radix UI**: Headless component primitives
- **Embla Carousel**: Interactive component carousels
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server and build tool
- **Replit Integration**: Development environment optimization
- **TypeScript**: Type safety across full stack

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite HMR for rapid development
- **Type Checking**: Continuous TypeScript validation
- **Database Sync**: Drizzle kit for schema management

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundling to `dist/index.js`
- **Environment**: NODE_ENV-based configuration switching

### Database Management
- **Schema Sync**: `drizzle-kit push` for production deployments
- **Migrations**: Automatic generation and application
- **Connection**: DATABASE_URL environment variable required

## Recent Changes

### July 13, 2025
- **Fixed message sending errors** - Resolved schema validation issues preventing users from sending messages
- **Implemented popup session summaries** - Session ending now shows popup summary with options to view all or return home
- **Fixed session summaries navigation** - Sidebar "Session Summaries" now directly opens full-page database view
- **Enhanced session completion flow** - "Done" button returns to home with sidebar accessible for new sessions
- **Created collapsible homepage sidebar** - Home page now has accessible sidebar with proper collapse/expand functionality
- **Implemented automatic session ending** - Session end immediately stops timer, audio synthesis, and voice recognition
- **Fixed audio control on session end** - Voice interface automatically stops all speech when session ends
- **Improved error handling** - Better fallback responses when OpenAI API is unavailable
- **Session flow optimization** - End session → popup summary → home page or all summaries view
- **Fixed timer continuation bug** - Timer now properly stops when session summary popup appears
- **Enhanced home screen design** - Added gradient backgrounds, animated heart icon, session info card, and improved typography
- **Fixed voice control mode switching** - Voice interface now properly stops speaking and listening when switching to text mode
- **Fixed "View All Sessions" navigation** - Modal now correctly navigates to session summaries page instead of home
- **Implemented selective session ending behavior** - Confirmation popup now only appears when navigating away from active session page; other pages have direct navigation with auto-session ending
- **Enhanced navigation UX** - Sessions automatically end when navigating from non-session pages, but require confirmation when leaving active therapy session
- **Removed quick journal and mood check-in from sidebar** - Simplified sidebar by removing interactive quick journal entry and mood check-in components, keeping only essential navigation and information
- **Fixed session end popup appearing incorrectly** - Session summary modal now only appears when ending session from actual session page, not from navigation between other pages
- **Fixed "View All Sessions" navigation from session summary modal** - Removed conflicting onClose call that was redirecting to home instead of session summaries page
- **Implemented professional therapeutic AI** - Created comprehensive rule-based therapeutic system with four distinct personalities, CBT techniques, context-aware responses, enhanced crisis detection, and intelligent session summaries

### Previous Updates
- Enhanced AI therapist system with multiple personalities and CBT integration
- Added crisis detection and intervention system
- Implemented session management with summaries and progress tracking
- Created comprehensive UI with voice and text interfaces
- Added journal, mood tracking, and CBT tools integration

The application prioritizes user safety through crisis detection, provides personalized therapy experiences through AI personalities, and maintains professional therapeutic standards while being accessible through modern web technologies.