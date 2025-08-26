# New-Eunoia - UI Version Without AI

This is a clean version of the Eunoia therapy application with all UI components but without AI functionality. The chat interface is preserved but messages don't generate AI responses yet.

## Features Preserved

- Complete UI interface with chat system
- Session management
- Voice interface components (UI only)
- Crisis detection modal (UI only)
- Sidebar navigation
- All pages (home, session, journal, mood, etc.)
- Session summaries
- CBT tools interface

## Features Removed

- AI/ML API integration
- Automatic AI responses in chat
- Smart crisis detection
- AI-powered session summaries

## Running the Application

From the New-Eunoia directory:

```bash
npm install
npm run dev
```

Or use the provided script:

```bash
./start.sh
```

The application will start on port 5000 by default.

## Next Steps

You can now integrate your own chat response system by modifying:

1. `server/routes.ts` - Add your response logic in the message endpoint
2. `client/src/components/chat-interface.tsx` - Modify if needed for your response format
3. `client/src/pages/session.tsx` - Update session handling as needed

The entire UI framework is ready for your custom implementation!