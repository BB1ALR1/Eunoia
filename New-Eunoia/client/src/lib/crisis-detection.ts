export const CRISIS_KEYWORDS = [
  // Direct suicidal language
  'suicide', 'kill myself', 'end my life', 'take my life', 'want to die',
  'better off dead', 'end it all', 'no point living', 'life is pointless',
  'nothing matters', 'worthless', 'useless', 'burden to everyone',
  
  // Self-harm language
  'hurt myself', 'cut myself', 'self harm', 'self-harm', 'harm myself',
  'pain myself', 'punish myself', 'cut my arms', 'cut my wrists',
  
  // Method-specific language
  'overdose', 'pills', 'jump off', 'hang myself', 'rope', 'bridge',
  'gun', 'knife', 'razor', 'bleeding', 'suffocate',
  
  // Hopelessness indicators
  'no hope', 'hopeless', 'helpless', 'trapped', 'stuck forever',
  'can\'t go on', 'give up', 'quit trying', 'done trying',
  
  // Isolation language
  'nobody cares', 'all alone', 'no one understands', 'isolated',
  'abandoned', 'rejected', 'unloved', 'unwanted',
  
  // Planning language
  'plan to hurt', 'plan to die', 'thought about', 'considering',
  'preparing to', 'ready to', 'time to go', 'final goodbye',
  
  // Extreme distress
  'can\'t take it', 'too much pain', 'unbearable', 'suffering',
  'torment', 'agony', 'breaking point', 'at my limit'
];

export function detectCrisisKeywords(text: string): string[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];
  
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      detectedKeywords.push(keyword);
    }
  }
  
  return detectedKeywords;
}

export function calculateCrisisScore(text: string): number {
  const keywords = detectCrisisKeywords(text);
  const wordCount = text.split(/\s+/).length;
  
  if (keywords.length === 0) return 0;
  
  // Base score from keyword density
  const density = keywords.length / wordCount;
  let score = density * 100;
  
  // Boost score for high-risk keywords
  const highRiskKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'plan to hurt', 'plan to die', 'overdose', 'jump off'
  ];
  
  const highRiskCount = keywords.filter(keyword => 
    highRiskKeywords.includes(keyword)
  ).length;
  
  score += highRiskCount * 25;
  
  // Cap at 100
  return Math.min(score, 100);
}

export function shouldTriggerCrisisIntervention(text: string): boolean {
  const keywords = detectCrisisKeywords(text);
  const score = calculateCrisisScore(text);
  
  // Trigger if any high-risk keywords are detected or score is high
  return keywords.length > 0 || score > 30;
}
