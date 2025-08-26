# Eunoia - AI-Powered Therapy Chat Application

## Overview

Eunoia is a comprehensive AI-powered therapy chat application that provides users with personalized mental health support through multiple AI therapist personalities. The application combines real-time chat functionality, voice interaction capabilities, and therapeutic tools to create an immersive therapy experience. It features crisis detection systems, journaling capabilities, mood tracking, CBT tools, and session management with detailed summaries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Custom routing system using Wouter for client-side navigation
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API endpoints for session, message, and user management
- **Middleware**: Custom logging middleware for request/response tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud database
- **Schema Management**: Shared schema definitions between frontend and backend
- **Migration System**: Drizzle Kit for automated database migrations
- **Tables**: Users, sessions, messages, crisis events, journal entries, mood entries

### AI Integration Architecture
- **Primary AI Service**: Multiple AI providers including Anthropic Claude, Google GenAI, and OpenAI
- **Therapist Personalities**: Four distinct AI personas with specialized system prompts and therapeutic approaches
- **Crisis Detection**: Real-time keyword analysis for mental health crisis intervention
- **Response Processing**: Contextual AI responses based on session history and user goals

### Authentication & Session Management
- **User Authentication**: Complete login/signup system with secure password hashing (bcrypt)
- **Session Storage**: PostgreSQL-backed express-session with connect-pg-simple
- **Data Isolation**: All user data (sessions, messages, journal entries, mood data) protected by user_id foreign keys
- **Password Security**: Bcrypt hashing with salt rounds for secure password storage
- **Frontend Auth**: React hooks for authentication state management and protected routes
- **Session Persistence**: Secure session cookies with database session storage
- **User Registration**: New user registration with immediate login after signup

### Voice Integration
- **Speech Recognition**: Browser-native Web Speech API for voice input
- **Text-to-Speech**: Browser-native Speech Synthesis API for voice responses
- **Real-time Processing**: Seamless switching between text and voice modes
- **Audio Controls**: Full control over speech playback and recording

## External Dependencies

### AI Services
- **Anthropic AI SDK**: Claude AI models for advanced conversational therapy
- **Google GenAI**: Google's generative AI models for diverse response generation
- **AIML API**: Alternative AI service provider for redundancy and model diversity

### Database Services
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Connect-PG-Simple**: PostgreSQL session store for Express sessions

### UI Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built component library built on Radix and Tailwind
- **Class Variance Authority**: Type-safe component variants
- **CLSX & Tailwind Merge**: Dynamic className handling

### Speech & Audio
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Speech Recognition**: Cross-browser speech-to-text functionality
- **Speech Synthesis**: Text-to-speech with voice selection capabilities

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Monitoring & Analytics
- **Custom Logging**: Request/response logging middleware
- **Error Tracking**: Centralized error handling and reporting
- **Session Analytics**: Detailed session duration and interaction tracking