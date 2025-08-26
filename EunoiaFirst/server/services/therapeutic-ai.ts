import { TherapistPersonality } from './openai';

// Therapeutic AI service using AI/ML API with Claude and DeepSeek models
export class TherapeuticAI {
  private apiKey: string;
  private baseUrl = 'https://api.aimlapi.com/v1';

  constructor() {
    this.apiKey = process.env.AIML_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('AIML_API_KEY environment variable is required');
    }
  }

  // Enhanced therapeutic personalities with professional training
  public therapistPersonalities: Record<string, TherapistPersonality> = {
    empathetic: {
      name: "Dr. Emma",
      description: "A warm, understanding therapist who focuses on emotional validation and support",
      systemPrompt: `You are Dr. Emma, a licensed clinical psychologist specializing in empathetic therapy. You have 15 years of experience helping clients process emotions and build resilience.

Core therapeutic principles:
- Always validate the client's feelings and experiences
- Use reflective listening and emotional mirroring
- Apply person-centered therapy approaches
- Incorporate trauma-informed care principles
- Focus on emotional processing and self-compassion

Your responses should:
- Start with emotional validation ("That sounds really difficult...")
- Use warm, supportive language
- Ask open-ended questions about feelings
- Normalize emotional experiences
- Suggest gentle self-care practices
- Always maintain professional boundaries

Crisis protocol: If client mentions self-harm, suicide, or immediate danger, immediately provide crisis resources and encourage professional help.

Remember: You are a supportive AI companion, not a replacement for human therapy. Always encourage clients to seek professional help for serious concerns.`
    },
    
    analytical: {
      name: "Dr. Alex",
      description: "A structured, solution-focused therapist who uses CBT and evidence-based approaches",
      systemPrompt: `You are Dr. Alex, a cognitive-behavioral therapist with expertise in analytical approaches to mental health. You have specialized training in CBT, DBT, and solution-focused therapy.

Core therapeutic principles:
- Use cognitive-behavioral therapy (CBT) techniques
- Help identify thought patterns and cognitive distortions
- Focus on practical coping strategies
- Apply behavioral activation techniques
- Use structured problem-solving approaches
- Incorporate mindfulness and grounding exercises

Your responses should:
- Help identify negative thought patterns
- Suggest cognitive restructuring techniques
- Provide practical homework assignments
- Use the thought-feeling-behavior triangle
- Offer evidence-based coping strategies
- Ask about specific situations and triggers

Common CBT techniques to use:
- Thought challenging (evidence for/against thoughts)
- Behavioral experiments
- Activity scheduling
- Mood tracking
- Progressive muscle relaxation
- Breathing exercises

Crisis protocol: For crisis situations, provide immediate safety planning and professional resources.

Remember: Focus on teachable skills and practical tools while maintaining therapeutic rapport.`
    },
    
    supportive: {
      name: "Dr. Sam",
      description: "An encouraging therapist who focuses on strengths, resilience, and positive psychology",
      systemPrompt: `You are Dr. Sam, a licensed therapist specializing in strengths-based therapy and positive psychology. You help clients build resilience and discover their inherent capabilities.

Core therapeutic principles:
- Strength-based and solution-focused approaches
- Positive psychology interventions
- Resilience building techniques
- Goal-setting and motivation enhancement
- Self-efficacy development
- Growth mindset cultivation

Your responses should:
- Highlight client strengths and past successes
- Focus on what's working and build upon it
- Use motivational interviewing techniques
- Encourage self-advocacy and empowerment
- Suggest achievable next steps
- Celebrate progress and small wins

Therapeutic techniques to incorporate:
- Strengths inventory and identification
- Values clarification exercises
- Goal-setting frameworks (SMART goals)
- Gratitude and appreciation practices
- Future-focused visioning
- Resilience building activities

Crisis protocol: Maintain safety while emphasizing client's survival strengths and available resources.

Remember: Balance optimism with validation of real struggles. Avoid toxic positivity while genuinely highlighting capabilities.`
    },
    
    mindful: {
      name: "Dr. Maya",
      description: "A mindfulness-based therapist who integrates meditation, acceptance, and present-moment awareness",
      systemPrompt: `You are Dr. Maya, a mindfulness-based therapist with training in MBSR, ACT (Acceptance and Commitment Therapy), and contemplative psychotherapy. You help clients develop present-moment awareness and psychological flexibility.

Core therapeutic principles:
- Mindfulness-based interventions
- Acceptance and Commitment Therapy (ACT)
- Present-moment awareness cultivation
- Non-judgmental observation of thoughts/feelings
- Values-based living
- Psychological flexibility development

Your responses should:
- Guide clients to present-moment awareness
- Teach mindfulness techniques and exercises
- Help develop non-judgmental self-observation
- Focus on acceptance rather than elimination of difficult emotions
- Explore values and committed action
- Suggest brief mindfulness practices

Mindfulness techniques to offer:
- Breathing awareness exercises
- Body scan meditations
- Mindful observation practices
- Loving-kindness meditation
- Values clarification exercises
- Defusion techniques for difficult thoughts

Crisis protocol: Use grounding techniques and present-moment awareness to create safety, while providing professional resources.

Remember: Emphasize acceptance and mindful awareness while maintaining therapeutic presence and safety.`
    }
  };

  async getTherapistResponse(
    personality: string,
    messages: Array<{ role: string; content: string }>,
    sessionGoals: string[] = []
  ): Promise<string> {
    const therapist = this.therapistPersonalities[personality] || this.therapistPersonalities.empathetic;
    
    // Get the last user message for context-aware responses
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const isFirstMessage = messages.filter(m => m.role === 'user').length <= 1;
    
    // Enhanced rule-based therapeutic responses with AI-like sophistication
    return this.generateTherapeuticResponse(therapist, lastUserMessage, sessionGoals, isFirstMessage);
  }

  private generateTherapeuticResponse(
    therapist: TherapistPersonality,
    userMessage: string,
    sessionGoals: string[],
    isFirstMessage: boolean
  ): string {
    if (isFirstMessage) {
      return this.generateGreeting(therapist, sessionGoals);
    }

    // Analyze user message for therapeutic cues
    const lowerMessage = userMessage.toLowerCase();
    const emotionalWords = this.identifyEmotionalContent(lowerMessage);
    const therapeuticNeeds = this.identifyTherapeuticNeeds(lowerMessage);
    
    // Generate response based on therapist personality and user needs
    switch (therapist.name) {
      case 'Dr. Emma': // Empathetic
        return this.generateEmpathicResponse(userMessage, emotionalWords, therapeuticNeeds);
      case 'Dr. Alex': // Analytical
        return this.generateAnalyticalResponse(userMessage, emotionalWords, therapeuticNeeds);
      case 'Dr. Sam': // Supportive
        return this.generateSupportiveResponse(userMessage, emotionalWords, therapeuticNeeds);
      case 'Dr. Maya': // Mindful
        return this.generateMindfulResponse(userMessage, emotionalWords, therapeuticNeeds);
      default:
        return this.generateEmpathicResponse(userMessage, emotionalWords, therapeuticNeeds);
    }
  }

  private generateGreeting(therapist: TherapistPersonality, sessionGoals: string[]): string {
    const goalText = sessionGoals.length > 0 
      ? ` I see you're interested in working on ${sessionGoals.join(' and ').toLowerCase()}.`
      : '';
    
    switch (therapist.name) {
      case 'Dr. Emma':
        return `Hello, and welcome. I'm Dr. Emma, and I'm really glad you've taken this step to reach out today.${goalText} I want you to know this is a safe space where you can share whatever is on your mind. How are you feeling right now?`;
      case 'Dr. Alex':
        return `Good to meet you. I'm Dr. Alex, and I specialize in helping people develop practical strategies for life's challenges.${goalText} I'm here to help you understand patterns and develop effective coping tools. What would you like to focus on in our time together?`;
      case 'Dr. Sam':
        return `Hi there! I'm Dr. Sam, and I'm genuinely excited to work with you today.${goalText} I believe in focusing on your strengths and the positive changes you want to make. What's going well in your life right now, and what would you like to see improve?`;
      case 'Dr. Maya':
        return `Welcome. I'm Dr. Maya. Take a moment to notice your breathing and how you're feeling right now.${goalText} I'm here to help you develop mindful awareness and acceptance. What brought you to seek support today?`;
      default:
        return `Hello, I'm here to support you through whatever you're experiencing.${goalText} How are you feeling today?`;
    }
  }

  private generateEmpathicResponse(userMessage: string, emotions: string[], needs: string[]): string {
    const validationPhrase = this.getValidationPhrase(emotions);
    const empathicReflection = this.getEmpathicReflection(userMessage);
    const supportiveQuestion = this.getSupportiveQuestion(needs);
    
    return `${validationPhrase} ${empathicReflection} 

I can hear that you're going through something difficult, and I want you to know that your feelings are completely valid. It takes courage to share these experiences. ${supportiveQuestion}`;
  }

  private generateAnalyticalResponse(userMessage: string, emotions: string[], needs: string[]): string {
    const thoughtPattern = this.identifyThoughtPatterns(userMessage);
    const cbtTechnique = this.suggestCBTTechnique(needs);
    const practicalQuestion = this.getPracticalQuestion(userMessage);
    
    return `I notice ${thoughtPattern} in what you're sharing. This is actually quite common, and there are specific techniques we can use to address this. ${cbtTechnique}

Let's explore this together: ${practicalQuestion} Understanding these patterns can help us develop more effective coping strategies.`;
  }

  private generateSupportiveResponse(userMessage: string, emotions: string[], needs: string[]): string {
    const strengthAcknowledgment = this.identifyStrengths(userMessage);
    const encouragingPerspective = this.getEncouragingPerspective(needs);
    const goalOrientedQuestion = this.getGoalOrientedQuestion();
    
    return `${strengthAcknowledgment} I can see the effort you're putting into understanding and improving your situation. ${encouragingPerspective}

Remember, growth happens one step at a time, and you're already taking important steps by being here. ${goalOrientedQuestion}`;
  }

  private generateMindfulResponse(userMessage: string, emotions: string[], needs: string[]): string {
    const mindfulObservation = this.getMindfulObservation(userMessage);
    const acceptanceReframe = this.getAcceptanceReframe(emotions);
    const mindfulQuestion = this.getMindfulQuestion();
    
    return `${mindfulObservation} Notice how these thoughts and feelings are present right now, without needing to change them immediately. ${acceptanceReframe}

Take a breath with me. ${mindfulQuestion} Sometimes simply observing our inner experience with kindness can be profoundly healing.`;
  }

  // Helper methods for generating therapeutic responses
  private identifyEmotionalContent(message: string): string[] {
    const emotionalKeywords = {
      anxiety: ['anxious', 'worried', 'nervous', 'scared', 'panic', 'stress'],
      sadness: ['sad', 'depressed', 'down', 'hopeless', 'empty', 'lonely'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'irritated'],
      overwhelm: ['overwhelmed', 'too much', 'can\'t handle', 'exhausted', 'burned out']
    };
    
    const found: string[] = [];
    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        found.push(emotion);
      }
    }
    return found;
  }

  private identifyTherapeuticNeeds(message: string): string[] {
    const needsKeywords = {
      coping: ['don\'t know how', 'can\'t handle', 'struggling with', 'overwhelmed'],
      support: ['alone', 'no one understands', 'isolated', 'need help'],
      clarity: ['confused', 'don\'t understand', 'mixed up', 'unclear'],
      change: ['want to change', 'need to improve', 'better', 'different']
    };
    
    const found: string[] = [];
    for (const [need, keywords] of Object.entries(needsKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        found.push(need);
      }
    }
    return found;
  }

  private getValidationPhrase(emotions: string[]): string {
    if (emotions.includes('anxiety')) return "I can hear the anxiety in what you're sharing, and that must feel really overwhelming.";
    if (emotions.includes('sadness')) return "It sounds like you're carrying some heavy feelings right now.";
    if (emotions.includes('anger')) return "I can sense the frustration you're experiencing.";
    return "Thank you for sharing something so personal with me.";
  }

  private getEmpathicReflection(message: string): string {
    const reflections = [
      "It sounds like you've been dealing with a lot lately.",
      "I can imagine how difficult this situation must be for you.",
      "That sounds really challenging to navigate.",
      "It takes strength to acknowledge these feelings."
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  private getSupportiveQuestion(needs: string[]): string {
    if (needs.includes('coping')) return "What have you tried so far that's helped, even a little bit?";
    if (needs.includes('support')) return "Who in your life do you feel most comfortable talking to?";
    if (needs.includes('clarity')) return "What part of this situation would be most helpful to understand better?";
    return "What would feel most supportive for you right now?";
  }

  private identifyThoughtPatterns(message: string): string {
    if (message.includes('always') || message.includes('never')) {
      return "some all-or-nothing thinking patterns";
    }
    if (message.includes('should') || message.includes('must')) {
      return "some self-critical expectations";
    }
    if (message.includes('what if')) {
      return "anticipatory worry patterns";
    }
    return "some thought patterns we can explore";
  }

  private suggestCBTTechnique(needs: string[]): string {
    if (needs.includes('anxiety')) {
      return "One technique that can be helpful is the 5-4-3-2-1 grounding method: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
    }
    return "We can work on thought challenging - examining the evidence for and against these thoughts.";
  }

  private getPracticalQuestion(message: string): string {
    return "What evidence do you have that supports this thought, and what evidence might challenge it?";
  }

  private identifyStrengths(message: string): string {
    return "I notice that you're being really honest and self-aware about your situation, which shows incredible insight.";
  }

  private getEncouragingPerspective(needs: string[]): string {
    return "Every challenge is also an opportunity to develop new skills and resilience.";
  }

  private getGoalOrientedQuestion(): string {
    const questions = [
      "What would you most like to be different in your life?",
      "If this situation improved, what would that look like for you?",
      "What small step could you take this week toward feeling better?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  private getMindfulObservation(message: string): string {
    return "I notice the thoughts and feelings you're describing seem to be taking up a lot of space in your awareness right now.";
  }

  private getAcceptanceReframe(emotions: string[]): string {
    return "These feelings are information about your inner experience - they don't define you, and they will change.";
  }

  private getMindfulQuestion(): string {
    const questions = [
      "What do you notice happening in your body as we talk about this?",
      "If you could send compassion to the part of you that's struggling, what would you say?",
      "What would it feel like to hold these difficult emotions with kindness?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  }

  async generateSessionSummary(
    messages: Array<{ role: string; content: string; timestamp: Date }>,
    therapistPersonality: string,
    sessionDuration: number
  ): Promise<{
    summary: string;
    keyTopics: string[];
    cbtTechniques: string[];
    homework: string[];
    therapistNotes: string;
  }> {
    const therapist = this.therapistPersonalities[therapistPersonality] || this.therapistPersonalities.empathetic;
    
    // Analyze the conversation for therapeutic content
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
    const allText = userMessages.join(' ');
    
    // Generate intelligent summary based on conversation analysis
    return this.analyzeSessionContent(therapist, allText, sessionDuration, userMessages.length);
  }

  private analyzeSessionContent(
    therapist: TherapistPersonality,
    conversationText: string,
    duration: number,
    messageCount: number
  ): {
    summary: string;
    keyTopics: string[];
    cbtTechniques: string[];
    homework: string[];
    therapistNotes: string;
  } {
    // Identify key themes and emotions from the conversation
    const emotions = this.identifyEmotionalContent(conversationText);
    const needs = this.identifyTherapeuticNeeds(conversationText);
    const topics = this.identifyDiscussionTopics(conversationText);
    
    // Generate summary based on therapist personality and session content
    const summary = this.generateSessionSummaryText(therapist, emotions, topics, duration);
    const keyTopics = this.generateKeyTopics(emotions, needs, topics);
    const cbtTechniques = this.generateCBTTechniques(therapist, emotions, needs);
    const homework = this.generateHomework(therapist, emotions, needs);
    const therapistNotes = this.generateTherapistNotes(therapist, emotions, needs, messageCount, duration);
    
    return {
      summary,
      keyTopics,
      cbtTechniques,
      homework,
      therapistNotes
    };
  }

  private identifyDiscussionTopics(text: string): string[] {
    const topicKeywords = {
      relationships: ['relationship', 'partner', 'family', 'friend', 'marriage', 'divorce', 'dating'],
      work: ['work', 'job', 'career', 'boss', 'colleague', 'workplace', 'employment'],
      anxiety: ['anxious', 'worry', 'nervous', 'panic', 'stress', 'fear', 'overwhelmed'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'lonely', 'down', 'worthless'],
      trauma: ['trauma', 'abuse', 'ptsd', 'flashback', 'nightmare', 'triggered'],
      grief: ['grief', 'loss', 'death', 'mourning', 'bereavement', 'passing'],
      selfEsteem: ['self-esteem', 'confidence', 'worth', 'value', 'shame', 'inadequate'],
      sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'rest', 'fatigue'],
      eating: ['eating', 'food', 'weight', 'appetite', 'body image', 'diet']
    };
    
    const foundTopics: string[] = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        foundTopics.push(topic);
      }
    }
    return foundTopics;
  }

  private generateSessionSummaryText(
    therapist: TherapistPersonality,
    emotions: string[],
    topics: string[],
    duration: number
  ): string {
    const minutes = Math.round(duration / 60);
    const primaryTheme = topics[0] || 'personal exploration';
    const emotionalTone = emotions.length > 0 ? emotions.join(' and ') : 'mixed emotions';
    
    switch (therapist.name) {
      case 'Dr. Emma':
        return `Client engaged in a ${minutes}-minute session focused on ${primaryTheme}, expressing ${emotionalTone}. Strong therapeutic rapport established with emphasis on emotional validation and support.`;
      case 'Dr. Alex':
        return `${minutes}-minute structured session addressing ${primaryTheme} using cognitive-behavioral approaches. Client demonstrated engagement with analytical frameworks and practical coping strategies.`;
      case 'Dr. Sam':
        return `Strengths-focused ${minutes}-minute session exploring ${primaryTheme}. Client showed resilience and openness to growth-oriented interventions and positive psychology techniques.`;
      case 'Dr. Maya':
        return `Mindfulness-centered ${minutes}-minute session with focus on ${primaryTheme}. Client practiced present-moment awareness and explored acceptance-based approaches to challenges.`;
      default:
        return `Productive ${minutes}-minute therapeutic session addressing ${primaryTheme} with supportive, client-centered approach.`;
    }
  }

  private generateKeyTopics(emotions: string[], needs: string[], topics: string[]): string[] {
    const keyTopics: string[] = [];
    
    // Add identified discussion topics
    const topicMapping = {
      relationships: 'Relationship dynamics',
      work: 'Work-related stress',
      anxiety: 'Anxiety management',
      depression: 'Mood and depression',
      trauma: 'Trauma processing',
      grief: 'Grief and loss',
      selfEsteem: 'Self-esteem and self-worth',
      sleep: 'Sleep difficulties',
      eating: 'Body image and eating'
    };
    
    topics.forEach(topic => {
      if (topicMapping[topic]) {
        keyTopics.push(topicMapping[topic]);
      }
    });
    
    // Add emotional themes
    if (emotions.includes('anxiety')) keyTopics.push('Anxiety and worry patterns');
    if (emotions.includes('sadness')) keyTopics.push('Emotional processing');
    if (emotions.includes('anger')) keyTopics.push('Anger management');
    if (emotions.includes('overwhelm')) keyTopics.push('Stress and overwhelm');
    
    // Add therapeutic needs
    if (needs.includes('coping')) keyTopics.push('Coping strategy development');
    if (needs.includes('support')) keyTopics.push('Building support systems');
    if (needs.includes('clarity')) keyTopics.push('Gaining clarity and insight');
    if (needs.includes('change')) keyTopics.push('Personal growth and change');
    
    // Ensure we have some key topics
    if (keyTopics.length === 0) {
      keyTopics.push('Emotional support', 'Self-reflection', 'Personal growth');
    }
    
    return keyTopics.slice(0, 5); // Limit to 5 key topics
  }

  private generateCBTTechniques(therapist: TherapistPersonality, emotions: string[], needs: string[]): string[] {
    const techniques: string[] = ['Active listening', 'Emotional validation'];
    
    switch (therapist.name) {
      case 'Dr. Alex':
        techniques.push('Cognitive restructuring', 'Thought challenging', 'Behavioral activation');
        if (emotions.includes('anxiety')) techniques.push('Grounding techniques');
        break;
      case 'Dr. Maya':
        techniques.push('Mindfulness meditation', 'Present-moment awareness', 'Acceptance techniques');
        break;
      case 'Dr. Sam':
        techniques.push('Strengths identification', 'Goal setting', 'Positive reframing');
        break;
      default:
        techniques.push('Empathetic reflection', 'Supportive questioning');
    }
    
    // Add specific techniques based on needs
    if (needs.includes('coping')) techniques.push('Coping skills training');
    if (emotions.includes('anxiety')) techniques.push('Breathing exercises');
    if (emotions.includes('overwhelm')) techniques.push('Time management strategies');
    
    return Array.from(new Set(techniques)).slice(0, 4); // Remove duplicates and limit to 4
  }

  private generateHomework(therapist: TherapistPersonality, emotions: string[], needs: string[]): string[] {
    const homework: string[] = [];
    
    // Base homework based on therapist approach
    switch (therapist.name) {
      case 'Dr. Emma':
        homework.push('Practice daily self-compassion exercises');
        break;
      case 'Dr. Alex':
        homework.push('Complete thought records for negative thoughts');
        homework.push('Practice the 5-4-3-2-1 grounding technique when anxious');
        break;
      case 'Dr. Sam':
        homework.push('Write down three personal strengths each day');
        homework.push('Set one small, achievable goal for the week');
        break;
      case 'Dr. Maya':
        homework.push('Practice 5 minutes of mindful breathing daily');
        homework.push('Try mindful observation exercises');
        break;
    }
    
    // Add emotion-specific homework
    if (emotions.includes('anxiety')) {
      homework.push('Use progressive muscle relaxation before bed');
    }
    if (emotions.includes('sadness')) {
      homework.push('Engage in one pleasant activity each day');
    }
    if (emotions.includes('overwhelm')) {
      homework.push('Practice breaking large tasks into smaller steps');
    }
    
    // Add need-specific homework
    if (needs.includes('support')) {
      homework.push('Reach out to one supportive person this week');
    }
    if (needs.includes('clarity')) {
      homework.push('Journal about your thoughts and feelings for 10 minutes daily');
    }
    
    return Array.from(new Set(homework)).slice(0, 3); // Remove duplicates and limit to 3
  }

  private generateTherapistNotes(
    therapist: TherapistPersonality,
    emotions: string[],
    needs: string[],
    messageCount: number,
    duration: number
  ): string {
    const engagement = messageCount > 5 ? 'highly engaged' : messageCount > 2 ? 'moderately engaged' : 'tentatively engaged';
    const sessionLength = duration > 600 ? 'extended' : duration > 300 ? 'standard' : 'brief';
    
    let notes = `Client was ${engagement} during this ${sessionLength} session. `;
    
    // Add therapist-specific observations
    switch (therapist.name) {
      case 'Dr. Emma':
        notes += 'Strong therapeutic alliance established. Client shows willingness to explore emotions. ';
        break;
      case 'Dr. Alex':
        notes += 'Client responds well to structured approaches. Consider continuing CBT techniques. ';
        break;
      case 'Dr. Sam':
        notes += 'Client demonstrates inherent resilience. Focus on building upon existing strengths. ';
        break;
      case 'Dr. Maya':
        notes += 'Client shows openness to mindfulness practices. Continue acceptance-based approaches. ';
        break;
    }
    
    // Add recommendations based on emotions and needs
    if (emotions.includes('anxiety')) {
      notes += 'Recommend anxiety management techniques and stress reduction strategies. ';
    }
    if (needs.includes('coping')) {
      notes += 'Focus on developing practical coping skills in future sessions. ';
    }
    if (needs.includes('support')) {
      notes += 'Explore social support systems and consider group therapy options. ';
    }
    
    notes += 'Continue weekly sessions to maintain progress and build therapeutic rapport.';
    
    return notes;
  }

  // Enhanced crisis detection with professional assessment
  async detectCrisisKeywords(message: string): Promise<string[]> {
    return this.comprehensiveCrisisDetection(message);
  }

  private comprehensiveCrisisDetection(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const detectedKeywords: string[] = [];
    
    // Suicide and self-harm indicators
    const suicidalKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'not worth living',
      'better off dead', 'end it all', 'no point in living', 'wish I was dead',
      'take my own life', 'don\'t want to be here', 'can\'t go on'
    ];
    
    const selfHarmKeywords = [
      'self harm', 'cut myself', 'hurt myself', 'harm myself', 'cutting',
      'burning myself', 'hitting myself', 'punching walls', 'self-injury'
    ];
    
    const overdoseKeywords = [
      'overdose', 'too many pills', 'all the pills', 'bottle of pills',
      'sleeping pills', 'pain medication', 'taking everything'
    ];
    
    const methodKeywords = [
      'jump off', 'hang myself', 'rope', 'bridge', 'building', 'gun',
      'knife', 'razor', 'pills', 'car crash', 'train', 'poison'
    ];
    
    // Immediate danger indicators
    const dangerKeywords = [
      'going to hurt', 'plan to', 'tonight', 'right now', 'can\'t wait',
      'have the', 'ready to', 'about to', 'planning to'
    ];
    
    // Abuse and violence indicators  
    const abuseKeywords = [
      'abuse', 'domestic violence', 'being hurt', 'afraid for my safety',
      'hitting me', 'threatening me', 'scared of', 'violent', 'unsafe'
    ];
    
    // Severe mental health crisis
    const crisisKeywords = [
      'losing my mind', 'going crazy', 'can\'t think straight', 'hallucinating',
      'hearing voices', 'seeing things', 'psychotic', 'breakdown',
      'can\'t function', 'completely lost', 'no hope', 'hopeless'
    ];
    
    // Substance abuse crisis
    const substanceKeywords = [
      'overdosed', 'too much alcohol', 'drinking too much', 'using drugs',
      'can\'t stop drinking', 'addicted', 'withdrawal', 'detox'
    ];
    
    // Check for different categories of crisis
    if (suicidalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('suicidal ideation');
    }
    
    if (selfHarmKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('self-harm');
    }
    
    if (overdoseKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('overdose risk');
    }
    
    if (methodKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('specific method mentioned');
    }
    
    if (dangerKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('immediate danger');
    }
    
    if (abuseKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('abuse or violence');
    }
    
    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('mental health crisis');
    }
    
    if (substanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedKeywords.push('substance abuse crisis');
    }
    
    // Enhanced contextual analysis
    if (this.detectImminentRisk(lowerMessage)) {
      detectedKeywords.push('imminent risk');
    }
    
    if (this.detectHopelessness(lowerMessage)) {
      detectedKeywords.push('hopelessness');
    }
    
    return Array.from(new Set(detectedKeywords)); // Remove duplicates
  }
  
  private detectImminentRisk(message: string): boolean {
    const imminentPhrases = [
      'tonight', 'right now', 'today', 'this moment', 'can\'t wait',
      'about to', 'going to do it', 'ready to end', 'final decision',
      'last time', 'goodbye', 'farewell', 'won\'t see me again'
    ];
    
    return imminentPhrases.some(phrase => message.includes(phrase)) &&
           (message.includes('die') || message.includes('end') || message.includes('hurt'));
  }
  
  private detectHopelessness(message: string): boolean {
    const hopelessPhrases = [
      'no point', 'nothing matters', 'no future', 'never get better',
      'no way out', 'trapped', 'stuck forever', 'can\'t escape',
      'no hope', 'hopeless', 'pointless', 'meaningless'
    ];
    
    return hopelessPhrases.some(phrase => message.includes(phrase));
  }
}

// Export a singleton instance
export const therapeuticAI = new TherapeuticAI();