/**
 * Content Analyzer - Extracts Structure from Raw Content
 *
 * Uses expert methodologies to analyze content and extract:
 * - SCQA structure (Barbara Minto)
 * - Sparkline narrative arc (Nancy Duarte)
 * - Key messages (Rule of Three)
 * - STAR moments
 * - Action titles
 */

import type { ContentAnalysis, SCQAStructure, SparklineStructure } from '../types/index.js';

export class ContentAnalyzer {
  // Signal words for SCQA detection
  private readonly situationSignals = [
    'currently', 'today', 'at present', 'historically', 'traditionally',
    'as of', 'our', 'the market', 'industry', 'context'
  ];

  private readonly complicationSignals = [
    'however', 'but', 'unfortunately', 'challenge', 'problem', 'issue',
    'risk', 'threat', 'concern', 'difficulty', 'obstacle', 'barrier',
    'yet', 'although', 'despite', 'while'
  ];

  private readonly questionSignals = [
    'how', 'what', 'why', 'when', 'where', 'which', 'should', 'could',
    'can we', 'is it possible', '?'
  ];

  private readonly answerSignals = [
    'therefore', 'thus', 'recommend', 'propose', 'suggest', 'solution',
    'answer', 'strategy', 'approach', 'plan', 'we should', 'must',
    'need to', 'the answer'
  ];

  // Sparkline detection
  private readonly whatIsSignals = [
    'currently', 'today', 'status quo', 'reality', 'actual', 'now',
    'existing', 'present state', 'as-is', 'problem'
  ];

  private readonly whatCouldBeSignals = [
    'imagine', 'vision', 'future', 'could be', 'what if', 'possibility',
    'potential', 'opportunity', 'transform', 'envision', 'ideal',
    'dream', 'goal', 'aspiration'
  ];

  /**
   * Analyze content and extract structural elements.
   */
  async analyze(content: string, contentType: string): Promise<ContentAnalysis> {
    // Parse content based on type
    const text = this.parseContent(content, contentType);
    const paragraphs = this.splitIntoParagraphs(text);
    const sentences = this.splitIntoSentences(text);

    // Extract SCQA structure
    const scqa = this.extractSCQA(paragraphs, sentences);

    // Extract Sparkline structure
    const sparkline = this.extractSparkline(paragraphs);

    // Extract key messages (max 3 - Carmine Gallo's Rule of Three)
    const keyMessages = this.extractKeyMessages(text, sentences);

    // Generate action titles
    const titles = this.generateActionTitles(keyMessages, paragraphs);

    // Identify STAR moments
    const starMoments = this.identifyStarMoments(paragraphs);

    // Estimate slide count based on content density
    const estimatedSlideCount = this.estimateSlideCount(text, paragraphs);

    return {
      scqa,
      sparkline,
      keyMessages,
      titles,
      starMoments,
      estimatedSlideCount
    };
  }

  /**
   * Parse content based on its type.
   */
  private parseContent(content: string, contentType: string): string {
    switch (contentType) {
      case 'markdown':
        return this.parseMarkdown(content);
      case 'json':
        return this.parseJSON(content);
      case 'yaml':
        return this.parseYAML(content);
      case 'text':
      default:
        return content;
    }
  }

  /**
   * Parse markdown content to plain text (preserving structure hints).
   */
  private parseMarkdown(content: string): string {
    let text = content;

    // Preserve headers as paragraph breaks with emphasis markers
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '\n[HEADER] $1\n');

    // Preserve bullet points
    text = text.replace(/^[-*+]\s+(.+)$/gm, '[BULLET] $1');

    // Preserve numbered lists
    text = text.replace(/^\d+\.\s+(.+)$/gm, '[NUMBERED] $1');

    // Remove bold/italic markers but note emphasis
    text = text.replace(/\*\*(.+?)\*\*/g, '[EMPHASIS] $1 [/EMPHASIS]');
    text = text.replace(/\*(.+?)\*/g, '$1');

    // Remove code blocks but preserve content
    text = text.replace(/```[\s\S]*?```/g, '[CODE BLOCK]');
    text = text.replace(/`(.+?)`/g, '$1');

    // Remove links but preserve text
    text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

    // Remove images but note their presence
    text = text.replace(/!\[.*?\]\(.+?\)/g, '[IMAGE]');

