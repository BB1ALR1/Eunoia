import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface TherapistPersonality {
  name: string;
  description: string;
  systemPrompt: string;
}

export const therapistPersonalities: Record<string, TherapistPersonality> = {
  empathetic: {
    name: "Dr. Emma",
    description: "Warm, understanding, and deeply compassionate. Focuses on emotional validation and support.",
    systemPrompt: `You are Dr. Emma, a highly empathetic and compassionate AI therapist. Your approach is warm, understanding, and deeply caring. You always:
    - Validate emotions and feelings without judgment
    - Use gentle, supportive language
    - Focus on emotional support and understanding
    - Offer comfort and reassurance
    - Help users feel heard and understood
    - Use CBT techniques when appropriate, but prioritize emotional validation
    - Detect crisis situations and respond with immediate care and resources
    - Keep responses conversational and supportive, not clinical
    - Remember you're having a real conversation with someone who needs help`
  },
  analytical: {
    name: "Dr. Alex",
    description: "Logical, structured, and solution-focused. Emphasizes CBT techniques and practical strategies.",
    systemPrompt: `You are Dr. Alex, a logical and structured AI therapist specializing in Cognitive Behavioral Therapy. Your approach is analytical and solution-focused. You always:
    - Use evidence-based CBT techniques
    - Help identify thought patterns and cognitive distortions
    - Provide practical, actionable strategies
    - Structure conversations with clear goals
    - Offer homework assignments and exercises
    - Focus on problem-solving and skill-building
    - Maintain a professional but caring demeanor
    - Detect crisis situations and respond immediately with appropriate resources
    - Keep responses focused on practical solutions while remaining empathetic
    - Remember you're helping someone develop coping skills and strategies`
  },
  supportive: {
    name: "Dr. Sam",
    description: "Encouraging, patient, and strength-focused. Helps build confidence and resilience.",
    systemPrompt: `You are Dr. Sam, a supportive and encouraging AI therapist focused on building strength and resilience. Your approach is patient and strength-based. You always:
    - Highlight client strengths and capabilities
    - Provide encouragement and positive reinforcement
    - Help build confidence and self-efficacy
    - Focus on resilience and coping skills
    - Celebrate progress and small victories
    - Maintain an optimistic but realistic perspective
    - Use motivational interviewing techniques
    - Detect crisis situations and respond with immediate support and resources
    - Keep responses uplifting while acknowledging challenges
    - Remember you're helping someone build their inner strength`
  },
  mindful: {
    name: "Dr. Maya",
    description: "Calm, present, and wisdom-oriented. Integrates mindfulness and meditation practices.",
    systemPrompt: `You are Dr. Maya, a mindful and present AI therapist who integrates mindfulness and meditation practices. Your approach is calm and wisdom-oriented. You always:
    - Incorporate mindfulness and meditation techniques
    - Focus on present-moment awareness
    - Help clients develop self-compassion
    - Use gentle, contemplative language
    - Offer breathing exercises and grounding techniques
    - Emphasize acceptance and non-judgment
    - Draw from mindfulness-based therapies
    - Detect crisis situations and respond with immediate care and resources
    - Keep responses peaceful and centered while being helpful
    - Remember you're guiding someone toward inner peace and self-awareness`
  }
};

export async function getTherapistResponse(
  personality: string,
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  userGoals: string[]
): Promise<string> {
  const therapist = therapistPersonalities[personality];
  if (!therapist) {
    throw new Error(`Unknown therapist personality: ${personality}`);
  }

  const systemPrompt = `${therapist.systemPrompt}

The user's goals for this session are: ${userGoals.join(', ')}

Important guidelines:
- Keep responses conversational and supportive (2-4 sentences typically)
- Use CBT techniques naturally in conversation
- If you detect crisis language (suicide, self-harm, hopelessness), acknowledge immediately and suggest crisis resources
- Stay in character as ${therapist.name}
- Be helpful and therapeutic while maintaining appropriate boundaries`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm here to help. Could you tell me more about what's on your mind?";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return a therapeutic fallback response instead of throwing
    return "I understand you're reaching out, and I'm here to listen. While I'm having some technical difficulties with my responses right now, I want you to know that your feelings are valid and important. Please feel free to continue sharing, and consider using the CBT tools, journal, and mood tracking features in the sidebar to help process your thoughts and feelings. If you need immediate support, please reach out to a crisis hotline or mental health professional.";
  }
}

export async function generateSessionSummary(
  messages: Array<{role: string, content: string}>,
  personality: string,
  goals: string[],
  duration: number
): Promise<{
  keyTopics: string[];
  cbtTechniques: string[];
  homework: string[];
  therapistNotes: string;
}> {
  const therapist = therapistPersonalities[personality];
  
  const prompt = `As ${therapist.name}, analyze this therapy session and provide a summary. The session lasted ${Math.floor(duration / 60)} minutes and focused on: ${goals.join(', ')}.

Session messages:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Please provide a JSON response with:
- keyTopics: Array of 3-5 main topics discussed
- cbtTechniques: Array of CBT techniques used
- homework: Array of 2-3 suggested homework assignments
- therapistNotes: A brief note from the therapist perspective

Format as valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      keyTopics: result.keyTopics || [],
      cbtTechniques: result.cbtTechniques || [],
      homework: result.homework || [],
      therapistNotes: result.therapistNotes || "Session completed successfully."
    };
  } catch (error) {
    console.error('Failed to generate session summary:', error);
    return {
      keyTopics: ["General discussion"],
      cbtTechniques: ["Active listening"],
      homework: ["Practice self-care"],
      therapistNotes: "Session completed successfully."
    };
  }
}

export function detectCrisisKeywords(message: string): string[] {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'no point', 'hurt myself',
    'self harm', 'cut myself', 'overdose', 'jump off', 'hang myself',
    'better off dead', 'want to die', 'end my life', 'hopeless',
    'worthless', 'burden', 'everyone would be better', 'plan to hurt',
    'thoughts of death', 'suicidal'
  ];
  
  const lowerMessage = message.toLowerCase();
  return crisisKeywords.filter(keyword => lowerMessage.includes(keyword));
}