    return text.trim();
  }

  /**
   * Parse JSON content.
   */
  private parseJSON(content: string): string {
    try {
      const data = JSON.parse(content);
      return this.flattenObject(data);
    } catch {
      return content;
    }
  }

  /**
   * Parse YAML content.
   */
  private parseYAML(content: string): string {
    // Simple YAML parsing - extract values
    const lines = content.split('\n');
    const values: string[] = [];

    for (const line of lines) {
      const match = line.match(/^[\s-]*(?:\w+:\s*)?(.+)$/);
      if (match?.[1] && !match[1].includes(':')) {
        values.push(match[1].trim());
      }
    }

    return values.join('\n');
  }

  /**
   * Flatten object to text.
   */
  private flattenObject(obj: unknown, prefix = ''): string {
    const parts: string[] = [];

    if (typeof obj === 'string') {
      return obj;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        parts.push(this.flattenObject(item, prefix));
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        parts.push(this.flattenObject(value, newPrefix));
      }
    } else if (obj !== null && obj !== undefined) {
      parts.push(String(obj));
    }

    return parts.join('\n');
  }

  /**
   * Split text into paragraphs.
   */
  private splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Split text into sentences.
   */
  private splitIntoSentences(text: string): string[] {
    // Handle common abbreviations
    const cleaned = text
      .replace(/Mr\./g, 'Mr')
      .replace(/Mrs\./g, 'Mrs')
      .replace(/Dr\./g, 'Dr')
      .replace(/vs\./g, 'vs')
      .replace(/etc\./g, 'etc')
      .replace(/e\.g\./g, 'eg')
      .replace(/i\.e\./g, 'ie');

    return cleaned
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
  }

  /**
   * Extract SCQA structure (Barbara Minto's Pyramid Principle).
   */
  private extractSCQA(paragraphs: string[], sentences: string[]): SCQAStructure {
    let situation = '';
    let complication = '';
    let question = '';
    let answer = '';

    // Look for situation in first few paragraphs
    for (const para of paragraphs.slice(0, 3)) {
      if (this.containsSignals(para, this.situationSignals)) {
        situation = this.extractRelevantSentence(para, this.situationSignals);
        break;
      }
    }

    // Look for complication
    for (const para of paragraphs) {
      if (this.containsSignals(para, this.complicationSignals)) {
        complication = this.extractRelevantSentence(para, this.complicationSignals);
        break;
      }
    }

    // Look for question
    for (const sentence of sentences) {
      if (sentence.includes('?') || this.containsSignals(sentence, this.questionSignals)) {
        question = sentence;
        break;
      }
    }

    // Look for answer (usually after complication/question)
    for (const para of paragraphs.slice(-3)) {
      if (this.containsSignals(para, this.answerSignals)) {
        answer = this.extractRelevantSentence(para, this.answerSignals);
        break;
      }
    }

    // If no explicit structure found, infer from content
    if (!situation && paragraphs.length > 0) {
      situation = this.truncateToSentence(paragraphs[0] ?? '', 150);
    }

    if (!answer && paragraphs.length > 1) {
      const lastPara = paragraphs[paragraphs.length - 1];
      answer = lastPara ? this.truncateToSentence(lastPara, 150) : '';
    }

    return { situation, complication, question, answer };
  }

  /**
   * Extract Sparkline structure (Nancy Duarte).
   */
  private extractSparkline(paragraphs: string[]): SparklineStructure {
    const whatIs: string[] = [];
    const whatCouldBe: string[] = [];
    let callToAdventure = '';

    for (const para of paragraphs) {
      const lowerPara = para.toLowerCase();

      if (this.containsSignals(lowerPara, this.whatIsSignals)) {
        whatIs.push(this.truncateToSentence(para, 100));
      }

      if (this.containsSignals(lowerPara, this.whatCouldBeSignals)) {
        whatCouldBe.push(this.truncateToSentence(para, 100));
      }
    }

    // Call to adventure is typically near the end
    for (const para of paragraphs.slice(-2)) {
      if (this.containsSignals(para.toLowerCase(), ['join', 'together', 'action', 'start', 'begin', 'now'])) {
        callToAdventure = this.truncateToSentence(para, 150);
        break;
      }
    }

    return { whatIs, whatCouldBe, callToAdventure };
  }

  /**
   * Extract key messages (max 3 - Rule of Three).
   */
  private extractKeyMessages(text: string, sentences: string[]): string[] {
    const messages: string[] = [];

    // Look for emphasized content
    const emphasisMatches = text.match(/\[EMPHASIS\](.+?)\[\/EMPHASIS\]/g);
    if (emphasisMatches) {
      for (const match of emphasisMatches.slice(0, 3)) {
        const content = match.replace(/\[EMPHASIS\]|\[\/EMPHASIS\]/g, '').trim();
        if (content.length > 10 && content.length < 100) {
          messages.push(content);
        }
      }
    }

    // Look for header content
    const headerMatches = text.match(/\[HEADER\](.+)/g);
    if (headerMatches && messages.length < 3) {
      for (const match of headerMatches.slice(0, 3 - messages.length)) {
        const content = match.replace('[HEADER]', '').trim();
        if (content.length > 5 && content.length < 80) {
          messages.push(content);
        }
      }
    }

    // If still not enough, extract from strong sentences
    if (messages.length < 3) {
      const strongSentences = sentences
        .filter(s => s.length > 20 && s.length < 100)
        .filter(s => this.containsSignals(s.toLowerCase(), ['key', 'important', 'critical', 'essential', 'must', 'need']));

      for (const sentence of strongSentences.slice(0, 3 - messages.length)) {
        messages.push(sentence);
      }
    }

    // Still not enough? Take first meaningful sentences
    if (messages.length < 3) {
      for (const sentence of sentences) {
        if (sentence.length > 30 && sentence.length < 100 && !messages.includes(sentence)) {
          messages.push(sentence);
          if (messages.length >= 3) break;
        }
      }
    }

    return messages.slice(0, 3);
  }

  /**
   * Generate action titles (McKinsey-style).
   */
  private generateActionTitles(keyMessages: string[], paragraphs: string[]): string[] {
    const titles: string[] = [];

    // Transform key messages into action titles
    for (const message of keyMessages) {
      const actionTitle = this.transformToActionTitle(message);
      if (actionTitle) {
        titles.push(actionTitle);
      }
    }

    // Generate additional titles from paragraph content
    for (const para of paragraphs) {
      if (titles.length >= 10) break;

      const headerMatch = para.match(/\[HEADER\]\s*(.+)/);
      if (headerMatch?.[1]) {
        const title = this.transformToActionTitle(headerMatch[1]);
        if (title && !titles.includes(title)) {
          titles.push(title);
        }
      }
    }

    return titles;
  }

  /**
   * Transform a statement into an action title.
   */
  private transformToActionTitle(statement: string): string {
    // Remove markers
    let title = statement.replace(/\[(HEADER|EMPHASIS|BULLET|NUMBERED)\]/g, '').trim();

    // If already starts with action verb, clean and return
    const actionVerbs = ['increase', 'decrease', 'improve', 'reduce', 'achieve', 'deliver', 'create', 'build', 'launch', 'transform', 'enable', 'drive'];
    const firstWord = title.split(' ')[0]?.toLowerCase();

    if (firstWord && actionVerbs.includes(firstWord)) {
      return this.capitalizeFirst(title);
    }

    // Try to extract or infer action
    if (title.toLowerCase().includes('should')) {
      title = title.replace(/we should|you should|should/gi, '').trim();
      return this.capitalizeFirst(title);
    }

    if (title.toLowerCase().includes('need to')) {
      title = title.replace(/we need to|you need to|need to/gi, '').trim();
      return this.capitalizeFirst(title);
    }

    // Add "Focus on" if no clear action
    if (title.length < 50) {
      return title;
    }

    return this.truncateToWords(title, 8);
  }

  /**
   * Identify STAR moments (Something They'll Always Remember).
   */
  private identifyStarMoments(paragraphs: string[]): string[] {
    const starMoments: string[] = [];
    const starSignals = [
      'surprising', 'amazing', 'incredible', 'remarkable', 'stunning',
      'imagine', 'what if', 'breakthrough', 'revolutionary', 'never before',
      'first time', 'unprecedented', 'game-changing', 'dramatic'
    ];

    for (const para of paragraphs) {
      if (this.containsSignals(para.toLowerCase(), starSignals)) {
        const moment = this.truncateToSentence(para, 120);
        if (moment.length > 20) {
          starMoments.push(moment);
        }
      }
    }

    // Also look for statistics/numbers that could be dramatic
    const statPattern = /\d+[%xX]|\$[\d,]+(?:\s*(?:million|billion|trillion))?|\d+(?:\s*(?:million|billion|trillion))/g;
    for (const para of paragraphs) {
      if (statPattern.test(para) && starMoments.length < 5) {
        const moment = this.truncateToSentence(para, 100);
        if (!starMoments.includes(moment)) {
          starMoments.push(moment);
        }
      }
    }

    return starMoments.slice(0, 5);
  }

  /**
   * Estimate slide count based on content.
   */
  private estimateSlideCount(text: string, paragraphs: string[]): number {
    const wordCount = text.split(/\s+/).length;

    // Headers suggest natural slide breaks
    const headerCount = (text.match(/\[HEADER\]/g) ?? []).length;

    // Bullet groups suggest slides
    const bulletGroups = (text.match(/\[BULLET\]/g) ?? []).length / 4; // ~4 bullets per slide

    // Base estimate: ~50 words per slide for business, ~15 for keynote
    const wordBasedEstimate = Math.ceil(wordCount / 35); // Middle ground

    // Combine estimates
    const estimate = Math.max(
      5, // Minimum 5 slides
      Math.ceil((wordBasedEstimate + headerCount + bulletGroups) / 2)
    );

    return Math.min(estimate, 30); // Cap at 30 slides
  }

  // === Helper Methods ===

  private containsSignals(text: string, signals: string[]): boolean {
    const lowerText = text.toLowerCase();
    return signals.some(signal => lowerText.includes(signal));
  }

  private extractRelevantSentence(paragraph: string, signals: string[]): string {
    const sentences = paragraph.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (this.containsSignals(sentence.toLowerCase(), signals)) {
        return sentence.trim();
      }
    }

    return this.truncateToSentence(paragraph, 150);
  }

  private truncateToSentence(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text.trim();
    }

    // Find last sentence boundary before maxLength
    const truncated = text.slice(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclaim = truncated.lastIndexOf('!');

    const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclaim);

    if (lastBoundary > maxLength * 0.5) {
      return text.slice(0, lastBoundary + 1).trim();
    }

    return truncated.trim() + '...';
  }

  private truncateToWords(text: string, maxWords: number): string {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ');
  }

  private capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
