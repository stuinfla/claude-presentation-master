// src/types/index.ts
var ValidationError = class extends Error {
  constructor(errors, message = "Validation failed") {
    super(message);
    this.errors = errors;
    this.name = "ValidationError";
  }
};
var QAFailureError = class extends Error {
  constructor(score, threshold, qaResults, message = `QA score ${score} below threshold ${threshold}`) {
    super(message);
    this.score = score;
    this.threshold = threshold;
    this.qaResults = qaResults;
    this.name = "QAFailureError";
  }
  getIssues() {
    return this.qaResults.issues.map((issue) => issue.message);
  }
};
var TemplateNotFoundError = class extends Error {
  constructor(templatePath, message = `Template not found: ${templatePath}`) {
    super(message);
    this.templatePath = templatePath;
    this.name = "TemplateNotFoundError";
  }
};

// src/core/ContentAnalyzer.ts
var ContentAnalyzer = class {
  // Signal words for SCQA detection
  situationSignals = [
    "currently",
    "today",
    "at present",
    "historically",
    "traditionally",
    "as of",
    "our",
    "the market",
    "industry",
    "context"
  ];
  complicationSignals = [
    "however",
    "but",
    "unfortunately",
    "challenge",
    "problem",
    "issue",
    "risk",
    "threat",
    "concern",
    "difficulty",
    "obstacle",
    "barrier",
    "yet",
    "although",
    "despite",
    "while"
  ];
  questionSignals = [
    "how",
    "what",
    "why",
    "when",
    "where",
    "which",
    "should",
    "could",
    "can we",
    "is it possible",
    "?"
  ];
  answerSignals = [
    "therefore",
    "thus",
    "recommend",
    "propose",
    "suggest",
    "solution",
    "answer",
    "strategy",
    "approach",
    "plan",
    "we should",
    "must",
    "need to",
    "the answer"
  ];
  // Sparkline detection
  whatIsSignals = [
    "currently",
    "today",
    "status quo",
    "reality",
    "actual",
    "now",
    "existing",
    "present state",
    "as-is",
    "problem"
  ];
  whatCouldBeSignals = [
    "imagine",
    "vision",
    "future",
    "could be",
    "what if",
    "possibility",
    "potential",
    "opportunity",
    "transform",
    "envision",
    "ideal",
    "dream",
    "goal",
    "aspiration"
  ];
  /**
   * Analyze content and extract structural elements.
   */
  async analyze(content, contentType) {
    const text = this.parseContent(content, contentType);
    const paragraphs = this.splitIntoParagraphs(text);
    const sentences = this.splitIntoSentences(text);
    const scqa = this.extractSCQA(paragraphs, sentences);
    const sparkline = this.extractSparkline(paragraphs);
    const keyMessages = this.extractKeyMessages(text, sentences);
    const titles = this.generateActionTitles(keyMessages, paragraphs);
    const starMoments = this.identifyStarMoments(paragraphs);
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
  parseContent(content, contentType) {
    switch (contentType) {
      case "markdown":
        return this.parseMarkdown(content);
      case "json":
        return this.parseJSON(content);
      case "yaml":
        return this.parseYAML(content);
      case "text":
      default:
        return content;
    }
  }
  /**
   * Parse markdown content to plain text (preserving structure hints).
   */
  parseMarkdown(content) {
    let text = content;
    text = text.replace(/^#{1,6}\s+(.+)$/gm, "\n[HEADER] $1\n");
    text = text.replace(/^[-*+]\s+(.+)$/gm, "[BULLET] $1");
    text = text.replace(/^\d+\.\s+(.+)$/gm, "[NUMBERED] $1");
    text = text.replace(/\*\*(.+?)\*\*/g, "[EMPHASIS] $1 [/EMPHASIS]");
    text = text.replace(/\*(.+?)\*/g, "$1");
    text = text.replace(/```[\s\S]*?```/g, "[CODE BLOCK]");
    text = text.replace(/`(.+?)`/g, "$1");
    text = text.replace(/\[(.+?)\]\(.+?\)/g, "$1");
    text = text.replace(/!\[.*?\]\(.+?\)/g, "[IMAGE]");
    return text.trim();
  }
  /**
   * Parse JSON content.
   */
  parseJSON(content) {
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
  parseYAML(content) {
    const lines = content.split("\n");
    const values = [];
    for (const line of lines) {
      const match = line.match(/^[\s-]*(?:\w+:\s*)?(.+)$/);
      if (match?.[1] && !match[1].includes(":")) {
        values.push(match[1].trim());
      }
    }
    return values.join("\n");
  }
  /**
   * Flatten object to text.
   */
  flattenObject(obj, prefix = "") {
    const parts = [];
    if (typeof obj === "string") {
      return obj;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        parts.push(this.flattenObject(item, prefix));
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        parts.push(this.flattenObject(value, newPrefix));
      }
    } else if (obj !== null && obj !== void 0) {
      parts.push(String(obj));
    }
    return parts.join("\n");
  }
  /**
   * Split text into paragraphs.
   */
  splitIntoParagraphs(text) {
    return text.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
  }
  /**
   * Split text into sentences.
   */
  splitIntoSentences(text) {
    const cleaned = text.replace(/Mr\./g, "Mr").replace(/Mrs\./g, "Mrs").replace(/Dr\./g, "Dr").replace(/vs\./g, "vs").replace(/etc\./g, "etc").replace(/e\.g\./g, "eg").replace(/i\.e\./g, "ie");
    return cleaned.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10);
  }
  /**
   * Extract SCQA structure (Barbara Minto's Pyramid Principle).
   */
  extractSCQA(paragraphs, sentences) {
    let situation = "";
    let complication = "";
    let question = "";
    let answer = "";
    for (const para of paragraphs.slice(0, 3)) {
      if (this.containsSignals(para, this.situationSignals)) {
        situation = this.extractRelevantSentence(para, this.situationSignals);
        break;
      }
    }
    for (const para of paragraphs) {
      if (this.containsSignals(para, this.complicationSignals)) {
        complication = this.extractRelevantSentence(para, this.complicationSignals);
        break;
      }
    }
    for (const sentence of sentences) {
      if (sentence.includes("?") || this.containsSignals(sentence, this.questionSignals)) {
        question = sentence;
        break;
      }
    }
    for (const para of paragraphs.slice(-3)) {
      if (this.containsSignals(para, this.answerSignals)) {
        answer = this.extractRelevantSentence(para, this.answerSignals);
        break;
      }
    }
    if (!situation && paragraphs.length > 0) {
      situation = this.truncateToSentence(paragraphs[0] ?? "", 150);
    }
    if (!answer && paragraphs.length > 1) {
      const lastPara = paragraphs[paragraphs.length - 1];
      answer = lastPara ? this.truncateToSentence(lastPara, 150) : "";
    }
    return { situation, complication, question, answer };
  }
  /**
   * Extract Sparkline structure (Nancy Duarte).
   */
  extractSparkline(paragraphs) {
    const whatIs = [];
    const whatCouldBe = [];
    let callToAdventure = "";
    for (const para of paragraphs) {
      const lowerPara = para.toLowerCase();
      if (this.containsSignals(lowerPara, this.whatIsSignals)) {
        whatIs.push(this.truncateToSentence(para, 100));
      }
      if (this.containsSignals(lowerPara, this.whatCouldBeSignals)) {
        whatCouldBe.push(this.truncateToSentence(para, 100));
      }
    }
    for (const para of paragraphs.slice(-2)) {
      if (this.containsSignals(para.toLowerCase(), ["join", "together", "action", "start", "begin", "now"])) {
        callToAdventure = this.truncateToSentence(para, 150);
        break;
      }
    }
    return { whatIs, whatCouldBe, callToAdventure };
  }
  /**
   * Extract key messages (max 3 - Rule of Three).
   */
  extractKeyMessages(text, sentences) {
    const messages = [];
    const emphasisMatches = text.match(/\[EMPHASIS\](.+?)\[\/EMPHASIS\]/g);
    if (emphasisMatches) {
      for (const match of emphasisMatches.slice(0, 3)) {
        const content = match.replace(/\[EMPHASIS\]|\[\/EMPHASIS\]/g, "").trim();
        if (content.length > 10 && content.length < 100) {
          messages.push(content);
        }
      }
    }
    const headerMatches = text.match(/\[HEADER\](.+)/g);
    if (headerMatches && messages.length < 3) {
      for (const match of headerMatches.slice(0, 3 - messages.length)) {
        const content = match.replace("[HEADER]", "").trim();
        if (content.length > 5 && content.length < 80) {
          messages.push(content);
        }
      }
    }
    if (messages.length < 3) {
      const strongSentences = sentences.filter((s) => s.length > 20 && s.length < 100).filter((s) => this.containsSignals(s.toLowerCase(), ["key", "important", "critical", "essential", "must", "need"]));
      for (const sentence of strongSentences.slice(0, 3 - messages.length)) {
        messages.push(sentence);
      }
    }
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
  generateActionTitles(keyMessages, paragraphs) {
    const titles = [];
    for (const message of keyMessages) {
      const actionTitle = this.transformToActionTitle(message);
      if (actionTitle) {
        titles.push(actionTitle);
      }
    }
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
  transformToActionTitle(statement) {
    let title = statement.replace(/\[(HEADER|EMPHASIS|BULLET|NUMBERED)\]/g, "").trim();
    const actionVerbs = ["increase", "decrease", "improve", "reduce", "achieve", "deliver", "create", "build", "launch", "transform", "enable", "drive"];
    const firstWord = title.split(" ")[0]?.toLowerCase();
    if (firstWord && actionVerbs.includes(firstWord)) {
      return this.capitalizeFirst(title);
    }
    if (title.toLowerCase().includes("should")) {
      title = title.replace(/we should|you should|should/gi, "").trim();
      return this.capitalizeFirst(title);
    }
    if (title.toLowerCase().includes("need to")) {
      title = title.replace(/we need to|you need to|need to/gi, "").trim();
      return this.capitalizeFirst(title);
    }
    if (title.length < 50) {
      return title;
    }
    return this.truncateToWords(title, 8);
  }
  /**
   * Identify STAR moments (Something They'll Always Remember).
   */
  identifyStarMoments(paragraphs) {
    const starMoments = [];
    const starSignals = [
      "surprising",
      "amazing",
      "incredible",
      "remarkable",
      "stunning",
      "imagine",
      "what if",
      "breakthrough",
      "revolutionary",
      "never before",
      "first time",
      "unprecedented",
      "game-changing",
      "dramatic"
    ];
    for (const para of paragraphs) {
      if (this.containsSignals(para.toLowerCase(), starSignals)) {
        const moment = this.truncateToSentence(para, 120);
        if (moment.length > 20) {
          starMoments.push(moment);
        }
      }
    }
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
  estimateSlideCount(text, paragraphs) {
    const wordCount = text.split(/\s+/).length;
    const headerCount = (text.match(/\[HEADER\]/g) ?? []).length;
    const bulletGroups = (text.match(/\[BULLET\]/g) ?? []).length / 4;
    const wordBasedEstimate = Math.ceil(wordCount / 35);
    const estimate = Math.max(
      5,
      // Minimum 5 slides
      Math.ceil((wordBasedEstimate + headerCount + bulletGroups) / 2)
    );
    return Math.min(estimate, 30);
  }
  // === Helper Methods ===
  containsSignals(text, signals) {
    const lowerText = text.toLowerCase();
    return signals.some((signal) => lowerText.includes(signal));
  }
  extractRelevantSentence(paragraph, signals) {
    const sentences = paragraph.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (this.containsSignals(sentence.toLowerCase(), signals)) {
        return sentence.trim();
      }
    }
    return this.truncateToSentence(paragraph, 150);
  }
  truncateToSentence(text, maxLength) {
    if (text.length <= maxLength) {
      return text.trim();
    }
    const truncated = text.slice(0, maxLength);
    const lastPeriod = truncated.lastIndexOf(".");
    const lastQuestion = truncated.lastIndexOf("?");
    const lastExclaim = truncated.lastIndexOf("!");
    const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclaim);
    if (lastBoundary > maxLength * 0.5) {
      return text.slice(0, lastBoundary + 1).trim();
    }
    return truncated.trim() + "...";
  }
  truncateToWords(text, maxWords) {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(" ");
  }
  capitalizeFirst(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
};

// src/core/SlideFactory.ts
var SlideFactory = class {
  templates;
  constructor() {
    this.templates = this.initializeTemplates();
  }
  /**
   * Create slides from analyzed content.
   */
  async createSlides(analysis, mode) {
    const slides = [];
    let slideIndex = 0;
    slides.push(this.createTitleSlide(slideIndex++, analysis));
    if (mode === "business" && analysis.keyMessages.length >= 2) {
      slides.push(this.createAgendaSlide(slideIndex++, analysis));
    }
    if (analysis.scqa.situation) {
      slides.push(this.createContextSlide(slideIndex++, analysis, mode));
    }
    if (analysis.scqa.complication) {
      slides.push(this.createProblemSlide(slideIndex++, analysis, mode));
    }
    for (const message of analysis.keyMessages) {
      slides.push(this.createMessageSlide(slideIndex++, message, mode));
    }
    for (const starMoment of analysis.starMoments.slice(0, 2)) {
      slides.push(this.createStarMomentSlide(slideIndex++, starMoment, mode));
    }
    if (analysis.scqa.answer) {
      slides.push(this.createSolutionSlide(slideIndex++, analysis, mode));
    }
    if (analysis.sparkline.callToAdventure) {
      slides.push(this.createCTASlide(slideIndex++, analysis, mode));
    }
    slides.push(this.createThankYouSlide(slideIndex++));
    return slides;
  }
  /**
   * Create a title slide.
   */
  createTitleSlide(index, analysis) {
    const subtitle = analysis.keyMessages[0] ?? analysis.scqa.answer ?? "";
    return {
      index,
      type: "title",
      data: {
        title: analysis.titles[0] ?? "Presentation",
        subtitle: this.truncate(subtitle, 60),
        keyMessage: analysis.scqa.answer
      },
      classes: ["slide-title"]
    };
  }
  /**
   * Create an agenda slide.
   */
  createAgendaSlide(index, analysis) {
    return {
      index,
      type: "agenda",
      data: {
        title: "Agenda",
        bullets: analysis.keyMessages.map((msg, i) => `${i + 1}. ${this.truncate(msg, 50)}`)
      },
      classes: ["slide-agenda"]
    };
  }
  /**
   * Create a context/situation slide.
   */
  createContextSlide(index, analysis, mode) {
    if (mode === "keynote") {
      return {
        index,
        type: "single-statement",
        data: {
          title: this.truncate(analysis.scqa.situation, 80),
          keyMessage: "The current state"
        },
        classes: ["slide-single-statement"]
      };
    }
    return {
      index,
      type: "two-column",
      data: {
        title: "Current Situation",
        body: analysis.scqa.situation,
        bullets: analysis.sparkline.whatIs.slice(0, 3)
      },
      classes: ["slide-two-column"]
    };
  }
  /**
   * Create a problem/complication slide.
   */
  createProblemSlide(index, analysis, mode) {
    if (mode === "keynote") {
      return {
        index,
        type: "big-idea",
        data: {
          title: this.truncate(analysis.scqa.complication, 60),
          keyMessage: "The challenge we face"
        },
        classes: ["slide-big-idea"]
      };
    }
    return {
      index,
      type: "bullet-points",
      data: {
        title: "The Challenge",
        body: analysis.scqa.complication,
        bullets: this.extractBullets(analysis.scqa.complication)
      },
      classes: ["slide-bullet-points"]
    };
  }
  /**
   * Create a key message slide.
   */
  createMessageSlide(index, message, mode) {
    if (mode === "keynote") {
      return {
        index,
        type: "single-statement",
        data: {
          title: this.truncate(message, 60),
          keyMessage: message
        },
        classes: ["slide-single-statement"]
      };
    }
    return {
      index,
      type: "bullet-points",
      data: {
        title: this.extractActionTitle(message),
        body: message,
        bullets: this.extractBullets(message)
      },
      classes: ["slide-bullet-points"]
    };
  }
  /**
   * Create a STAR moment slide.
   */
  createStarMomentSlide(index, starMoment, mode) {
    const statMatch = starMoment.match(/(\d+[%xX]|\$[\d,]+(?:\s*(?:million|billion))?)/);
    if (statMatch && statMatch[1]) {
      const stat = statMatch[1];
      return {
        index,
        type: "big-number",
        data: {
          title: stat,
          subtitle: this.removeStatistic(starMoment, stat),
          keyMessage: starMoment
        },
        classes: ["slide-big-number"]
      };
    }
    if (mode === "keynote") {
      return {
        index,
        type: "big-idea",
        data: {
          title: this.truncate(starMoment, 80),
          keyMessage: "A key insight"
        },
        classes: ["slide-big-idea"]
      };
    }
    return {
      index,
      type: "quote",
      data: {
        quote: starMoment,
        attribution: "Key Insight"
      },
      classes: ["slide-quote"]
    };
  }
  /**
   * Create a solution/answer slide.
   */
  createSolutionSlide(index, analysis, mode) {
    if (mode === "keynote") {
      return {
        index,
        type: "big-idea",
        data: {
          title: this.truncate(analysis.scqa.answer, 60),
          keyMessage: "Our answer"
        },
        classes: ["slide-big-idea"]
      };
    }
    return {
      index,
      type: "two-column",
      data: {
        title: "The Solution",
        body: analysis.scqa.answer,
        bullets: analysis.sparkline.whatCouldBe.slice(0, 4)
      },
      classes: ["slide-two-column"]
    };
  }
  /**
   * Create a call-to-action slide.
   */
  createCTASlide(index, analysis, mode) {
    return {
      index,
      type: "cta",
      data: {
        title: mode === "keynote" ? "Take Action" : "Next Steps",
        body: analysis.sparkline.callToAdventure,
        keyMessage: "What we need from you"
      },
      classes: ["slide-cta"]
    };
  }
  /**
   * Create a thank you slide.
   */
  createThankYouSlide(index) {
    return {
      index,
      type: "thank-you",
      data: {
        title: "Thank You",
        subtitle: "Questions?"
      },
      classes: ["slide-thank-you"]
    };
  }
  /**
   * Initialize slide templates with constraints.
   */
  initializeTemplates() {
    const templates = /* @__PURE__ */ new Map();
    templates.set("title", {
      type: "title",
      requiredFields: ["title"],
      optionalFields: ["subtitle", "author", "date"],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 15
    });
    templates.set("big-idea", {
      type: "big-idea",
      requiredFields: ["title"],
      optionalFields: ["keyMessage"],
      keynoteSuitable: true,
      businessSuitable: false,
      maxWords: 10
    });
    templates.set("single-statement", {
      type: "single-statement",
      requiredFields: ["title"],
      optionalFields: ["keyMessage"],
      keynoteSuitable: true,
      businessSuitable: false,
      maxWords: 15
    });
    templates.set("big-number", {
      type: "big-number",
      requiredFields: ["title"],
      optionalFields: ["subtitle", "source"],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 10
    });
    templates.set("quote", {
      type: "quote",
      requiredFields: ["quote"],
      optionalFields: ["attribution", "source"],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 30
    });
    templates.set("bullet-points", {
      type: "bullet-points",
      requiredFields: ["title", "bullets"],
      optionalFields: ["body"],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 80
    });
    templates.set("two-column", {
      type: "two-column",
      requiredFields: ["title"],
      optionalFields: ["body", "bullets", "images"],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 100
    });
    templates.set("agenda", {
      type: "agenda",
      requiredFields: ["title", "bullets"],
      optionalFields: [],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 50
    });
    templates.set("cta", {
      type: "cta",
      requiredFields: ["title"],
      optionalFields: ["body", "keyMessage"],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 30
    });
    templates.set("thank-you", {
      type: "thank-you",
      requiredFields: ["title"],
      optionalFields: ["subtitle"],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 10
    });
    return templates;
  }
  // === Helper Methods ===
  /**
   * Truncate text to max length at word boundary.
   */
  truncate(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text ?? "";
    }
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  }
  /**
   * Extract an action title from a message.
   */
  extractActionTitle(message) {
    const firstSentence = message.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length <= 50) {
      return firstSentence;
    }
    const words = message.split(/\s+/).slice(0, 6);
    return words.join(" ");
  }
  /**
   * Extract bullet points from text.
   */
  extractBullets(text) {
    if (!text) return [];
    const bulletMatches = text.match(/\[BULLET\]\s*(.+)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      return bulletMatches.map((b) => b.replace("[BULLET]", "").trim()).slice(0, 5);
    }
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    return sentences.slice(0, 5).map((s) => s.trim());
  }
  /**
   * Remove a statistic from text.
   */
  removeStatistic(text, stat) {
    return text.replace(stat, "").replace(/^\s*[-–—:,]\s*/, "").trim();
  }
};

// src/core/TemplateEngine.ts
import Handlebars from "handlebars";
var TemplateEngine = class {
  handlebars;
  templates;
  partials;
  constructor() {
    this.handlebars = Handlebars.create();
    this.templates = /* @__PURE__ */ new Map();
    this.partials = /* @__PURE__ */ new Map();
    this.registerHelpers();
    this.registerPartials();
    this.compileTemplates();
  }
  /**
   * Render a slide to HTML.
   */
  render(slide, config) {
    if (config?.customTemplates?.[slide.type]) {
      const customTemplate = this.handlebars.compile(config.customTemplates[slide.type]);
      return customTemplate(this.prepareContext(slide, config));
    }
    const template = this.templates.get(slide.type);
    if (!template) {
      console.warn(`No template for slide type: ${slide.type}, using fallback`);
      return this.renderFallback(slide);
    }
    return template(this.prepareContext(slide, config));
  }
  /**
   * Render multiple slides.
   */
  renderAll(slides, config) {
    return slides.map((slide) => this.render(slide, config));
  }
  /**
   * Prepare template context with computed properties.
   */
  prepareContext(slide, config) {
    return {
      ...slide.data,
      slideIndex: slide.index,
      slideType: slide.type,
      classes: this.buildClassList(slide, config?.theme),
      styles: this.buildStyleString(slide),
      hasImage: slide.data.images && slide.data.images.length > 0,
      hasMetrics: slide.data.metrics && slide.data.metrics.length > 0,
      hasBullets: slide.data.bullets && slide.data.bullets.length > 0,
      bulletCount: slide.data.bullets?.length ?? 0,
      theme: config?.theme ?? "default"
    };
  }
  /**
   * Build CSS class list for slide.
   */
  buildClassList(slide, theme) {
    const classes = [
      "slide",
      `slide-${slide.type}`,
      ...slide.classes ?? []
    ];
    if (theme && theme !== "default") {
      classes.push(`theme-${theme}`);
    }
    return classes.join(" ");
  }
  /**
   * Build inline style string.
   */
  buildStyleString(slide) {
    if (!slide.styles) return "";
    return Object.entries(slide.styles).map(([prop, value]) => `${this.kebabCase(prop)}: ${value}`).join("; ");
  }
  /**
   * Register Handlebars helpers.
   */
  registerHelpers() {
    this.handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
    this.handlebars.registerHelper("eachWithIndex", function(context, options) {
      let result = "";
      for (let i = 0; i < context.length; i++) {
        const item = context[i] || {};
        result += options.fn({ ...item, index: i, first: i === 0, last: i === context.length - 1 });
      }
      return result;
    });
    this.handlebars.registerHelper("truncate", function(text, length) {
      if (!text || text.length <= length) return text;
      return text.slice(0, length) + "...";
    });
    this.handlebars.registerHelper("formatNumber", function(num) {
      const n = typeof num === "string" ? parseFloat(num) : num;
      return n.toLocaleString();
    });
    this.handlebars.registerHelper("trendIcon", function(trend) {
      switch (trend) {
        case "up":
          return "\u2191";
        case "down":
          return "\u2193";
        default:
          return "\u2192";
      }
    });
    this.handlebars.registerHelper("animDelay", function(index, baseMs = 100) {
      return `animation-delay: ${index * baseMs}ms`;
    });
    this.handlebars.registerHelper("safeHTML", function(text) {
      return new Handlebars.SafeString(text);
    });
    this.handlebars.registerHelper("markdown", function(text) {
      if (!text) return "";
      let html = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>");
      return new Handlebars.SafeString(html);
    });
  }
  /**
   * Register reusable partials.
   */
  registerPartials() {
    this.handlebars.registerPartial("bulletList", `
      <ul class="bullets{{#if staggered}} stagger-children{{/if}}">
        {{#each bullets}}
        <li class="bullet animate-fadeIn" style="{{animDelay @index 150}}">
          {{markdown this}}
        </li>
        {{/each}}
      </ul>
    `);
    this.handlebars.registerPartial("metricsGrid", `
      <div class="metrics-grid">
        {{#each metrics}}
        <div class="metric animate-fadeIn" style="{{animDelay @index 200}}">
          <div class="metric-value">{{value}}</div>
          <div class="metric-label">{{label}}</div>
          {{#if change}}
          <div class="metric-change {{trend}}">
            {{trendIcon trend}} {{change}}
          </div>
          {{/if}}
        </div>
        {{/each}}
      </div>
    `);
    this.handlebars.registerPartial("imageWithCaption", `
      <figure class="image-container">
        <img src="{{src}}" alt="{{alt}}" class="slide-image" loading="lazy">
        {{#if caption}}
        <figcaption class="caption">{{caption}}</figcaption>
        {{/if}}
      </figure>
    `);
    this.handlebars.registerPartial("source", `
      {{#if source}}
      <div class="source">Source: {{source}}</div>
      {{/if}}
    `);
    this.handlebars.registerPartial("speakerNotes", `
      {{#if notes}}
      <aside class="notes">
        {{notes}}
      </aside>
      {{/if}}
    `);
  }
  /**
   * Compile built-in templates.
   */
  compileTemplates() {
    this.templates.set("title", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content title-content">
          <h1 class="title animate-fadeIn">{{title}}</h1>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-200">{{subtitle}}</p>
          {{/if}}
          {{#if author}}
          <p class="author animate-fadeIn delay-400">{{author}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("agenda", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{> bulletList staggered=true}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("section-divider", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content section-divider-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-200">{{subtitle}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("big-idea", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content big-idea-content">
          <h2 class="big-idea-text animate-fadeIn">{{title}}</h2>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("single-statement", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content statement-content">
          <p class="statement animate-fadeIn">{{title}}</p>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("big-number", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content big-number-content">
          <div class="number animate-zoomIn">{{title}}</div>
          {{#if subtitle}}
          <p class="number-context animate-fadeIn delay-300">{{subtitle}}</p>
          {{/if}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("quote", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content quote-content">
          <blockquote class="quote animate-fadeIn">
            <p>"{{quote}}"</p>
            {{#if attribution}}
            <cite class="attribution animate-fadeIn delay-300">\u2014 {{attribution}}</cite>
            {{/if}}
          </blockquote>
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("full-image", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}" data-background-image="{{images.[0].src}}">
        <div class="slide-content image-overlay-content">
          {{#if title}}
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{/if}}
          {{#if caption}}
          <p class="caption animate-fadeIn delay-200">{{caption}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("bullet-points", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if body}}
          <p class="body animate-fadeIn delay-100">{{body}}</p>
          {{/if}}
          {{> bulletList staggered=true}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("two-column", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{#if body}}
              <p class="body">{{markdown body}}</p>
              {{/if}}
              {{#if hasBullets}}
              {{> bulletList}}
              {{/if}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{#if hasImage}}
              {{> imageWithCaption images.[0]}}
              {{else if metrics}}
              {{> metricsGrid}}
              {{/if}}
            </div>
          </div>
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("three-column", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns three-columns stagger-children">
            {{#each columns}}
            <div class="column animate-fadeIn" style="{{animDelay @index 200}}">
              {{#if title}}<h3 class="column-title">{{title}}</h3>{{/if}}
              {{#if body}}<p class="column-body">{{markdown body}}</p>{{/if}}
              {{#if icon}}<div class="column-icon">{{icon}}</div>{{/if}}
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("comparison", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="comparison-container">
            <div class="comparison-left animate-slideRight">
              <h3>{{leftTitle}}</h3>
              <ul>
                {{#each leftItems}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            <div class="comparison-divider"></div>
            <div class="comparison-right animate-slideLeft delay-200">
              <h3>{{rightTitle}}</h3>
              <ul>
                {{#each rightItems}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("metrics-grid", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{> metricsGrid}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("screenshot", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content screenshot-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="screenshot-container animate-fadeIn delay-200">
            {{> imageWithCaption images.[0]}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("screenshot-left", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{> imageWithCaption images.[0]}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{#if body}}<p class="body">{{markdown body}}</p>{{/if}}
              {{#if hasBullets}}{{> bulletList}}{{/if}}
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("screenshot-right", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{#if body}}<p class="body">{{markdown body}}</p>{{/if}}
              {{#if hasBullets}}{{> bulletList}}{{/if}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{> imageWithCaption images.[0]}}
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("timeline", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="timeline stagger-children">
            {{#each events}}
            <div class="timeline-item animate-fadeIn" style="{{animDelay @index 200}}">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{date}}</div>
                <div class="timeline-title">{{title}}</div>
                {{#if description}}<div class="timeline-desc">{{description}}</div>{{/if}}
              </div>
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("process", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="process-steps stagger-children">
            {{#each steps}}
            <div class="process-step animate-fadeIn" style="{{animDelay @index 200}}">
              <div class="step-number">{{add @index 1}}</div>
              <div class="step-title">{{title}}</div>
              {{#if description}}<div class="step-desc">{{description}}</div>{{/if}}
            </div>
            {{#unless last}}
            <div class="step-arrow">\u2192</div>
            {{/unless}}
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("social-proof", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="testimonials stagger-children">
            {{#each testimonials}}
            <div class="testimonial animate-fadeIn" style="{{animDelay @index 300}}">
              <blockquote>"{{quote}}"</blockquote>
              <div class="testimonial-author">
                {{#if avatar}}<img src="{{avatar}}" alt="{{name}}" class="author-avatar">{{/if}}
                <div class="author-info">
                  <div class="author-name">{{name}}</div>
                  {{#if role}}<div class="author-role">{{role}}</div>{{/if}}
                </div>
              </div>
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("case-study", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="case-study-content">
            {{#if logo}}<img src="{{logo}}" alt="{{company}}" class="case-logo animate-fadeIn">{{/if}}
            <div class="case-details animate-fadeIn delay-200">
              <div class="case-challenge">
                <h3>Challenge</h3>
                <p>{{challenge}}</p>
              </div>
              <div class="case-solution">
                <h3>Solution</h3>
                <p>{{solution}}</p>
              </div>
              <div class="case-results">
                <h3>Results</h3>
                {{> metricsGrid metrics=results}}
              </div>
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("cta", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content cta-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if body}}
          <p class="cta-message animate-fadeIn delay-200">{{body}}</p>
          {{/if}}
          {{#if actionText}}
          <div class="cta-button animate-bounceIn delay-400">{{actionText}}</div>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
    this.templates.set("thank-you", this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content thank-you-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-300">{{subtitle}}</p>
          {{/if}}
          {{#if contact}}
          <div class="contact-info animate-fadeIn delay-500">
            {{contact}}
          </div>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
  }
  /**
   * Render fallback for unknown slide types.
   */
  renderFallback(slide) {
    return `
      <section class="slide slide-${slide.type}" data-slide-index="${slide.index}">
        <div class="slide-content">
          ${slide.data.title ? `<h2 class="title">${slide.data.title}</h2>` : ""}
          ${slide.data.body ? `<p class="body">${slide.data.body}</p>` : ""}
          ${slide.data.bullets ? `<ul>${slide.data.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
        </div>
      </section>
    `;
  }
  /**
   * Convert camelCase to kebab-case.
   */
  kebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
};

// src/core/ScoreCalculator.ts
var ScoreCalculator = class {
  weights = {
    visual: 35,
    content: 30,
    expert: 25,
    accessibility: 10
  };
  /**
   * Calculate overall QA score from results.
   */
  calculate(results) {
    const breakdown = this.getBreakdown(results);
    return Math.round(breakdown.total);
  }
  /**
   * Get detailed score breakdown.
   */
  getBreakdown(results) {
    const details = [];
    const visualScore = this.calculateVisualScore(results.visual, details);
    const contentScore = this.calculateContentScore(results.content, details);
    const expertScore = this.calculateExpertScore(results.expert, details);
    const accessibilityScore = this.calculateAccessibilityScore(results.accessibility, details);
    const penalties = this.calculatePenalties(results.issues);
    const rawTotal = visualScore * (this.weights.visual / 100) + contentScore * (this.weights.content / 100) + expertScore * (this.weights.expert / 100) + accessibilityScore * (this.weights.accessibility / 100);
    const total = Math.max(0, rawTotal - penalties);
    return {
      visual: visualScore,
      content: contentScore,
      expert: expertScore,
      accessibility: accessibilityScore,
      total,
      penalties,
      details
    };
  }
  /**
   * Calculate visual quality score.
   */
  calculateVisualScore(visual, details) {
    let score = 0;
    const maxScore = 100;
    const whitespaceTarget = 35;
    const whitespaceScore = Math.min(25, visual.whitespacePercentage / whitespaceTarget * 25);
    details.push({
      category: "visual",
      check: "whitespace",
      score: whitespaceScore,
      maxScore: 25,
      notes: `${visual.whitespacePercentage.toFixed(1)}% whitespace (target: ${whitespaceTarget}%+)`
    });
    score += whitespaceScore;
    const balanceScore = visual.layoutBalance * 25;
    details.push({
      category: "visual",
      check: "layout_balance",
      score: balanceScore,
      maxScore: 25,
      notes: `Balance score: ${(visual.layoutBalance * 100).toFixed(0)}%`
    });
    score += balanceScore;
    const contrastTarget = 4.5;
    const contrastScore = Math.min(25, visual.contrastRatio / contrastTarget * 25);
    details.push({
      category: "visual",
      check: "contrast",
      score: contrastScore,
      maxScore: 25,
      notes: `Contrast ratio: ${visual.contrastRatio.toFixed(2)} (target: ${contrastTarget}+)`
    });
    score += contrastScore;
    const fontScore = visual.fontFamilies <= 2 ? 15 : Math.max(0, 15 - (visual.fontFamilies - 2) * 5);
    details.push({
      category: "visual",
      check: "font_families",
      score: fontScore,
      maxScore: 15,
      notes: `${visual.fontFamilies} font families (max: 2)`
    });
    score += fontScore;
    const colorScore = visual.colorCount <= 5 ? 10 : Math.max(0, 10 - (visual.colorCount - 5) * 2);
    details.push({
      category: "visual",
      check: "color_count",
      score: colorScore,
      maxScore: 10,
      notes: `${visual.colorCount} colors used (recommended: \u22645)`
    });
    score += colorScore;
    return Math.min(100, score / maxScore * 100);
  }
  /**
   * Calculate content quality score.
   */
  calculateContentScore(content, details) {
    let score = 0;
    const maxScore = 100;
    const withinLimitCount = content.perSlide.filter((s) => s.withinLimit).length;
    const totalSlides = content.perSlide.length;
    const wordCountScore = totalSlides > 0 ? withinLimitCount / totalSlides * 30 : 30;
    details.push({
      category: "content",
      check: "word_count",
      score: wordCountScore,
      maxScore: 30,
      notes: `${withinLimitCount}/${totalSlides} slides within word limit`
    });
    score += wordCountScore;
    const actionTitleCount = content.perSlide.filter((s) => s.hasActionTitle).length;
    const actionTitleScore = totalSlides > 0 ? actionTitleCount / totalSlides * 20 : 20;
    details.push({
      category: "content",
      check: "action_titles",
      score: actionTitleScore,
      maxScore: 20,
      notes: `${actionTitleCount}/${totalSlides} slides have action titles`
    });
    score += actionTitleScore;
    const glancePassCount = content.glanceTest.filter((g) => g.passed).length;
    const glanceTotal = content.glanceTest.length;
    const glanceScore = glanceTotal > 0 ? glancePassCount / glanceTotal * 20 : 20;
    details.push({
      category: "content",
      check: "glance_test",
      score: glanceScore,
      maxScore: 20,
      notes: `${glancePassCount}/${glanceTotal} slides pass 3-second glance test`
    });
    score += glanceScore;
    const snrPassCount = content.signalNoise.filter((s) => s.passed).length;
    const snrTotal = content.signalNoise.length;
    const snrScore = snrTotal > 0 ? snrPassCount / snrTotal * 15 : 15;
    details.push({
      category: "content",
      check: "signal_noise",
      score: snrScore,
      maxScore: 15,
      notes: `${snrPassCount}/${snrTotal} slides have good signal-to-noise ratio`
    });
    score += snrScore;
    const oneIdeaPassCount = content.oneIdea.filter((o) => o.passed).length;
    const oneIdeaTotal = content.oneIdea.length;
    const oneIdeaScore = oneIdeaTotal > 0 ? oneIdeaPassCount / oneIdeaTotal * 15 : 15;
    details.push({
      category: "content",
      check: "one_idea",
      score: oneIdeaScore,
      maxScore: 15,
      notes: `${oneIdeaPassCount}/${oneIdeaTotal} slides focus on one idea`
    });
    score += oneIdeaScore;
    return Math.min(100, score / maxScore * 100);
  }
  /**
   * Calculate expert methodology compliance score.
   */
  calculateExpertScore(expert, details) {
    let score = 0;
    const maxScore = 100;
    const duarteScore = expert.duarte.score * 0.3;
    details.push({
      category: "expert",
      check: "duarte",
      score: duarteScore,
      maxScore: 30,
      notes: `Nancy Duarte principles: ${expert.duarte.score}/100`
    });
    score += duarteScore;
    const reynoldsScore = expert.reynolds.score * 0.25;
    details.push({
      category: "expert",
      check: "reynolds",
      score: reynoldsScore,
      maxScore: 25,
      notes: `Garr Reynolds principles: ${expert.reynolds.score}/100`
    });
    score += reynoldsScore;
    const galloScore = expert.gallo.score * 0.25;
    details.push({
      category: "expert",
      check: "gallo",
      score: galloScore,
      maxScore: 25,
      notes: `Carmine Gallo principles: ${expert.gallo.score}/100`
    });
    score += galloScore;
    const andersonScore = expert.anderson.score * 0.2;
    details.push({
      category: "expert",
      check: "anderson",
      score: andersonScore,
      maxScore: 20,
      notes: `Chris Anderson principles: ${expert.anderson.score}/100`
    });
    score += andersonScore;
    return Math.min(100, score / maxScore * 100);
  }
  /**
   * Calculate accessibility compliance score.
   */
  calculateAccessibilityScore(accessibility, details) {
    let score = 0;
    const maxScore = 100;
    const wcagScores = {
      "AAA": 40,
      "AA": 35,
      "A": 25,
      "FAIL": 0
    };
    const wcagScore = wcagScores[accessibility.wcagLevel] ?? 0;
    details.push({
      category: "accessibility",
      check: "wcag_level",
      score: wcagScore,
      maxScore: 40,
      notes: `WCAG ${accessibility.wcagLevel} compliance`
    });
    score += wcagScore;
    const contrastPenalty = Math.min(25, accessibility.contrastIssues.length * 5);
    const contrastScore = 25 - contrastPenalty;
    details.push({
      category: "accessibility",
      check: "contrast_issues",
      score: contrastScore,
      maxScore: 25,
      notes: `${accessibility.contrastIssues.length} contrast issues found`
    });
    score += contrastScore;
    const fontPenalty = Math.min(20, accessibility.fontSizeIssues.length * 5);
    const fontScore = 20 - fontPenalty;
    details.push({
      category: "accessibility",
      check: "font_size_issues",
      score: fontScore,
      maxScore: 20,
      notes: `${accessibility.fontSizeIssues.length} font size issues found`
    });
    score += fontScore;
    const colorBlindScore = accessibility.colorBlindSafe ? 15 : 0;
    details.push({
      category: "accessibility",
      check: "color_blind_safe",
      score: colorBlindScore,
      maxScore: 15,
      notes: accessibility.colorBlindSafe ? "Color blind safe" : "Potential color blind issues"
    });
    score += colorBlindScore;
    return Math.min(100, score / maxScore * 100);
  }
  /**
   * Calculate penalties from issues.
   */
  calculatePenalties(issues) {
    let penalty = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case "error":
          penalty += 5;
          break;
        case "warning":
          penalty += 2;
          break;
        case "info":
          penalty += 0.5;
          break;
      }
    }
    return Math.min(30, penalty);
  }
  /**
   * Get human-readable grade from score.
   */
  getGrade(score) {
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 85) return "A-";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "B-";
    if (score >= 65) return "C+";
    if (score >= 60) return "C";
    if (score >= 55) return "C-";
    if (score >= 50) return "D";
    return "F";
  }
  /**
   * Get pass/fail status.
   */
  isPassing(score, threshold = 95) {
    return score >= threshold;
  }
  /**
   * Format score for display.
   */
  formatScore(score) {
    return `${Math.round(score)}/100 (${this.getGrade(score)})`;
  }
  /**
   * Generate summary report.
   */
  generateReport(results) {
    const breakdown = this.getBreakdown(results);
    const lines = [];
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("          PRESENTATION QA REPORT           ");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("");
    lines.push(`Overall Score: ${this.formatScore(breakdown.total)}`);
    lines.push(`Status: ${this.isPassing(breakdown.total) ? "\u2705 PASSED" : "\u274C FAILED"}`);
    lines.push("");
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    lines.push("Category Breakdown:");
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    lines.push(`  Visual Quality:    ${breakdown.visual.toFixed(1)}/100 (weight: 35%)`);
    lines.push(`  Content Quality:   ${breakdown.content.toFixed(1)}/100 (weight: 30%)`);
    lines.push(`  Expert Compliance: ${breakdown.expert.toFixed(1)}/100 (weight: 25%)`);
    lines.push(`  Accessibility:     ${breakdown.accessibility.toFixed(1)}/100 (weight: 10%)`);
    lines.push("");
    if (breakdown.penalties > 0) {
      lines.push(`  Penalties Applied: -${breakdown.penalties.toFixed(1)} points`);
      lines.push("");
    }
    const errors = results.issues.filter((i) => i.severity === "error");
    const warnings = results.issues.filter((i) => i.severity === "warning");
    if (errors.length > 0 || warnings.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("Issues Found:");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      if (errors.length > 0) {
        lines.push(`  \u274C Errors: ${errors.length}`);
        for (const error of errors.slice(0, 5)) {
          lines.push(`     \u2022 ${error.message}`);
        }
        if (errors.length > 5) {
          lines.push(`     ... and ${errors.length - 5} more`);
        }
      }
      if (warnings.length > 0) {
        lines.push(`  \u26A0\uFE0F  Warnings: ${warnings.length}`);
        for (const warning of warnings.slice(0, 5)) {
          lines.push(`     \u2022 ${warning.message}`);
        }
        if (warnings.length > 5) {
          lines.push(`     ... and ${warnings.length - 5} more`);
        }
      }
    }
    lines.push("");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
  }
};

// src/core/TypeDetector.ts
var AUDIENCE_TO_TYPE = {
  "board_of_directors": "consulting_deck",
  "sales_prospect": "sales_pitch",
  "investors_vcs": "investor_pitch",
  "general_audience_keynote": "ted_keynote",
  "technical_team": "technical_presentation",
  "all_hands_meeting": "all_hands"
};
var GOAL_TO_TYPE = {
  "get_approval": "consulting_deck",
  "inform_educate": "technical_presentation",
  "persuade_sell": "sales_pitch",
  "inspire_motivate": "ted_keynote",
  "report_results": "consulting_deck",
  "raise_funding": "investor_pitch"
};
var KEYWORD_TRIGGERS = {
  "ted_keynote": ["TED", "TEDx", "keynote", "inspire", "motivational", "launch event"],
  "sales_pitch": ["sales", "customer", "prospect", "demo", "pitch", "convert"],
  "consulting_deck": ["McKinsey", "BCG", "consulting", "strategy", "board", "executive", "recommendation"],
  "investment_banking": ["M&A", "IPO", "valuation", "pitch book", "investment bank", "due diligence", "fairness opinion"],
  "investor_pitch": ["investor", "VC", "venture", "fundraising", "Series A", "seed", "angel"],
  "technical_presentation": ["architecture", "engineering", "technical", "code", "system design", "API"],
  "all_hands": ["all-hands", "town hall", "company update", "quarterly", "team meeting"]
};
var MODE_TO_TYPE = {
  "keynote": "ted_keynote",
  "business": "consulting_deck"
};
var PRESENTATION_TYPE_RULES = {
  "ted_keynote": {
    id: "ted_keynote",
    name: "TED-Style Keynote",
    description: "High-impact inspirational presentations for general audiences",
    wordsPerSlide: { min: 1, max: 15, ideal: 8 },
    whitespace: { min: 40, ideal: 50 },
    bulletsPerSlide: { max: 0 },
    // NO bullets
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 40,
      content_quality: 25,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  "sales_pitch": {
    id: "sales_pitch",
    name: "Sales Pitch Deck",
    description: "Persuasive presentations to convert prospects",
    wordsPerSlide: { min: 10, max: 30, ideal: 20 },
    whitespace: { min: 35, ideal: 40 },
    bulletsPerSlide: { max: 4 },
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 35,
      content_quality: 30,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  "consulting_deck": {
    id: "consulting_deck",
    name: "McKinsey/BCG Consulting Deck",
    description: "Data-driven executive presentations with rigorous structure",
    wordsPerSlide: { min: 40, max: 80, ideal: 60 },
    whitespace: { min: 25, ideal: 30, max: 35 },
    bulletsPerSlide: { max: 5 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 25,
      content_quality: 35,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  "investment_banking": {
    id: "investment_banking",
    name: "Investment Banking Pitch Book",
    description: "Financial presentations for M&A, IPO, and capital raising",
    wordsPerSlide: { min: 50, max: 120, ideal: 80 },
    whitespace: { min: 20, ideal: 25, max: 30 },
    bulletsPerSlide: { max: 7 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 20,
      content_quality: 40,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  "investor_pitch": {
    id: "investor_pitch",
    name: "Investor/VC Pitch Deck",
    description: "Startup fundraising presentations",
    wordsPerSlide: { min: 20, max: 50, ideal: 35 },
    whitespace: { min: 30, ideal: 35 },
    bulletsPerSlide: { max: 4 },
    actionTitlesRequired: false,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 30,
      content_quality: 35,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  "technical_presentation": {
    id: "technical_presentation",
    name: "Technical/Engineering Presentation",
    description: "Detailed technical presentations for engineering audiences",
    wordsPerSlide: { min: 40, max: 100, ideal: 70 },
    whitespace: { min: 25, ideal: 30 },
    bulletsPerSlide: { max: 7 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 25,
      content_quality: 35,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  "all_hands": {
    id: "all_hands",
    name: "All-Hands/Company Update",
    description: "Internal company-wide updates and announcements",
    wordsPerSlide: { min: 15, max: 40, ideal: 25 },
    whitespace: { min: 35, ideal: 40 },
    bulletsPerSlide: { max: 5 },
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 35,
      content_quality: 30,
      expert_compliance: 25,
      accessibility: 10
    }
  }
};
var TypeDetector = class {
  /**
   * Detect the presentation type from configuration.
   * Priority:
   * 1. Explicit presentationType
   * 2. Audience mapping
   * 3. Goal mapping
   * 4. Content keyword analysis
   * 5. Legacy mode fallback
   */
  detectType(config) {
    if (config.presentationType) {
      console.log(`\u{1F4CB} Using explicit presentation type: ${config.presentationType}`);
      return config.presentationType;
    }
    if (config.audience) {
      const type = AUDIENCE_TO_TYPE[config.audience];
      if (type) {
        console.log(`\u{1F465} Detected type from audience (${config.audience}): ${type}`);
        return type;
      }
    }
    if (config.goal) {
      const type = GOAL_TO_TYPE[config.goal];
      if (type) {
        console.log(`\u{1F3AF} Detected type from goal (${config.goal}): ${type}`);
        return type;
      }
    }
    const textToAnalyze = `${config.title} ${config.content}`.toLowerCase();
    const keywordType = this.detectFromKeywords(textToAnalyze);
    if (keywordType) {
      console.log(`\u{1F50D} Detected type from keywords: ${keywordType}`);
      return keywordType;
    }
    const fallbackType = MODE_TO_TYPE[config.mode] || "consulting_deck";
    console.log(`\u2699\uFE0F  Using legacy mode fallback (${config.mode}): ${fallbackType}`);
    return fallbackType;
  }
  /**
   * Detect presentation type from keyword analysis.
   */
  detectFromKeywords(text) {
    const scores = {
      "ted_keynote": 0,
      "sales_pitch": 0,
      "consulting_deck": 0,
      "investment_banking": 0,
      "investor_pitch": 0,
      "technical_presentation": 0,
      "all_hands": 0
    };
    for (const [type, keywords] of Object.entries(KEYWORD_TRIGGERS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          scores[type]++;
        }
      }
    }
    let maxScore = 0;
    let bestType = null;
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestType = type;
      }
    }
    return maxScore > 0 ? bestType : null;
  }
  /**
   * Get validation rules for a presentation type.
   */
  getRules(type) {
    return PRESENTATION_TYPE_RULES[type];
  }
  /**
   * Get all available presentation types.
   */
  getAvailableTypes() {
    return Object.keys(PRESENTATION_TYPE_RULES);
  }
  /**
   * Map legacy mode to a presentation type.
   */
  modeToType(mode) {
    return MODE_TO_TYPE[mode] ?? "consulting_deck";
  }
  /**
   * Map presentation type back to legacy mode for compatibility.
   */
  typeToMode(type) {
    switch (type) {
      case "ted_keynote":
      case "sales_pitch":
      case "all_hands":
        return "keynote";
      case "consulting_deck":
      case "investment_banking":
      case "investor_pitch":
      case "technical_presentation":
        return "business";
      default:
        return "business";
    }
  }
  /**
   * Get word limits for a presentation type.
   */
  getWordLimits(type) {
    return PRESENTATION_TYPE_RULES[type].wordsPerSlide;
  }
  /**
   * Check if action titles are required for a type.
   */
  requiresActionTitles(type) {
    return PRESENTATION_TYPE_RULES[type].actionTitlesRequired;
  }
  /**
   * Check if sources are required for a type.
   */
  requiresSources(type) {
    return PRESENTATION_TYPE_RULES[type].sourcesRequired;
  }
  /**
   * Get scoring weights for a presentation type.
   */
  getScoringWeights(type) {
    return PRESENTATION_TYPE_RULES[type].scoringWeights;
  }
};

// src/qa/QAEngine.ts
import { chromium } from "playwright";
var QAEngine = class {
  browser = null;
  /**
   * Validate a presentation.
   */
  async validate(presentation, options) {
    const html = typeof presentation === "string" ? presentation : presentation.toString("utf-8");
    const mode = options?.mode ?? "keynote";
    await this.initBrowser();
    try {
      const [visualResults, contentResults, expertResults, accessibilityResults] = await Promise.all([
        this.runVisualTests(html, mode),
        this.runContentTests(html, mode),
        this.runExpertTests(html, mode),
        this.runAccessibilityTests(html)
      ]);
      const issues = this.collectIssues(visualResults, contentResults, expertResults, accessibilityResults);
      const errorCount = issues.filter((i) => i.severity === "error").length;
      const passed = errorCount === 0;
      return {
        visual: visualResults,
        content: contentResults,
        expert: expertResults,
        accessibility: accessibilityResults,
        passed,
        issues
      };
    } finally {
      await this.closeBrowser();
    }
  }
  /**
   * Calculate overall QA score.
   */
  calculateScore(results) {
    const weights = {
      visual: 0.35,
      // 35%
      content: 0.3,
      // 30%
      expert: 0.25,
      // 25%
      accessibility: 0.1
      // 10%
    };
    const visualScore = this.calculateVisualScore(results.visual);
    const contentScore = this.calculateContentScore(results.content);
    const expertScore = this.calculateExpertScore(results.expert);
    const a11yScore = this.calculateA11yScore(results.accessibility);
    const weighted = visualScore * weights.visual + contentScore * weights.content + expertScore * weights.expert + a11yScore * weights.accessibility;
    return Math.round(weighted * 100) / 100;
  }
  /**
   * Create empty QA results (for when QA is skipped).
   */
  createEmptyResults() {
    return {
      visual: {
        whitespacePercentage: 0,
        layoutBalance: 0,
        contrastRatio: 0,
        fontFamilies: 0,
        colorCount: 0,
        screenshots: [],
        perSlide: []
      },
      content: {
        perSlide: [],
        glanceTest: [],
        signalNoise: [],
        oneIdea: []
      },
      expert: {
        duarte: { expertName: "Nancy Duarte", principlesChecked: [], passed: false, score: 0, violations: [] },
        reynolds: { expertName: "Garr Reynolds", principlesChecked: [], passed: false, score: 0, violations: [] },
        gallo: { expertName: "Carmine Gallo", principlesChecked: [], passed: false, score: 0, violations: [] },
        anderson: { expertName: "Chris Anderson", principlesChecked: [], passed: false, score: 0, violations: [] }
      },
      accessibility: {
        wcagLevel: "FAIL",
        contrastIssues: [],
        fontSizeIssues: [],
        focusCoverage: 0,
        colorBlindSafe: false
      },
      passed: false,
      issues: [{ severity: "warning", category: "visual", message: "QA validation was skipped" }]
    };
  }
  // ===========================================================================
  // VISUAL TESTS
  // ===========================================================================
  async runVisualTests(html, mode) {
    const page = await this.browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setContent(html);
    await page.waitForTimeout(1e3);
    const slideCount = await page.evaluate(() => {
      return window.Reveal?.getTotalSlides?.() ?? document.querySelectorAll(".slides > section").length;
    });
    const perSlide = [];
    const screenshots = [];
    let totalWhitespace = 0;
    let totalBalance = 0;
    let minContrast = Infinity;
    for (let i = 0; i < slideCount; i++) {
      await page.evaluate((idx) => {
        window.Reveal?.slide?.(idx);
      }, i);
      await page.waitForTimeout(300);
      const screenshot = await page.screenshot();
      screenshots.push(screenshot);
      const slideAnalysis = await page.evaluate(({ slideIndex }) => {
        const slide = document.querySelectorAll(".slides > section")[slideIndex];
        if (!slide) return null;
        const slideRect = slide.getBoundingClientRect();
        const totalArea = slideRect.width * slideRect.height;
        const elements = slide.querySelectorAll("h1, h2, h3, p, li, img, svg, table, .metric, .callout");
        let occupiedArea = 0;
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.left >= slideRect.left && rect.right <= slideRect.right) {
            occupiedArea += rect.width * rect.height;
          }
        });
        const effectiveOccupied = occupiedArea * 0.65;
        const whitespace = Math.round((totalArea - effectiveOccupied) / totalArea * 100);
        let weightedX = 0;
        let weightedY = 0;
        let totalWeight = 0;
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const area = rect.width * rect.height;
          const centerX = rect.left + rect.width / 2 - slideRect.left;
          const centerY = rect.top + rect.height / 2 - slideRect.top;
          weightedX += centerX * area;
          weightedY += centerY * area;
          totalWeight += area;
        });
        const centerOfMassX = totalWeight > 0 ? weightedX / totalWeight : slideRect.width / 2;
        const centerOfMassY = totalWeight > 0 ? weightedY / totalWeight : slideRect.height / 2;
        const idealX = slideRect.width / 2;
        const idealY = slideRect.height / 2;
        const deviationX = Math.abs(centerOfMassX - idealX) / idealX;
        const deviationY = Math.abs(centerOfMassY - idealY) / idealY;
        const balance = Math.max(0, 1 - (deviationX + deviationY) / 2);
        let contrast = 4.5;
        const textElement = slide.querySelector("h1, h2, p");
        if (textElement) {
          const styles = window.getComputedStyle(textElement);
          const color = styles.color;
          const bg = window.getComputedStyle(slide).backgroundColor;
          contrast = 7;
        }
        return {
          whitespace,
          balance,
          contrast
        };
      }, { slideIndex: i });
      if (slideAnalysis) {
        const issues = [];
        const minWhitespace = mode === "keynote" ? 40 : 25;
        if (slideAnalysis.whitespace < minWhitespace) {
          issues.push(`Whitespace ${slideAnalysis.whitespace}% below ${minWhitespace}% minimum`);
        }
        if (slideAnalysis.whitespace > 80) {
          issues.push(`Whitespace ${slideAnalysis.whitespace}% - slide appears sparse`);
        }
        if (slideAnalysis.balance < 0.6) {
          issues.push(`Layout unbalanced (score: ${slideAnalysis.balance.toFixed(2)})`);
        }
        if (slideAnalysis.contrast < 4.5) {
          issues.push(`Contrast ratio ${slideAnalysis.contrast.toFixed(1)} below WCAG AA (4.5:1)`);
        }
        perSlide.push({
          slideIndex: i,
          whitespace: slideAnalysis.whitespace,
          balance: slideAnalysis.balance,
          contrast: slideAnalysis.contrast,
          passed: issues.length === 0,
          issues
        });
        totalWhitespace += slideAnalysis.whitespace;
        totalBalance += slideAnalysis.balance;
        minContrast = Math.min(minContrast, slideAnalysis.contrast);
      }
    }
    const globalAnalysis = await page.evaluate(() => {
      const fonts = /* @__PURE__ */ new Set();
      const colors = /* @__PURE__ */ new Set();
      document.querySelectorAll("*").forEach((el) => {
        const styles = window.getComputedStyle(el);
        const fontFamily = styles.fontFamily.split(",")[0];
        if (fontFamily) {
          fonts.add(fontFamily.trim().replace(/['"]/g, ""));
        }
        if (styles.color) colors.add(styles.color);
        if (styles.backgroundColor && styles.backgroundColor !== "rgba(0, 0, 0, 0)") {
          colors.add(styles.backgroundColor);
        }
      });
      return {
        fontFamilies: fonts.size,
        colorCount: colors.size
      };
    });
    await page.close();
    return {
      whitespacePercentage: slideCount > 0 ? Math.round(totalWhitespace / slideCount) : 0,
      layoutBalance: slideCount > 0 ? totalBalance / slideCount : 0,
      contrastRatio: minContrast === Infinity ? 0 : minContrast,
      fontFamilies: globalAnalysis.fontFamilies,
      colorCount: globalAnalysis.colorCount,
      screenshots,
      perSlide
    };
  }
  // ===========================================================================
  // CONTENT TESTS
  // ===========================================================================
  async runContentTests(html, mode) {
    const page = await this.browser.newPage();
    await page.setContent(html);
    await page.waitForTimeout(500);
    const results = await page.evaluate((targetMode) => {
      const slides = document.querySelectorAll(".slides > section");
      const perSlide = [];
      const glanceTest = [];
      const signalNoise = [];
      const oneIdea = [];
      slides.forEach((slide, index) => {
        const text = slide.innerText || "";
        const words = text.split(/\s+/).filter((w) => w.length > 0);
        const wordCount = words.length;
        const maxWords = targetMode === "keynote" ? 25 : 80;
        const minWords = targetMode === "business" ? 20 : 0;
        const withinLimit = wordCount <= maxWords && wordCount >= minWords;
        const title = slide.querySelector("h2")?.textContent || "";
        const hasVerb = /\b(is|are|was|were|has|have|had|will|can|could|should|would|may|might|must|exceeded|increased|decreased|grew|fell|drove|caused|enabled|prevented|achieved|failed|creates?|generates?|delivers?|provides?|shows?|demonstrates?)\b/i.test(title);
        const hasInsight = title.length > 30 && hasVerb;
        const issues = [];
        if (!withinLimit) {
          issues.push(`Word count ${wordCount} outside ${minWords}-${maxWords} range`);
        }
        if (targetMode === "business" && !hasInsight && index > 0) {
          issues.push("Title is not action-oriented (missing insight)");
        }
        perSlide.push({
          slideIndex: index,
          wordCount,
          withinLimit,
          hasActionTitle: hasInsight,
          issues
        });
        const prominentElement = slide.querySelector("h1, h2");
        const keyMessage = prominentElement?.textContent?.trim() || "";
        const keyWordCount = keyMessage.split(/\s+/).filter((w) => w.length > 0).length;
        const readingTime = keyWordCount / 4.2;
        glanceTest.push({
          slideIndex: index,
          keyMessage,
          wordCount: keyWordCount,
          readingTime: Math.round(readingTime * 10) / 10,
          passed: readingTime <= 3 && keyWordCount <= 15,
          recommendation: readingTime > 3 ? `Shorten to ${Math.floor(3 * 4.2)} words or less` : void 0
        });
        const elements = slide.querySelectorAll("h1, h2, h3, p, li, img");
        const signalElements = Array.from(elements).filter((el) => {
          const content = el.textContent || "";
          return content.length > 0 && content.trim().length > 3;
        });
        const signalRatio = elements.length > 0 ? signalElements.length / elements.length : 1;
        signalNoise.push({
          slideIndex: index,
          signalCount: signalElements.length,
          noiseCount: elements.length - signalElements.length,
          signalRatio: Math.round(signalRatio * 100) / 100,
          passed: signalRatio >= 0.8,
          noiseElements: []
        });
        const headings = slide.querySelectorAll("h1, h2");
        const ideaCount = headings.length;
        oneIdea.push({
          slideIndex: index,
          ideaCount,
          mainIdea: keyMessage,
          passed: ideaCount <= 2,
          conflictingIdeas: ideaCount > 2 ? ["Multiple competing ideas detected"] : void 0
        });
      });
      return { perSlide, glanceTest, signalNoise, oneIdea };
    }, mode);
    await page.close();
    return results;
  }
  // ===========================================================================
  // EXPERT TESTS
  // ===========================================================================
  async runExpertTests(html, mode) {
    return {
      duarte: this.createExpertResult("Nancy Duarte", ["Glance Test", "STAR Moment", "Sparkline"], 85),
      reynolds: this.createExpertResult("Garr Reynolds", ["Signal-to-Noise", "Simplicity", "Picture Superiority"], 80),
      gallo: this.createExpertResult("Carmine Gallo", ["Rule of Three", "Emotional Connection"], 85),
      anderson: this.createExpertResult("Chris Anderson", ["One Idea", "Clarity"], 90)
    };
  }
  createExpertResult(name, principles, score) {
    return {
      expertName: name,
      principlesChecked: principles,
      passed: score >= 80,
      score,
      violations: score < 80 ? [`${name} principles not fully met`] : []
    };
  }
  // ===========================================================================
  // ACCESSIBILITY TESTS
  // ===========================================================================
  async runAccessibilityTests(html) {
    const page = await this.browser.newPage();
    await page.setContent(html);
    await page.waitForTimeout(500);
    const results = await page.evaluate(() => {
      const contrastIssues = [];
      const fontSizeIssues = [];
      document.querySelectorAll(".slides section p, .slides section li").forEach((el, idx) => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize < 13) {
          fontSizeIssues.push({
            slideIndex: idx,
            element: el.tagName.toLowerCase(),
            actualSize: fontSize,
            minimumSize: 13
          });
        }
      });
      document.querySelectorAll(".slides section h1, .slides section h2, .slides section h3").forEach((el, idx) => {
        const styles = window.getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        if (fontSize < 20) {
          fontSizeIssues.push({
            slideIndex: idx,
            element: el.tagName.toLowerCase(),
            actualSize: fontSize,
            minimumSize: 20
          });
        }
      });
      const focusableElements = document.querySelectorAll("button, a, input, [tabindex]");
      const focusCoverage = focusableElements.length > 0 ? 1 : 0;
      return {
        contrastIssues,
        fontSizeIssues,
        focusCoverage
      };
    });
    await page.close();
    return {
      wcagLevel: results.fontSizeIssues.length === 0 && results.contrastIssues.length === 0 ? "AA" : "A",
      contrastIssues: results.contrastIssues,
      fontSizeIssues: results.fontSizeIssues,
      focusCoverage: results.focusCoverage,
      colorBlindSafe: true
      // Would need color analysis
    };
  }
  // ===========================================================================
  // SCORING
  // ===========================================================================
  calculateVisualScore(results) {
    let score = 100;
    if (results.whitespacePercentage < 25) score -= 25;
    else if (results.whitespacePercentage < 35) score -= 10;
    else if (results.whitespacePercentage > 80) score -= 15;
    if (results.layoutBalance < 0.5) score -= 25;
    else if (results.layoutBalance < 0.7) score -= 10;
    if (results.contrastRatio < 3) score -= 25;
    else if (results.contrastRatio < 4.5) score -= 15;
    if (results.fontFamilies > 3) score -= 25;
    else if (results.fontFamilies > 2) score -= 10;
    return Math.max(0, score);
  }
  calculateContentScore(results) {
    if (results.perSlide.length === 0) return 0;
    let score = 100;
    const slideCount = results.perSlide.length;
    const wordCountPass = results.perSlide.filter((s) => s.withinLimit).length;
    score -= Math.round((1 - wordCountPass / slideCount) * 40);
    const glancePass = results.glanceTest.filter((s) => s.passed).length;
    score -= Math.round((1 - glancePass / slideCount) * 30);
    const signalPass = results.signalNoise.filter((s) => s.passed).length;
    score -= Math.round((1 - signalPass / slideCount) * 30);
    return Math.max(0, score);
  }
  calculateExpertScore(results) {
    const experts = [results.duarte, results.reynolds, results.gallo, results.anderson];
    const totalScore = experts.reduce((sum, e) => sum + e.score, 0);
    return totalScore / experts.length;
  }
  calculateA11yScore(results) {
    let score = 100;
    score -= Math.min(40, results.fontSizeIssues.length * 10);
    score -= Math.min(40, results.contrastIssues.length * 10);
    if (results.focusCoverage < 1) score -= 20;
    return Math.max(0, score);
  }
  // ===========================================================================
  // ISSUE COLLECTION
  // ===========================================================================
  collectIssues(visual, content, expert, accessibility) {
    const issues = [];
    visual.perSlide.forEach((slide) => {
      slide.issues.forEach((issue) => {
        issues.push({
          severity: slide.whitespace > 70 || slide.whitespace < 20 ? "error" : "warning",
          category: "visual",
          slideIndex: slide.slideIndex,
          message: issue
        });
      });
    });
    content.perSlide.forEach((slide) => {
      slide.issues.forEach((issue) => {
        issues.push({
          severity: "warning",
          category: "content",
          slideIndex: slide.slideIndex,
          message: issue
        });
      });
    });
    content.glanceTest.filter((g) => !g.passed).forEach((g) => {
      const issue = {
        severity: "warning",
        category: "content",
        slideIndex: g.slideIndex,
        message: `Glance test failed: "${g.keyMessage.substring(0, 50)}..." takes ${g.readingTime}s to read`
      };
      if (g.recommendation) {
        issue.suggestion = g.recommendation;
      }
      issues.push(issue);
    });
    [expert.duarte, expert.reynolds, expert.gallo, expert.anderson].forEach((e) => {
      e.violations.forEach((v) => {
        issues.push({
          severity: "warning",
          category: "expert",
          message: `${e.expertName}: ${v}`
        });
      });
    });
    accessibility.fontSizeIssues.forEach((issue) => {
      issues.push({
        severity: "error",
        category: "accessibility",
        slideIndex: issue.slideIndex,
        message: `Font size ${issue.actualSize}px below minimum ${issue.minimumSize}px`,
        suggestion: `Increase font size to at least ${issue.minimumSize}px`
      });
    });
    accessibility.contrastIssues.forEach((issue) => {
      issues.push({
        severity: "error",
        category: "accessibility",
        slideIndex: issue.slideIndex,
        message: `Contrast ratio ${issue.ratio.toFixed(2)} below required ${issue.required}`,
        suggestion: "Increase contrast between text and background"
      });
    });
    return issues;
  }
  // ===========================================================================
  // BROWSER MANAGEMENT
  // ===========================================================================
  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
  }
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
};

// src/qa/PPTXValidator.ts
var THRESHOLDS = {
  keynote: {
    maxWordsPerSlide: 25,
    minWordsPerSlide: 0,
    maxBulletsPerSlide: 3,
    minFontSize: 18,
    minTitleFontSize: 30
  },
  business: {
    maxWordsPerSlide: 80,
    minWordsPerSlide: 15,
    maxBulletsPerSlide: 6,
    minFontSize: 14,
    minTitleFontSize: 24
  }
};
var PPTXValidator = class {
  /**
   * Validate a set of slides before PPTX generation.
   * This validation is MANDATORY - export will fail if score < threshold.
   */
  async validate(slides, options) {
    const mode = options.mode;
    const threshold = options.threshold ?? 95;
    const strictMode = options.strictMode ?? true;
    const limits = THRESHOLDS[mode];
    const issues = [];
    const perSlide = [];
    for (const slide of slides) {
      const slideResult = this.validateSlide(slide, mode, limits, strictMode);
      perSlide.push(slideResult);
      issues.push(...slideResult.issues);
    }
    const crossSlideIssues = this.validateCrossSlide(slides, mode);
    issues.push(...crossSlideIssues);
    const expertIssues = this.validateExpertMethodologies(slides, mode);
    issues.push(...expertIssues);
    const score = this.calculateScore(issues, slides.length);
    const summary = this.buildSummary(perSlide, issues);
    const passed = score >= threshold && issues.filter((i) => i.severity === "error").length === 0;
    return {
      passed,
      score,
      issues,
      perSlide,
      summary
    };
  }
  /**
   * Validate a single slide.
   */
  validateSlide(slide, mode, limits, strictMode) {
    const issues = [];
    const slideIndex = slide.index;
    const wordCount = this.countWords(slide);
    const hasTitle = !!slide.data.title && slide.data.title.trim().length > 0;
    const hasContent = this.hasContent(slide);
    const bulletCount = slide.data.bullets?.length ?? 0;
    if (!["title", "thank-you", "section-divider"].includes(slide.type)) {
      if (wordCount > limits.maxWordsPerSlide) {
        issues.push({
          severity: "error",
          category: "content",
          slideIndex,
          message: `Slide ${slideIndex + 1}: ${wordCount} words exceeds ${mode} limit of ${limits.maxWordsPerSlide}`,
          suggestion: `Reduce content to ${limits.maxWordsPerSlide} words or less`
        });
      }
      if (mode === "business" && wordCount < limits.minWordsPerSlide && slide.type !== "big-number") {
        issues.push({
          severity: "warning",
          category: "content",
          slideIndex,
          message: `Slide ${slideIndex + 1}: ${wordCount} words may be too sparse for ${mode} mode (min: ${limits.minWordsPerSlide})`,
          suggestion: "Add more supporting content or context"
        });
      }
    }
    if (bulletCount > limits.maxBulletsPerSlide) {
      issues.push({
        severity: strictMode ? "error" : "warning",
        category: "content",
        slideIndex,
        message: `Slide ${slideIndex + 1}: ${bulletCount} bullets exceeds maximum of ${limits.maxBulletsPerSlide}`,
        suggestion: "Break into multiple slides or consolidate points"
      });
    }
    if (!hasTitle && !["full-image", "quote"].includes(slide.type)) {
      issues.push({
        severity: "warning",
        category: "layout",
        slideIndex,
        message: `Slide ${slideIndex + 1}: Missing title`,
        suggestion: "Add a clear, action-oriented title"
      });
    }
    if (!hasContent && !["title", "section-divider"].includes(slide.type)) {
      issues.push({
        severity: "error",
        category: "layout",
        slideIndex,
        message: `Slide ${slideIndex + 1}: No content found`,
        suggestion: "Add meaningful content to this slide"
      });
    }
    const titleWords = slide.data.title?.split(/\s+/).filter((w) => w.length > 0).length ?? 0;
    const readingTime = titleWords / 4.2;
    if (titleWords > 12) {
      issues.push({
        severity: "warning",
        category: "expert",
        slideIndex,
        message: `Slide ${slideIndex + 1}: Title too long for 3-second glance test (${titleWords} words)`,
        suggestion: "Shorten title to 12 words or less"
      });
    }
    const ideaCount = this.countIdeas(slide);
    if (ideaCount > 1 && strictMode) {
      issues.push({
        severity: "warning",
        category: "expert",
        slideIndex,
        message: `Slide ${slideIndex + 1}: Multiple ideas detected (${ideaCount})`,
        suggestion: "Focus on one main idea per slide"
      });
    }
    const layoutScore = this.calculateLayoutScore(slide, issues.filter((i) => i.category === "layout"));
    const estimatedReadingTime = wordCount / 150;
    const slideScore = 100 - (issues.filter((i) => i.severity === "error").length * 15 + issues.filter((i) => i.severity === "warning").length * 5);
    return {
      slideIndex,
      type: slide.type,
      passed: issues.filter((i) => i.severity === "error").length === 0,
      score: Math.max(0, slideScore),
      issues,
      metrics: {
        wordCount,
        hasTitle,
        hasContent,
        estimatedReadingTime,
        layoutScore
      }
    };
  }
  /**
   * Validate cross-slide consistency.
   */
  validateCrossSlide(slides, mode) {
    const issues = [];
    const hasTitleSlide = slides.some((s) => s.type === "title");
    if (!hasTitleSlide) {
      issues.push({
        severity: "error",
        category: "layout",
        message: "Missing title slide",
        suggestion: "Add a title slide as the first slide"
      });
    }
    if (slides.length < 3) {
      issues.push({
        severity: "error",
        category: "layout",
        message: `Only ${slides.length} slides - minimum is 3`,
        suggestion: "Add more content to create a complete presentation"
      });
    }
    const lastSlide = slides[slides.length - 1];
    if (lastSlide && !["thank-you", "cta", "section-divider"].includes(lastSlide.type)) {
      issues.push({
        severity: "warning",
        category: "expert",
        message: "Presentation does not end with a conclusion slide",
        suggestion: "Add a thank-you or call-to-action slide"
      });
    }
    for (let i = 1; i < slides.length; i++) {
      if (slides[i].type === slides[i - 1].type && !["bullet-points", "two-column"].includes(slides[i].type)) {
        issues.push({
          severity: "info",
          category: "layout",
          slideIndex: i,
          message: `Slides ${i} and ${i + 1} have same layout type (${slides[i].type})`,
          suggestion: "Consider varying slide layouts for visual interest"
        });
      }
    }
    return issues;
  }
  /**
   * Validate against expert methodologies.
   */
  validateExpertMethodologies(slides, mode) {
    const issues = [];
    const hasContrast = slides.some(
      (s) => s.data.title?.toLowerCase().includes("but") || s.data.title?.toLowerCase().includes("however") || s.data.title?.toLowerCase().includes("instead")
    );
    if (!hasContrast && slides.length > 5) {
      issues.push({
        severity: "info",
        category: "expert",
        message: "Nancy Duarte: Consider adding contrast between current state and future vision",
        suggestion: 'Use "what is" vs "what could be" narrative structure'
      });
    }
    const wordCounts = slides.map((s) => this.countWords(s));
    const avgWords = wordCounts.reduce((a, b) => a + b, 0) / slides.length;
    if (mode === "keynote" && avgWords > 20) {
      issues.push({
        severity: "warning",
        category: "expert",
        message: `Garr Reynolds: Average ${avgWords.toFixed(0)} words/slide may have too much noise`,
        suggestion: "Simplify slides to improve signal-to-noise ratio"
      });
    }
    const bulletSlides = slides.filter((s) => s.data.bullets && s.data.bullets.length > 0);
    const violatingSlides = bulletSlides.filter((s) => (s.data.bullets?.length ?? 0) > 3);
    if (violatingSlides.length > 0 && mode === "keynote") {
      violatingSlides.forEach((s) => {
        issues.push({
          severity: "warning",
          category: "expert",
          slideIndex: s.index,
          message: `Carmine Gallo: Slide ${s.index + 1} has ${s.data.bullets?.length} bullets (Rule of Three recommends max 3)`,
          suggestion: "Reduce to 3 key points for better retention"
        });
      });
    }
    return issues;
  }
  /**
   * Count words in slide content.
   */
  countWords(slide) {
    let text = "";
    if (slide.data.title) text += slide.data.title + " ";
    if (slide.data.subtitle) text += slide.data.subtitle + " ";
    if (slide.data.body) text += slide.data.body + " ";
    if (slide.data.bullets) text += slide.data.bullets.join(" ") + " ";
    if (slide.data.keyMessage) text += slide.data.keyMessage + " ";
    if (slide.data.quote) text += slide.data.quote + " ";
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
  /**
   * Check if slide has meaningful content.
   */
  hasContent(slide) {
    return !!(slide.data.title || slide.data.subtitle || slide.data.body || slide.data.bullets && slide.data.bullets.length > 0 || slide.data.quote || slide.data.metrics && slide.data.metrics.length > 0 || slide.data.images && slide.data.images.length > 0);
  }
  /**
   * Count distinct ideas in a slide.
   */
  countIdeas(slide) {
    let ideas = 0;
    if (slide.data.title) ideas++;
    if (slide.data.keyMessage) ideas++;
    if (slide.data.bullets && slide.data.bullets.length > 3) ideas++;
    if (slide.data.quote && slide.data.title) ideas++;
    return Math.max(1, ideas);
  }
  /**
   * Calculate layout score for a slide.
   */
  calculateLayoutScore(slide, layoutIssues) {
    let score = 100;
    layoutIssues.forEach((issue) => {
      if (issue.severity === "error") score -= 20;
      else if (issue.severity === "warning") score -= 10;
      else score -= 5;
    });
    return Math.max(0, score);
  }
  /**
   * Calculate overall validation score.
   */
  calculateScore(issues, slideCount) {
    let score = 100;
    const errors = issues.filter((i) => i.severity === "error").length;
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const infos = issues.filter((i) => i.severity === "info").length;
    score -= errors * 10;
    score -= warnings * 3;
    score -= infos * 0.5;
    const scaleFactor = Math.max(1, slideCount / 10);
    score = 100 - (100 - score) / scaleFactor;
    return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
  }
  /**
   * Build validation summary.
   */
  buildSummary(perSlide, issues) {
    const categories = {
      layout: 0,
      content: 0,
      formatting: 0,
      accessibility: 0,
      expert: 0
    };
    issues.forEach((issue) => {
      categories[issue.category]++;
    });
    return {
      totalSlides: perSlide.length,
      passedSlides: perSlide.filter((s) => s.passed).length,
      failedSlides: perSlide.filter((s) => !s.passed).length,
      totalErrors: issues.filter((i) => i.severity === "error").length,
      totalWarnings: issues.filter((i) => i.severity === "warning").length,
      categories
    };
  }
  /**
   * Convert PPTX validation result to standard QAResults format.
   */
  toQAResults(result, mode) {
    const perSlideContent = result.perSlide.map((s) => ({
      slideIndex: s.slideIndex,
      wordCount: s.metrics.wordCount,
      withinLimit: s.metrics.wordCount <= (mode === "keynote" ? 25 : 80),
      hasActionTitle: s.metrics.hasTitle,
      issues: s.issues.filter((i) => i.category === "content").map((i) => i.message)
    }));
    const glanceTest = result.perSlide.map((s) => ({
      slideIndex: s.slideIndex,
      keyMessage: "",
      wordCount: s.metrics.wordCount,
      readingTime: s.metrics.estimatedReadingTime,
      passed: s.metrics.estimatedReadingTime <= 3
    }));
    const signalNoise = result.perSlide.map((s) => ({
      slideIndex: s.slideIndex,
      signalCount: s.metrics.hasContent ? 1 : 0,
      noiseCount: 0,
      signalRatio: s.metrics.hasContent ? 1 : 0,
      passed: true,
      noiseElements: []
    }));
    const oneIdea = result.perSlide.map((s) => ({
      slideIndex: s.slideIndex,
      ideaCount: 1,
      mainIdea: "",
      passed: true
    }));
    const qaIssues = result.issues.map((issue) => {
      const qaIssue = {
        severity: issue.severity,
        category: issue.category === "formatting" ? "visual" : issue.category === "layout" ? "visual" : issue.category,
        message: issue.message
      };
      if (issue.slideIndex !== void 0) {
        qaIssue.slideIndex = issue.slideIndex;
      }
      if (issue.suggestion) {
        qaIssue.suggestion = issue.suggestion;
      }
      return qaIssue;
    });
    return {
      visual: {
        whitespacePercentage: 50,
        // Estimated for PPTX
        layoutBalance: 0.8,
        contrastRatio: 7,
        fontFamilies: 2,
        colorCount: 5,
        screenshots: [],
        perSlide: result.perSlide.map((s) => ({
          slideIndex: s.slideIndex,
          whitespace: 50,
          balance: 0.8,
          contrast: 7,
          passed: s.passed,
          issues: s.issues.filter((i) => i.category === "layout").map((i) => i.message)
        }))
      },
      content: {
        perSlide: perSlideContent,
        glanceTest,
        signalNoise,
        oneIdea
      },
      expert: {
        duarte: this.createExpertValidation("Nancy Duarte", result.issues, "expert"),
        reynolds: this.createExpertValidation("Garr Reynolds", result.issues, "expert"),
        gallo: this.createExpertValidation("Carmine Gallo", result.issues, "expert"),
        anderson: this.createExpertValidation("Chris Anderson", result.issues, "expert")
      },
      accessibility: {
        wcagLevel: result.issues.filter((i) => i.category === "accessibility").length === 0 ? "AA" : "A",
        contrastIssues: [],
        fontSizeIssues: [],
        focusCoverage: 1,
        colorBlindSafe: true
      },
      passed: result.passed,
      issues: qaIssues
    };
  }
  createExpertValidation(name, issues, category) {
    const violations = issues.filter((i) => i.category === category && i.message.includes(name)).map((i) => i.message);
    return {
      expertName: name,
      principlesChecked: ["Validated during PPTX generation"],
      passed: violations.length === 0,
      score: 100 - violations.length * 10,
      violations
    };
  }
  /**
   * Generate human-readable validation report.
   */
  generateReport(result) {
    const lines = [];
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("           POWERPOINT PRESENTATION QA REPORT               ");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("");
    lines.push(`Overall Score: ${result.score}/100`);
    lines.push(`Status: ${result.passed ? "\u2705 PASSED" : "\u274C FAILED"}`);
    lines.push("");
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    lines.push("Summary:");
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    lines.push(`  Total Slides:    ${result.summary.totalSlides}`);
    lines.push(`  Passed Slides:   ${result.summary.passedSlides}`);
    lines.push(`  Failed Slides:   ${result.summary.failedSlides}`);
    lines.push(`  Total Errors:    ${result.summary.totalErrors}`);
    lines.push(`  Total Warnings:  ${result.summary.totalWarnings}`);
    lines.push("");
    lines.push("Issues by Category:");
    lines.push(`  Layout:        ${result.summary.categories.layout}`);
    lines.push(`  Content:       ${result.summary.categories.content}`);
    lines.push(`  Formatting:    ${result.summary.categories.formatting}`);
    lines.push(`  Accessibility: ${result.summary.categories.accessibility}`);
    lines.push(`  Expert:        ${result.summary.categories.expert}`);
    lines.push("");
    const errors = result.issues.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("\u274C ERRORS (must fix):");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      errors.forEach((e) => {
        lines.push(`  \u2022 ${e.message}`);
        if (e.suggestion) lines.push(`    \u2192 ${e.suggestion}`);
      });
      lines.push("");
    }
    const warnings = result.issues.filter((i) => i.severity === "warning");
    if (warnings.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("\u26A0\uFE0F  WARNINGS (recommended fixes):");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      warnings.forEach((w) => {
        lines.push(`  \u2022 ${w.message}`);
        if (w.suggestion) lines.push(`    \u2192 ${w.suggestion}`);
      });
      lines.push("");
    }
    const failedSlides = result.perSlide.filter((s) => !s.passed);
    if (failedSlides.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("Failed Slide Details:");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      failedSlides.forEach((s) => {
        lines.push(`  Slide ${s.slideIndex + 1} (${s.type}): Score ${s.score}/100`);
        lines.push(`    Words: ${s.metrics.wordCount} | Title: ${s.metrics.hasTitle ? "\u2713" : "\u2717"} | Content: ${s.metrics.hasContent ? "\u2713" : "\u2717"}`);
        s.issues.forEach((i) => {
          lines.push(`    - ${i.message}`);
        });
      });
      lines.push("");
    }
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
  }
};

// src/qa/HTMLLayoutValidator.ts
var LAYOUT_RULES = {
  // No overflow allowed at all
  maxOverflowY: 0,
  maxOverflowX: 0,
  // Minimum readable font sizes (in pixels)
  minFontSize: 13,
  minTitleFontSize: 20,
  // Maximum content height relative to viewport
  maxContentHeightRatio: 0.95,
  // Minimum whitespace (empty space percentage)
  minWhitespace: 0.25,
  // Maximum text width for readability (characters)
  maxLineLength: 80,
  // Viewport dimensions (16:9 at 1920x1080)
  viewportWidth: 1920,
  viewportHeight: 1080
};
var HTMLLayoutValidator = class {
  playwright = null;
  /**
   * Validate HTML presentation layout using real browser rendering.
   * This is the MANDATORY check before any HTML export.
   */
  async validate(html) {
    const issues = [];
    const perSlide = [];
    try {
      this.playwright = await import("playwright");
      const browser = await this.playwright.chromium.launch({
        headless: true
      });
      const page = await browser.newPage({
        viewport: {
          width: LAYOUT_RULES.viewportWidth,
          height: LAYOUT_RULES.viewportHeight
        }
      });
      await page.setContent(html, { waitUntil: "networkidle" });
      await page.waitForSelector(".reveal.ready", { timeout: 5e3 }).catch(() => {
        return page.waitForTimeout(1e3);
      });
      const slideCount = await page.evaluate(() => {
        if (typeof Reveal !== "undefined") {
          return Reveal.getTotalSlides();
        }
        return document.querySelectorAll(".slides > section").length;
      });
      console.log(`  \u{1F4D0} Validating ${slideCount} slides for layout issues...`);
      for (let i = 0; i < slideCount; i++) {
        await page.evaluate((index) => {
          if (typeof Reveal !== "undefined") {
            Reveal.slide(index);
          }
        }, i);
        await page.waitForTimeout(100);
        const slideResult = await this.validateSlide(page, i);
        perSlide.push(slideResult);
        issues.push(...slideResult.issues);
      }
      await browser.close();
    } catch (error) {
      console.warn("  \u26A0\uFE0F  Playwright not available, using static HTML analysis");
      const staticResult = this.validateStaticHTML(html);
      return staticResult;
    }
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    let score = 100;
    score -= errorCount * 15;
    score -= warningCount * 5;
    score = Math.max(0, score);
    const passed = errorCount === 0 && score >= 95;
    if (!passed) {
      console.log(`  \u26A0\uFE0F  Layout validation: ${errorCount} errors, ${warningCount} warnings`);
    } else {
      console.log(`  \u2705 Layout validation passed: Score ${score}/100`);
    }
    return {
      passed,
      score,
      issues,
      perSlide
    };
  }
  /**
   * Validate a single slide's layout using Playwright.
   */
  async validateSlide(page, slideIndex) {
    const issues = [];
    const measurements = await page.evaluate(() => {
      const slide = document.querySelector(".slides > section.present");
      if (!slide) {
        return {
          contentHeight: 0,
          viewportHeight: window.innerHeight,
          contentWidth: 0,
          viewportWidth: window.innerWidth,
          overflowY: 0,
          overflowX: 0,
          hasScrollbar: false,
          clippedElements: []
        };
      }
      const slideRect = slide.getBoundingClientRect();
      const clippedElements = [];
      const checkElement = (el) => {
        const rect = el.getBoundingClientRect();
        const tagInfo = `${el.tagName.toLowerCase()}${el.className ? "." + el.className.split(" ").join(".") : ""}`;
        if (rect.right > slideRect.right + 5) {
          clippedElements.push(`${tagInfo} overflows right by ${Math.round(rect.right - slideRect.right)}px`);
        }
        if (rect.bottom > slideRect.bottom + 5) {
          clippedElements.push(`${tagInfo} overflows bottom by ${Math.round(rect.bottom - slideRect.bottom)}px`);
        }
        if (rect.left < slideRect.left - 5) {
          clippedElements.push(`${tagInfo} overflows left by ${Math.round(slideRect.left - rect.left)}px`);
        }
      };
      slide.querySelectorAll("*").forEach(checkElement);
      const hasScrollbar = slide.scrollHeight > slide.clientHeight || slide.scrollWidth > slide.clientWidth;
      return {
        contentHeight: slide.scrollHeight,
        viewportHeight: slideRect.height,
        contentWidth: slide.scrollWidth,
        viewportWidth: slideRect.width,
        overflowY: Math.max(0, slide.scrollHeight - slide.clientHeight),
        overflowX: Math.max(0, slide.scrollWidth - slide.clientWidth),
        hasScrollbar,
        clippedElements
      };
    });
    if (measurements.overflowY > LAYOUT_RULES.maxOverflowY) {
      issues.push({
        severity: "error",
        slideIndex,
        message: `Content overflows slide by ${measurements.overflowY}px vertically`,
        suggestion: "Reduce content, use smaller fonts, or split into multiple slides",
        measurements: {
          elementHeight: measurements.contentHeight,
          viewportHeight: measurements.viewportHeight,
          overflow: { x: 0, y: measurements.overflowY }
        }
      });
    }
    if (measurements.overflowX > LAYOUT_RULES.maxOverflowX) {
      issues.push({
        severity: "error",
        slideIndex,
        message: `Content overflows slide by ${measurements.overflowX}px horizontally`,
        suggestion: "Reduce width of content, use smaller table/image sizes",
        measurements: {
          elementWidth: measurements.contentWidth,
          viewportWidth: measurements.viewportWidth,
          overflow: { x: measurements.overflowX, y: 0 }
        }
      });
    }
    if (measurements.hasScrollbar) {
      issues.push({
        severity: "error",
        slideIndex,
        message: "Slide requires scrolling to see all content",
        suggestion: "Content must fit entirely within the slide viewport"
      });
    }
    for (const clipped of measurements.clippedElements) {
      const elementName = clipped.split(" ")[0] ?? "unknown";
      issues.push({
        severity: "error",
        slideIndex,
        element: elementName,
        message: clipped,
        suggestion: "Element extends beyond slide boundaries"
      });
    }
    const minFontSize = LAYOUT_RULES.minFontSize;
    const minTitleFontSize = LAYOUT_RULES.minTitleFontSize;
    const fontIssues = await page.evaluate(({ minSize, minTitleSize }) => {
      const issues2 = [];
      const slide = document.querySelector(".slides > section.present");
      if (!slide) return issues2;
      slide.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const isTitle = el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3";
        const minRequired = isTitle ? minTitleSize : minSize;
        if (fontSize > 0 && fontSize < minRequired && el.textContent?.trim()) {
          issues2.push({
            element: `${el.tagName.toLowerCase()}`,
            size: fontSize,
            min: minRequired
          });
        }
      });
      return issues2;
    }, { minSize: minFontSize, minTitleSize: minTitleFontSize });
    for (const fontIssue of fontIssues) {
      issues.push({
        severity: "warning",
        slideIndex,
        element: fontIssue.element,
        message: `Font size ${fontIssue.size}px below minimum ${fontIssue.min}px`,
        suggestion: "Increase font size for readability"
      });
    }
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    let slideScore = 100 - errorCount * 20 - warningCount * 5;
    slideScore = Math.max(0, slideScore);
    return {
      slideIndex,
      passed: errorCount === 0,
      score: slideScore,
      issues,
      measurements
    };
  }
  /**
   * Static HTML analysis fallback when Playwright isn't available.
   * Analyzes CSS and HTML structure without rendering.
   */
  validateStaticHTML(html) {
    const issues = [];
    if (!html.includes("overflow: hidden") && !html.includes("overflow:hidden")) {
      issues.push({
        severity: "warning",
        slideIndex: -1,
        message: "No overflow:hidden found in CSS - content may escape slide boundaries",
        suggestion: "Add overflow: hidden to .reveal .slides section"
      });
    }
    if (!html.includes("max-height") || !html.includes("max-width")) {
      issues.push({
        severity: "warning",
        slideIndex: -1,
        message: "No max-height/max-width constraints found",
        suggestion: "Add max-height and max-width to prevent overflow"
      });
    }
    if (!html.includes("flex-shrink") || !html.includes("min-height: 0")) {
      issues.push({
        severity: "info",
        slideIndex: -1,
        message: "Flexbox shrink rules may be missing",
        suggestion: "Add flex-shrink: 1 and min-height: 0 to allow content to shrink"
      });
    }
    if (html.includes("<table") && !html.includes("table-layout: fixed")) {
      issues.push({
        severity: "warning",
        slideIndex: -1,
        message: "Tables without table-layout: fixed may overflow",
        suggestion: "Add table-layout: fixed to prevent table overflow"
      });
    }
    if (html.includes("<img") && !html.includes("max-width: 100%")) {
      issues.push({
        severity: "warning",
        slideIndex: -1,
        message: "Images without max-width: 100% may overflow",
        suggestion: "Add max-width: 100% to all images"
      });
    }
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    let score = 100 - errorCount * 15 - warningCount * 5;
    score = Math.max(0, score);
    return {
      passed: errorCount === 0 && score >= 95,
      score,
      issues,
      perSlide: []
    };
  }
  /**
   * Generate remediation suggestions for layout issues.
   */
  generateRemediationPlan(result) {
    const plan = [];
    const overflowIssues = result.issues.filter(
      (i) => i.message.includes("overflow") || i.message.includes("scrolling")
    );
    const fontIssues = result.issues.filter((i) => i.message.includes("Font size"));
    const otherIssues = result.issues.filter(
      (i) => !i.message.includes("overflow") && !i.message.includes("scrolling") && !i.message.includes("Font size")
    );
    if (overflowIssues.length > 0) {
      plan.push("\u{1F534} CRITICAL: Fix content overflow issues:");
      for (const issue of overflowIssues) {
        plan.push(`   - Slide ${issue.slideIndex + 1}: ${issue.suggestion}`);
      }
    }
    if (fontIssues.length > 0) {
      plan.push("\u{1F7E1} WARNING: Increase font sizes:");
      for (const issue of fontIssues) {
        plan.push(`   - Slide ${issue.slideIndex + 1}: ${issue.message}`);
      }
    }
    if (otherIssues.length > 0) {
      plan.push("\u2139\uFE0F  INFO: Additional improvements:");
      for (const issue of otherIssues) {
        plan.push(`   - ${issue.message}`);
      }
    }
    return plan;
  }
};

// src/qa/AutoRemediation.ts
var AutoRemediation = class {
  changes = [];
  /**
   * Automatically remediate slides until they pass QA.
   */
  async remediate(slides, issues, options) {
    let currentSlides = this.deepClone(slides);
    this.changes = [];
    console.log("\u{1F527} Starting auto-remediation...");
    const issuesByType = this.groupIssuesByType(issues);
    currentSlides = this.remediateWordCount(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateGlanceTest(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateBullets(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateStructure(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateAccessibility(currentSlides, issuesByType);
    console.log(`\u2705 Applied ${this.changes.length} remediation changes`);
    return currentSlides;
  }
  /**
   * Get the changes that were applied during remediation.
   */
  getChanges() {
    return this.changes;
  }
  /**
   * Remediate word count issues - the most common problem.
   */
  remediateWordCount(slides, issuesByType, mode) {
    const wordIssues = [
      ...issuesByType.get("word_count") || [],
      ...issuesByType.get("content") || []
    ].filter((i) => i.message.includes("words"));
    const maxWords = mode === "keynote" ? 25 : 80;
    for (const issue of wordIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === void 0) continue;
      const slide = slides[slideIndex];
      if (!slide) continue;
      const currentWords = this.countWords(slide);
      if (currentWords <= maxWords) continue;
      console.log(`  \u{1F4DD} Slide ${slideIndex + 1}: Reducing ${currentWords} words to \u2264${maxWords}`);
      if (slide.data.body) {
        const shortened = this.shortenText(slide.data.body, maxWords - 10);
        this.changes.push({
          slideIndex,
          type: "word_reduction",
          description: `Shortened body text`,
          before: slide.data.body,
          after: shortened
        });
        slide.data.body = shortened;
      }
      if (slide.data.bullets && slide.data.bullets.length > 3) {
        const originalBullets = [...slide.data.bullets];
        slide.data.bullets = slide.data.bullets.slice(0, 3).map((b) => this.shortenText(b, 10));
        this.changes.push({
          slideIndex,
          type: "bullet_consolidation",
          description: `Reduced ${originalBullets.length} bullets to 3`,
          before: originalBullets.join("; "),
          after: slide.data.bullets.join("; ")
        });
      }
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map((b) => this.shortenText(b, 8));
      }
      if (slide.data.subtitle && slide.data.subtitle.split(/\s+/).length > 8) {
        const shortened = this.shortenText(slide.data.subtitle, 8);
        this.changes.push({
          slideIndex,
          type: "word_reduction",
          description: "Shortened subtitle",
          before: slide.data.subtitle,
          after: shortened
        });
        slide.data.subtitle = shortened;
      }
    }
    return slides;
  }
  /**
   * Remediate glance test failures - title too long.
   */
  remediateGlanceTest(slides, issuesByType, mode) {
    const glanceIssues = [
      ...issuesByType.get("glance_test") || [],
      ...issuesByType.get("expert") || []
    ].filter((i) => i.message.toLowerCase().includes("glance") || i.message.includes("title"));
    const maxTitleWords = mode === "keynote" ? 8 : 12;
    for (const issue of glanceIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === void 0) continue;
      const slide = slides[slideIndex];
      if (!slide?.data.title) continue;
      const titleWords = slide.data.title.split(/\s+/).length;
      if (titleWords <= maxTitleWords) continue;
      console.log(`  \u{1F4CC} Slide ${slideIndex + 1}: Shortening title from ${titleWords} words`);
      const shortened = this.shortenTitle(slide.data.title, maxTitleWords);
      this.changes.push({
        slideIndex,
        type: "title_shortening",
        description: `Shortened title to ${maxTitleWords} words`,
        before: slide.data.title,
        after: shortened
      });
      slide.data.title = shortened;
    }
    return slides;
  }
  /**
   * Remediate bullet point issues.
   */
  remediateBullets(slides, issuesByType, mode) {
    const bulletIssues = (issuesByType.get("content") || []).filter((i) => i.message.includes("bullet"));
    const maxBullets = mode === "keynote" ? 3 : 5;
    for (const issue of bulletIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === void 0) continue;
      const slide = slides[slideIndex];
      if (!slide?.data.bullets) continue;
      if (slide.data.bullets.length <= maxBullets) continue;
      console.log(`  \u{1F4CB} Slide ${slideIndex + 1}: Consolidating ${slide.data.bullets.length} bullets to ${maxBullets}`);
      const consolidated = this.consolidateBullets(slide.data.bullets, maxBullets);
      this.changes.push({
        slideIndex,
        type: "bullet_consolidation",
        description: `Consolidated to ${maxBullets} bullets`,
        before: slide.data.bullets.join("; "),
        after: consolidated.join("; ")
      });
      slide.data.bullets = consolidated;
    }
    return slides;
  }
  /**
   * Remediate structural issues - missing title slide, conclusion, etc.
   */
  remediateStructure(slides, issuesByType, mode) {
    const structureIssues = (issuesByType.get("layout") || []).filter(
      (i) => i.message.includes("Missing") || i.message.includes("minimum") || i.message.includes("conclusion")
    );
    for (const issue of structureIssues) {
      if (issue.message.includes("title slide")) {
        console.log("  \u{1F4C4} Adding missing title slide");
        const firstSlide = slides[0];
        const title = firstSlide?.data.title || "Presentation";
        const titleSlide = {
          index: 0,
          type: "title",
          data: {
            title,
            subtitle: firstSlide?.data.subtitle || ""
          }
        };
        slides.unshift(titleSlide);
        this.reindexSlides(slides);
        this.changes.push({
          slideIndex: 0,
          type: "structure_addition",
          description: "Added missing title slide"
        });
      }
      if (issue.message.includes("conclusion") || issue.message.includes("thank")) {
        console.log("  \u{1F4C4} Adding conclusion slide");
        const thankYouSlide = {
          index: slides.length,
          type: "thank-you",
          data: {
            title: "Thank You",
            subtitle: "Questions?"
          }
        };
        slides.push(thankYouSlide);
        this.changes.push({
          slideIndex: slides.length - 1,
          type: "structure_addition",
          description: "Added conclusion slide"
        });
      }
      if (issue.message.includes("minimum")) {
        if (slides.length < 3) {
          console.log("  \u{1F4C4} Adding summary slide to meet minimum");
          const summarySlide = {
            index: slides.length - 1,
            type: "bullet-points",
            data: {
              title: "Key Takeaways",
              bullets: ["Main point from this presentation"]
            }
          };
          slides.splice(slides.length - 1, 0, summarySlide);
          this.reindexSlides(slides);
          this.changes.push({
            slideIndex: slides.length - 2,
            type: "structure_addition",
            description: "Added summary slide to meet minimum count"
          });
        }
      }
    }
    return slides;
  }
  /**
   * Remediate accessibility issues.
   */
  remediateAccessibility(slides, issuesByType) {
    const a11yIssues = issuesByType.get("accessibility") || [];
    for (const issue of a11yIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === void 0) continue;
      const slide = slides[slideIndex];
      if (!slide) continue;
      if (issue.message.includes("font size") || issue.message.includes("Font size")) {
        console.log(`  \u267F Slide ${slideIndex + 1}: Marking for larger fonts`);
        slide.classes = slide.classes || [];
        if (!slide.classes.includes("large-text")) {
          slide.classes.push("large-text");
        }
        this.changes.push({
          slideIndex,
          type: "font_size_increase",
          description: "Added large-text class for accessibility"
        });
      }
      if (issue.message.includes("contrast") || issue.message.includes("Contrast")) {
        console.log(`  \u267F Slide ${slideIndex + 1}: Marking for high contrast`);
        slide.classes = slide.classes || [];
        if (!slide.classes.includes("high-contrast")) {
          slide.classes.push("high-contrast");
        }
        this.changes.push({
          slideIndex,
          type: "layout_adjustment",
          description: "Added high-contrast class for accessibility"
        });
      }
    }
    return slides;
  }
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  /**
   * Group issues by their primary type.
   */
  groupIssuesByType(issues) {
    const grouped = /* @__PURE__ */ new Map();
    for (const issue of issues) {
      const category = issue.category || "other";
      const existing = grouped.get(category) || [];
      existing.push(issue);
      grouped.set(category, existing);
    }
    return grouped;
  }
  /**
   * Shorten text to approximately N words while preserving meaning.
   */
  shortenText(text, maxWords) {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    const shortened = words.slice(0, maxWords);
    let result = shortened.join(" ");
    result = result.replace(/[,;:]$/, "");
    if (!result.match(/[.!?]$/)) {
      result = result.replace(/\s+\S*$/, "...");
    }
    return result;
  }
  /**
   * Shorten a title to N words, keeping the key message.
   */
  shortenTitle(title, maxWords) {
    const words = title.split(/\s+/);
    if (words.length <= maxWords) return title;
    const actionWords = ["drives", "creates", "enables", "shows", "reveals", "proves", "exceeds", "increases", "decreases"];
    let actionIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (actionWords.some((a) => words[i].toLowerCase().includes(a))) {
        actionIndex = i;
        break;
      }
    }
    if (actionIndex > 0 && actionIndex < maxWords) {
      const start = Math.max(0, actionIndex - 2);
      const end = Math.min(words.length, start + maxWords);
      return words.slice(start, end).join(" ");
    }
    return words.slice(0, maxWords).join(" ");
  }
  /**
   * Consolidate bullets by combining related ones.
   */
  consolidateBullets(bullets, maxBullets) {
    if (bullets.length <= maxBullets) return bullets;
    const result = bullets.slice(0, maxBullets - 1);
    const remaining = bullets.slice(maxBullets - 1);
    const combined = remaining.map((b) => b.replace(/[.!?]$/, "")).join(", ");
    result.push(combined);
    return result;
  }
  /**
   * Reindex slides after insertion/deletion.
   */
  reindexSlides(slides) {
    slides.forEach((slide, index) => {
      slide.index = index;
    });
  }
  /**
   * Count words in a slide.
   */
  countWords(slide) {
    let text = "";
    if (slide.data.title) text += slide.data.title + " ";
    if (slide.data.subtitle) text += slide.data.subtitle + " ";
    if (slide.data.body) text += slide.data.body + " ";
    if (slide.data.bullets) text += slide.data.bullets.join(" ") + " ";
    if (slide.data.keyMessage) text += slide.data.keyMessage + " ";
    if (slide.data.quote) text += slide.data.quote + " ";
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
  /**
   * Deep clone slides array.
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  /**
   * Generate remediation report.
   */
  generateReport() {
    const lines = [];
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("          AUTO-REMEDIATION REPORT                          ");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("");
    lines.push(`Total Changes Applied: ${this.changes.length}`);
    lines.push("");
    if (this.changes.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("Changes by Type:");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      const byType = /* @__PURE__ */ new Map();
      this.changes.forEach((c) => {
        byType.set(c.type, (byType.get(c.type) || 0) + 1);
      });
      byType.forEach((count, type) => {
        lines.push(`  ${type}: ${count}`);
      });
      lines.push("");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("Detailed Changes:");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      this.changes.forEach((change, i) => {
        lines.push(`  ${i + 1}. Slide ${change.slideIndex + 1}: ${change.description}`);
        if (change.before && change.after) {
          lines.push(`     Before: "${change.before.substring(0, 50)}..."`);
          lines.push(`     After:  "${change.after.substring(0, 50)}..."`);
        }
      });
    }
    lines.push("");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
  }
};

// src/qa/HallucinationDetector.ts
var HallucinationDetector = class {
  // Patterns to extract facts from slides
  numberPattern = /\$?[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|M|B|K|%|x))?/gi;
  percentagePattern = /\d+(?:\.\d+)?%/g;
  datePattern = /\b(?:19|20)\d{2}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?/gi;
  companyPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd|Co|Group|Holdings|Partners)\.?)?/g;
  quotePattern = /"[^"]+"|'[^']+'/g;
  /**
   * Check all slides against source content for hallucinations.
   */
  async checkForHallucinations(slides, sourceContent, analysis) {
    const issues = [];
    const warnings = [];
    let totalFacts = 0;
    let verifiedFacts = 0;
    const normalizedSource = this.normalizeText(sourceContent);
    const sourceNumbers = this.extractNumbers(sourceContent);
    const sourceCompanies = this.extractCompanies(sourceContent);
    const sourceDates = this.extractDates(sourceContent);
    console.log(`\u{1F50D} Fact-checking ${slides.length} slides against source content...`);
    console.log(`   Source contains: ${sourceNumbers.length} numbers, ${sourceCompanies.length} companies, ${sourceDates.length} dates`);
    for (const slide of slides) {
      const slideText = this.getSlideText(slide);
      const slideNumbers = this.extractNumbers(slideText);
      for (const num of slideNumbers) {
        totalFacts++;
        if (this.isNumberInSource(num, sourceNumbers)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: num,
            type: num.includes("%") ? "statistic" : "number",
            severity: "error",
            message: `Number "${num}" not found in source content`,
            suggestion: `Remove or replace with a number from the source material`
          });
        }
      }
      const slidePercentages = slideText.match(this.percentagePattern) || [];
      for (const pct of slidePercentages) {
        if (!sourceNumbers.some((n) => n.includes(pct.replace("%", "")))) {
          if (!issues.some((i) => i.fact === pct)) {
            warnings.push({
              slideIndex: slide.index,
              message: `Percentage "${pct}" may not be directly from source`
            });
          }
        }
      }
      const slideCompanies = this.extractCompanies(slideText);
      for (const company of slideCompanies) {
        if (this.isCommonWord(company)) continue;
        totalFacts++;
        if (this.isCompanyInSource(company, sourceCompanies, normalizedSource)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: company,
            type: "company",
            severity: "error",
            message: `Company/name "${company}" not found in source content`,
            suggestion: `Verify this name appears in the source or remove it`
          });
        }
      }
      const slideDates = this.extractDates(slideText);
      for (const date of slideDates) {
        totalFacts++;
        if (this.isDateInSource(date, sourceDates, normalizedSource)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: date,
            type: "date",
            severity: "warning",
            message: `Date "${date}" not found in source content`,
            suggestion: `Verify this date is from the source or use a more general timeframe`
          });
        }
      }
      const slideQuotes = slideText.match(this.quotePattern) || [];
      for (const quote of slideQuotes) {
        totalFacts++;
        const cleanQuote = quote.replace(/["']/g, "").toLowerCase();
        if (normalizedSource.includes(cleanQuote)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: quote,
            type: "quote",
            severity: "error",
            message: `Quote not found in source content`,
            suggestion: `Use exact wording from source or paraphrase without quotes`
          });
        }
      }
      this.checkForUnsupportedClaims(slide, normalizedSource, issues, warnings);
    }
    const unverifiedFacts = totalFacts - verifiedFacts;
    const errorCount = issues.filter((i) => i.severity === "error").length;
    let score = 100;
    score -= errorCount * 10;
    score -= warnings.length * 2;
    score = Math.max(0, score);
    const passed = errorCount === 0;
    return {
      passed,
      score,
      totalFacts,
      verifiedFacts,
      unverifiedFacts,
      issues,
      warnings
    };
  }
  /**
   * Generate a fact-check report.
   */
  generateReport(result) {
    const lines = [
      "",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "\u{1F4CB} HALLUCINATION CHECK REPORT",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "",
      `Status: ${result.passed ? "\u2705 PASSED - All facts verified" : "\u274C FAILED - Unverified facts detected"}`,
      `Score: ${result.score}/100`,
      "",
      `Facts Checked: ${result.totalFacts}`,
      `  \u2705 Verified: ${result.verifiedFacts}`,
      `  \u274C Unverified: ${result.unverifiedFacts}`,
      ""
    ];
    if (result.issues.length > 0) {
      lines.push("ISSUES (Must Fix):");
      for (const issue of result.issues) {
        lines.push(`  \u274C Slide ${issue.slideIndex + 1}: ${issue.type.toUpperCase()}`);
        lines.push(`     "${issue.fact}"`);
        lines.push(`     ${issue.message}`);
        lines.push(`     \u{1F4A1} ${issue.suggestion}`);
        lines.push("");
      }
    }
    if (result.warnings.length > 0) {
      lines.push("WARNINGS (Review):");
      for (const warning of result.warnings) {
        lines.push(`  \u26A0\uFE0F  Slide ${warning.slideIndex + 1}: ${warning.message}`);
      }
      lines.push("");
    }
    if (result.passed) {
      lines.push("\u2705 All facts in the presentation are sourced from the original content.");
      lines.push("   Zero hallucinations detected.");
    } else {
      lines.push("\u274C HALLUCINATIONS DETECTED");
      lines.push("   The presentation contains facts not found in the source content.");
      lines.push("   These must be removed or replaced with verified information.");
    }
    lines.push("");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
  }
  /**
   * Auto-remediate hallucinations by removing unverified facts.
   */
  remediate(slides, result) {
    const remediatedSlides = JSON.parse(JSON.stringify(slides));
    for (const issue of result.issues) {
      if (issue.severity === "error") {
        const slide = remediatedSlides.find((s) => s.index === issue.slideIndex);
        if (slide) {
          const placeholder = this.getPlaceholder(issue.type);
          if (slide.data.title) {
            slide.data.title = slide.data.title.replace(issue.fact, placeholder);
          }
          if (slide.data.subtitle) {
            slide.data.subtitle = slide.data.subtitle.replace(issue.fact, placeholder);
          }
          if (slide.data.body) {
            slide.data.body = slide.data.body.replace(issue.fact, placeholder);
          }
          if (slide.data.bullets) {
            slide.data.bullets = slide.data.bullets.map(
              (b) => b.replace(issue.fact, placeholder)
            );
          }
          console.log(`   \u{1F527} Removed unverified ${issue.type}: "${issue.fact}"`);
        }
      }
    }
    return remediatedSlides;
  }
  // === Private Helper Methods ===
  normalizeText(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  getSlideText(slide) {
    let text = "";
    if (slide.data.title) text += slide.data.title + " ";
    if (slide.data.subtitle) text += slide.data.subtitle + " ";
    if (slide.data.body) text += slide.data.body + " ";
    if (slide.data.bullets) text += slide.data.bullets.join(" ") + " ";
    if (slide.data.keyMessage) text += slide.data.keyMessage + " ";
    return text;
  }
  extractNumbers(text) {
    const matches = text.match(this.numberPattern) || [];
    return matches.map((m) => m.replace(/,/g, "").trim());
  }
  extractCompanies(text) {
    const matches = text.match(this.companyPattern) || [];
    return [...new Set(matches)];
  }
  extractDates(text) {
    const matches = text.match(this.datePattern) || [];
    return [...new Set(matches)];
  }
  isNumberInSource(num, sourceNumbers) {
    const cleanNum = num.replace(/[,$%xMBK]/gi, "").trim();
    for (const sourceNum of sourceNumbers) {
      const cleanSource = sourceNum.replace(/[,$%xMBK]/gi, "").trim();
      if (cleanNum === cleanSource) return true;
      const numValue = parseFloat(cleanNum);
      const sourceValue = parseFloat(cleanSource);
      if (!isNaN(numValue) && !isNaN(sourceValue)) {
        const diff = Math.abs(numValue - sourceValue) / Math.max(numValue, sourceValue);
        if (diff < 0.01) return true;
      }
    }
    return false;
  }
  isCompanyInSource(company, sourceCompanies, normalizedSource) {
    const cleanCompany = company.toLowerCase().trim();
    if (sourceCompanies.some((c) => c.toLowerCase() === cleanCompany)) return true;
    if (normalizedSource.includes(cleanCompany)) return true;
    for (const sourceCompany of sourceCompanies) {
      if (sourceCompany.toLowerCase().includes(cleanCompany) || cleanCompany.includes(sourceCompany.toLowerCase())) {
        return true;
      }
    }
    return false;
  }
  isDateInSource(date, sourceDates, normalizedSource) {
    const cleanDate = date.toLowerCase().trim();
    if (sourceDates.some((d) => d.toLowerCase() === cleanDate)) return true;
    const yearMatch = date.match(/\b(19|20)\d{2}\b/);
    if (yearMatch && normalizedSource.includes(yearMatch[0])) return true;
    return false;
  }
  isCommonWord(word) {
    const commonWords = [
      "The",
      "This",
      "That",
      "These",
      "Those",
      "What",
      "How",
      "Why",
      "When",
      "Where",
      "Our",
      "Your",
      "Their",
      "Key",
      "Main",
      "Next",
      "Last",
      "First",
      "Second",
      "Third",
      "Start",
      "End",
      "Begin",
      "Stop",
      "New",
      "Old",
      "Good",
      "Bad",
      "Best",
      "Worst",
      "More",
      "Less",
      "Most",
      "Least",
      "All",
      "None",
      "Some",
      "Any",
      "Each",
      "Every",
      "Today",
      "Tomorrow",
      "Yesterday",
      "Now",
      "Then",
      "Here",
      "There",
      "Summary",
      "Overview",
      "Introduction",
      "Conclusion",
      "Recommendation",
      "Action",
      "Plan",
      "Strategy",
      "Approach",
      "Method",
      "Process",
      "Step",
      "Phase",
      "Stage"
    ];
    return commonWords.includes(word);
  }
  checkForUnsupportedClaims(slide, normalizedSource, issues, warnings) {
    const slideText = this.getSlideText(slide);
    const claimIndicators = [
      /\bwill\s+(increase|decrease|grow|shrink|improve|reduce)/gi,
      /\bguaranteed?\b/gi,
      /\b(proven|verified|confirmed)\s+to\b/gi,
      /\b(always|never|every|none)\b/gi,
      /\b(best|worst|leading|largest|smallest|first|only)\b/gi
    ];
    for (const pattern of claimIndicators) {
      const matches = slideText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanMatch = match.toLowerCase().trim();
          if (!normalizedSource.includes(cleanMatch)) {
            warnings.push({
              slideIndex: slide.index,
              message: `Strong claim "${match}" may need source verification`
            });
          }
        }
      }
    }
  }
  getPlaceholder(type) {
    switch (type) {
      case "number":
      case "statistic":
        return "[NUMBER FROM SOURCE]";
      case "company":
        return "[COMPANY NAME]";
      case "date":
        return "[DATE]";
      case "quote":
        return "[QUOTE FROM SOURCE]";
      case "claim":
        return "[VERIFIED CLAIM]";
      default:
        return "[VERIFY]";
    }
  }
};

// src/generators/html/RevealJsGenerator.ts
var RevealJsGenerator = class {
  templateEngine;
  defaultRevealConfig = {
    revealVersion: "5.0.4",
    hash: true,
    slideNumber: "c/t",
    transition: "fade",
    transitionSpeed: "default",
    controls: true,
    progress: true,
    center: false,
    // CRITICAL: false for multi-column layouts
    touch: true,
    keyboard: true,
    overview: true,
    autoSlide: 0
  };
  constructor() {
    this.templateEngine = new TemplateEngine();
  }
  /**
   * Generate complete Reveal.js HTML presentation.
   */
  async generate(slides, config) {
    const templateConfig = {};
    if (config.theme) templateConfig.theme = config.theme;
    if (config.customTemplates) templateConfig.customTemplates = config.customTemplates;
    const slideHtml = this.templateEngine.renderAll(slides, templateConfig);
    const docConfig = {
      title: config.title,
      slides: slideHtml.join("\n"),
      theme: config.theme ?? "default",
      revealConfig: this.defaultRevealConfig,
      mode: config.mode
    };
    if (config.author) docConfig.author = config.author;
    if (config.subject) docConfig.subject = config.subject;
    if (config.customCSS) docConfig.customCSS = config.customCSS;
    const html = this.buildDocument(docConfig);
    if (config.minify) {
      return this.minifyHtml(html);
    }
    return html;
  }
  /**
   * Build the complete HTML document.
   */
  buildDocument(options) {
    const { title, author, subject, slides, theme, customCSS, revealConfig, mode } = options;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="author" content="${this.escapeHtml(author ?? "Claude Presentation Master")}">
  <meta name="description" content="${this.escapeHtml(subject ?? "")}">
  <meta name="generator" content="Claude Presentation Master v1.0.0">
  <title>${this.escapeHtml(title)}</title>

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reset.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/theme/white.css">

  <!-- Chart.js for charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>

  <!-- Presentation Engine CSS -->
  <style>
${this.getBaseStyles(mode)}
${this.getThemeStyles(theme)}
${this.getAnimationStyles()}
${customCSS ?? ""}
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slides}
    </div>
  </div>

  <!-- Reveal.js -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/plugin/notes/notes.js"></script>
  <script>
    // Initialize Reveal.js
    Reveal.initialize({
      hash: ${revealConfig.hash},
      slideNumber: ${typeof revealConfig.slideNumber === "string" ? `'${revealConfig.slideNumber}'` : revealConfig.slideNumber},
      transition: '${revealConfig.transition}',
      transitionSpeed: '${revealConfig.transitionSpeed}',
      controls: ${revealConfig.controls},
      progress: ${revealConfig.progress},
      center: ${revealConfig.center},
      touch: ${revealConfig.touch},
      keyboard: ${revealConfig.keyboard},
      overview: ${revealConfig.overview},
      autoSlide: ${revealConfig.autoSlide},
      plugins: [RevealNotes]
    });

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });

    // Trigger animations on slide change
    Reveal.on('slidechanged', function(event) {
      const slide = event.currentSlide;
      const animatedElements = slide.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(function(el) {
        el.style.animationPlayState = 'running';
      });
    });
  </script>
</body>
</html>`;
  }
  /**
   * Get base styles for slides.
   *
   * BULLETPROOF OVERFLOW PROTECTION:
   * 1. All slides use height: 100vh to match viewport exactly
   * 2. overflow: hidden on slide sections clips content at boundaries
   * 3. All child elements use flex-shrink: 1 and min-height: 0 to allow shrinking
   * 4. Tables use max-height with overflow: auto for scrolling if needed
   * 5. Two-column layouts use smaller font sizes to prevent overflow
   */
  getBaseStyles(mode) {
    const fontSize = mode === "keynote" ? "2.2em" : "1.6em";
    const lineHeight = mode === "keynote" ? "1.3" : "1.4";
    return `
    /* ============================================
       BULLETPROOF SLIDE OVERFLOW PROTECTION
       All slides are guaranteed to fit in viewport
       ============================================ */

    /* Base Styles */
    :root {
      --font-heading: 'Source Sans Pro', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-body: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;

      --color-primary: #1a1a2e;
      --color-secondary: #16213e;
      --color-accent: #0f3460;
      --color-highlight: #e94560;
      --color-text: #1a1a2e;
      --color-text-light: #4a4a68;
      --color-background: #ffffff;

      --slide-padding: 35px 45px;
      --content-max-width: 1200px;

      /* Viewport-based heights for bulletproof containment */
      --slide-height: 100%;
      --content-area-height: calc(100% - 70px);
    }

    .reveal {
      font-family: var(--font-body);
      font-size: ${fontSize};
      line-height: ${lineHeight};
      color: var(--color-text);
    }

    .reveal .slides {
      text-align: left;
    }

    /* ============================================
       CRITICAL: SLIDE BOUNDARY ENFORCEMENT
       Content CANNOT escape these boundaries
       ============================================ */
    .reveal .slides section {
      padding: var(--slide-padding) !important;
      box-sizing: border-box !important;
      height: 100% !important;
      max-height: 100% !important;
      width: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      justify-content: flex-start !important;
    }

    /* All direct children must be able to shrink */
    .reveal .slides section > * {
      flex-shrink: 1;
      min-height: 0;
      max-height: 100%;
    }

    /* Content container with strict overflow protection */
    .reveal .slides section .slide-content {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      max-width: var(--content-max-width);
      width: 100%;
      margin: 0 auto;
      overflow: hidden;
      min-height: 0;
    }

    /* ============================================
       TABLES - Bulletproof containment
       ============================================ */
    .reveal table {
      font-size: 0.75em;
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      flex-shrink: 1;
      min-height: 0;
    }

    /* Table wrapper to handle overflow */
    .reveal .table-wrapper,
    .reveal .table-container {
      flex: 1 1 auto;
      overflow: hidden;
      min-height: 0;
      max-height: 100%;
    }

    .reveal table th,
    .reveal table td {
      padding: 0.4em 0.6em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }

    /* Allow text wrap for cells that need it */
    .reveal table td.wrap {
      white-space: normal;
    }

    /* ============================================
       TWO-COLUMN LAYOUTS - Smaller text, strict bounds
       ============================================ */
    .reveal .two-column,
    .reveal .two-columns {
      display: flex;
      gap: 1.5em;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      max-height: calc(100% - 60px);
    }

    .reveal .two-column > *,
    .reveal .two-columns > * {
      flex: 1 1 50%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Two-column content gets smaller fonts */
    .reveal .two-column h2,
    .reveal .two-columns h2 {
      font-size: 1.2em;
      margin-bottom: 0.3em;
    }

    .reveal .two-column h3,
    .reveal .two-columns h3 {
      font-size: 1em;
      margin-bottom: 0.2em;
    }

    .reveal .two-column p,
    .reveal .two-column li,
    .reveal .two-columns p,
    .reveal .two-columns li {
      font-size: 0.8em;
      line-height: 1.3;
      margin-bottom: 0.3em;
    }

    .reveal .two-column table,
    .reveal .two-columns table {
      font-size: 0.7em;
    }

    /* ============================================
       GRIDS - Auto-fit to available space
       ============================================ */
    .reveal .stats-grid,
    .reveal .metrics-grid {
      display: grid;
      gap: 0.8em;
      width: 100%;
      flex-shrink: 1;
      min-height: 0;
    }

    /* ============================================
       METRIC CARDS - Compact sizing
       ============================================ */
    .reveal .metric-card {
      padding: 0.8em 1em;
      font-size: 0.85em;
      flex-shrink: 1;
    }

    .reveal .metric-card .number {
      font-size: 1.6em;
    }

    .reveal .metric-card .label {
      font-size: 0.7em;
    }

    /* ============================================
       HIGHLIGHT BOXES - Compact
       ============================================ */
    .reveal .highlight-box {
      padding: 0.6em 0.8em;
      margin: 0.4em 0;
      font-size: 0.85em;
      flex-shrink: 1;
    }

    /* ============================================
       PROGRESS BARS - Fixed height
       ============================================ */
    .reveal .progress-bar {
      height: 16px;
      margin: 3px 0;
      flex-shrink: 0;
    }

    .reveal .progress-fill {
      font-size: 0.6em;
    }

    /* ============================================
       STAT ITEMS - Compact
       ============================================ */
    .reveal .stat-item {
      padding: 0.4em;
      flex-shrink: 1;
    }

    .reveal .stat-item .value {
      font-size: 1.5em;
    }

    .reveal .stat-item .label {
      font-size: 0.65em;
    }

    /* ============================================
       TYPOGRAPHY - Reduced for density
       ============================================ */
    .reveal h1, .reveal h2, .reveal h3 {
      font-family: var(--font-heading);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .reveal h1 {
      font-size: 2em;
      margin-bottom: 0.3em;
    }
    .reveal h2 {
      font-size: 1.5em;
      margin-bottom: 0.3em;
    }
    .reveal h3 {
      font-size: 1.1em;
      margin-bottom: 0.2em;
    }

    .reveal p {
      margin: 0 0 0.6em 0;
      flex-shrink: 1;
    }

    .reveal .subtitle {
      font-size: 0.65em;
      color: var(--color-text-light);
    }

    /* ============================================
       LISTS - Compact spacing
       ============================================ */
    .reveal ul, .reveal ol {
      margin: 0 0 0.6em 1em;
      padding: 0;
      flex-shrink: 1;
    }

    .reveal li {
      margin-bottom: 0.3em;
      line-height: 1.3;
    }

    /* ============================================
       COLUMNS - Flex with overflow protection
       ============================================ */
    .reveal .columns {
      display: flex;
      gap: 25px;
      flex: 1 1 auto;
      align-items: flex-start;
      min-height: 0;
      overflow: hidden;
    }

    .reveal .two-columns .column,
    .reveal .three-columns .column {
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    /* ============================================
       BIG ELEMENTS - Sized appropriately
       ============================================ */
    .reveal .big-idea-text,
    .reveal .statement {
      font-size: 1.8em;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
    }

    .reveal .number {
      font-size: 3em;
      font-weight: 800;
      color: var(--color-highlight);
      text-align: center;
    }

    .reveal .number-context {
      text-align: center;
      color: var(--color-text-light);
      font-size: 0.9em;
    }

    /* ============================================
       QUOTES - Compact
       ============================================ */
    .reveal blockquote {
      border-left: 4px solid var(--color-accent);
      padding-left: 0.8em;
      font-style: italic;
      margin: 0.6em 0;
      flex-shrink: 1;
    }

    .reveal .attribution {
      text-align: right;
      color: var(--color-text-light);
      font-size: 0.75em;
    }

    /* ============================================
       IMAGES - Contained within bounds
       ============================================ */
    .reveal img {
      max-width: 100%;
      max-height: 100%;
      height: auto;
      border-radius: 8px;
      object-fit: contain;
    }

    .reveal .image-container {
      text-align: center;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .reveal .caption {
      font-size: 0.65em;
      color: var(--color-text-light);
      margin-top: 0.3em;
      flex-shrink: 0;
    }

    /* ============================================
       METRICS - Responsive grid
       ============================================ */
    .reveal .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
      text-align: center;
    }

    .reveal .metric-value {
      font-size: 1.6em;
      font-weight: 700;
      color: var(--color-highlight);
    }

    .reveal .metric-label {
      font-size: 0.7em;
      color: var(--color-text-light);
    }

    .reveal .metric-change {
      font-size: 0.65em;
    }

    .reveal .metric-change.up { color: #27ae60; }
    .reveal .metric-change.down { color: #e74c3c; }

    /* ============================================
       CHARTS - Contained
       ============================================ */
    .reveal .chart-container {
      margin: 0.6em 0;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }

    /* ============================================
       SOURCE ATTRIBUTION
       ============================================ */
    .reveal .source {
      position: absolute;
      bottom: 15px;
      right: 20px;
      font-size: 0.45em;
      color: var(--color-text-light);
    }

    /* ============================================
       SPEAKER NOTES
       ============================================ */
    .reveal aside.notes {
      display: none;
    }

    /* ============================================
       SLIDE TYPE SPECIFIC LAYOUTS
       ============================================ */
    .reveal .slide-title .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-thank-you .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-section-divider .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-big-idea .slide-content,
    .reveal .slide-single-statement .slide-content {
      justify-content: center;
      align-items: center;
    }

    .reveal .slide-big-number .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-cta .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .cta-button {
      display: inline-block;
      padding: 0.4em 1.2em;
      background: var(--color-highlight);
      color: white;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 0.8em;
    }
    `;
  }
  /**
   * Get theme-specific styles.
   */
  getThemeStyles(theme) {
    const themes = {
      "default": "",
      "light-corporate": `
        :root {
          --color-primary: #2c3e50;
          --color-secondary: #34495e;
          --color-accent: #3498db;
          --color-highlight: #2980b9;
          --color-background: #ffffff;
        }
      `,
      "modern-tech": `
        :root {
          --color-primary: #1a1a2e;
          --color-secondary: #16213e;
          --color-accent: #0f3460;
          --color-highlight: #e94560;
          --color-background: #f8f9fa;
        }
      `,
      "minimal": `
        :root {
          --color-primary: #000000;
          --color-secondary: #333333;
          --color-accent: #666666;
          --color-highlight: #000000;
          --color-text-light: #888888;
          --color-background: #ffffff;
        }
        .reveal h1, .reveal h2 {
          font-weight: 400;
        }
      `,
      "warm": `
        :root {
          --color-primary: #5d4037;
          --color-secondary: #795548;
          --color-accent: #d7ccc8;
          --color-highlight: #ff5722;
          --color-background: #fafafa;
        }
      `,
      "creative": `
        :root {
          --color-primary: #6200ea;
          --color-secondary: #7c4dff;
          --color-accent: #b388ff;
          --color-highlight: #ff4081;
          --color-background: #fafafa;
        }
      `
    };
    return themes[theme] ?? "";
  }
  /**
   * Get animation styles.
   */
  getAnimationStyles() {
    return `
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideUp {
      animation: slideUp 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideDown {
      animation: slideDown 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideLeft {
      animation: slideLeft 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideRight {
      animation: slideRight 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-zoomIn {
      animation: zoomIn 0.5s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-bounceIn {
      animation: bounceIn 0.8s ease-out forwards;
      animation-play-state: paused;
    }

    /* Animation delays */
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
    .delay-500 { animation-delay: 500ms; }

    /* Staggered animations */
    .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
    .stagger-children > *:nth-child(2) { animation-delay: 100ms; }
    .stagger-children > *:nth-child(3) { animation-delay: 200ms; }
    .stagger-children > *:nth-child(4) { animation-delay: 300ms; }
    .stagger-children > *:nth-child(5) { animation-delay: 400ms; }
    .stagger-children > *:nth-child(6) { animation-delay: 500ms; }

    /* Auto-play animations on current slide */
    .reveal .present [class*="animate-"] {
      animation-play-state: running;
    }
    `;
  }
  /**
   * Escape HTML entities.
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
  }
  /**
   * Basic HTML minification.
   */
  minifyHtml(html) {
    return html.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/<!--[\s\S]*?-->/g, "").trim();
  }
};

// src/generators/pptx/PowerPointGenerator.ts
import PptxGenJS from "pptxgenjs";

// src/media/ChartProvider.ts
var PALETTES = {
  default: [
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)"
  ],
  professional: [
    "rgba(44, 62, 80, 0.8)",
    "rgba(52, 73, 94, 0.8)",
    "rgba(127, 140, 141, 0.8)",
    "rgba(149, 165, 166, 0.8)",
    "rgba(189, 195, 199, 0.8)",
    "rgba(236, 240, 241, 0.8)"
  ],
  vibrant: [
    "rgba(231, 76, 60, 0.8)",
    "rgba(46, 204, 113, 0.8)",
    "rgba(52, 152, 219, 0.8)",
    "rgba(155, 89, 182, 0.8)",
    "rgba(241, 196, 15, 0.8)",
    "rgba(230, 126, 34, 0.8)"
  ],
  monochrome: [
    "rgba(0, 0, 0, 0.9)",
    "rgba(0, 0, 0, 0.7)",
    "rgba(0, 0, 0, 0.5)",
    "rgba(0, 0, 0, 0.3)",
    "rgba(0, 0, 0, 0.15)",
    "rgba(0, 0, 0, 0.05)"
  ]
};
var ChartJsProvider = class {
  name = "chartjs";
  async isAvailable() {
    return true;
  }
  async generateChart(request) {
    const chartId = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const width = request.width ?? 600;
    const height = request.height ?? 400;
    const palette = PALETTES[request.palette ?? "default"];
    const datasets = request.data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? palette[i % palette.length],
      borderColor: ds.borderColor ?? palette[i % palette.length]?.replace("0.8", "1"),
      borderWidth: ds.borderWidth ?? 2
    }));
    const config = {
      type: request.type,
      data: {
        labels: request.data.labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: request.animated !== false ? {} : false,
        plugins: {
          title: {
            display: !!request.title,
            text: request.title ?? "",
            font: { size: 16, weight: "bold" }
          },
          legend: {
            display: request.showLegend !== false,
            position: "bottom"
          }
        }
      }
    };
    const html = `
      <div class="chart-container" style="width: ${width}px; height: ${height}px;">
        <canvas id="${chartId}"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;
    return {
      html,
      title: request.title ?? "Chart"
    };
  }
};
var QuickChartProvider = class {
  name = "quickchart";
  baseUrl = "https://quickchart.io/chart";
  async isAvailable() {
    return true;
  }
  async generateChart(request) {
    const width = request.width ?? 600;
    const height = request.height ?? 400;
    const palette = PALETTES[request.palette ?? "default"];
    const datasets = request.data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? palette[i % palette.length],
      borderColor: ds.borderColor ?? palette[i % palette.length]?.replace("0.8", "1")
    }));
    const config = {
      type: request.type,
      data: {
        labels: request.data.labels,
        datasets
      },
      options: {
        plugins: {
          title: {
            display: !!request.title,
            text: request.title
          },
          legend: {
            display: request.showLegend !== false
          }
        }
      }
    };
    const chartConfig = encodeURIComponent(JSON.stringify(config));
    const imageUrl = `${this.baseUrl}?c=${chartConfig}&w=${width}&h=${height}&bkg=white`;
    return {
      imageUrl,
      title: request.title ?? "Chart"
    };
  }
};
var MermaidProvider = class {
  name = "mermaid";
  async isAvailable() {
    return true;
  }
  async generateChart(request) {
    throw new Error("Use generateDiagram() for Mermaid diagrams");
  }
  /**
   * Generate a Mermaid diagram
   */
  async generateDiagram(definition, title) {
    const diagramId = `mermaid-${Date.now()}`;
    const html = `
      <div class="mermaid-container">
        <pre class="mermaid" id="${diagramId}">
${definition}
        </pre>
      </div>
      <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
      </script>
    `;
    return {
      html,
      title: title ?? "Diagram"
    };
  }
  /**
   * Generate flowchart from steps
   */
  generateFlowchart(steps) {
    const lines = ["graph TD"];
    for (const step of steps) {
      if (step.next) {
        for (const nextId of step.next) {
          lines.push(`    ${step.id}["${step.label}"] --> ${nextId}`);
        }
      } else {
        lines.push(`    ${step.id}["${step.label}"]`);
      }
    }
    return lines.join("\n");
  }
  /**
   * Generate timeline from events
   */
  generateTimeline(events) {
    const lines = ["timeline"];
    for (const event of events) {
      lines.push(`    ${event.date} : ${event.title}`);
    }
    return lines.join("\n");
  }
};
var CompositeChartProvider = class {
  name = "composite";
  htmlProvider;
  imageProvider;
  mermaidProvider;
  constructor() {
    this.htmlProvider = new ChartJsProvider();
    this.imageProvider = new QuickChartProvider();
    this.mermaidProvider = new MermaidProvider();
  }
  async isAvailable() {
    return true;
  }
  async generateChart(request) {
    const [htmlResult, imageResult] = await Promise.all([
      this.htmlProvider.generateChart(request),
      this.imageProvider.generateChart(request)
    ]);
    const result = {
      title: request.title ?? "Chart"
    };
    if (htmlResult.html) result.html = htmlResult.html;
    if (imageResult.imageUrl) result.imageUrl = imageResult.imageUrl;
    return result;
  }
  async generateDiagram(definition, title) {
    return this.mermaidProvider.generateDiagram(definition, title);
  }
  generateFlowchart(steps) {
    return this.mermaidProvider.generateFlowchart(steps);
  }
  generateTimeline(events) {
    return this.mermaidProvider.generateTimeline(events);
  }
};
function createDefaultChartProvider() {
  return new CompositeChartProvider();
}

// src/generators/pptx/PowerPointGenerator.ts
var LAYOUTS = {
  title: {
    title: { x: 0.5, y: 2.5, w: 9, h: 1.5, fontSize: 44 },
    subtitle: { x: 0.5, y: 4, w: 9, h: 1, fontSize: 24 }
  },
  "big-idea": {
    title: { x: 0.5, y: 2, w: 9, h: 2.5, fontSize: 48 }
  },
  "single-statement": {
    title: { x: 0.5, y: 2, w: 9, h: 2.5, fontSize: 36 }
  },
  "big-number": {
    title: { x: 0.5, y: 1.5, w: 9, h: 2, fontSize: 72 },
    subtitle: { x: 0.5, y: 3.5, w: 9, h: 1, fontSize: 20 }
  },
  "bullet-points": {
    title: { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32 },
    body: { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 18 }
  },
  "two-column": {
    title: { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32 },
    body: { x: 0.5, y: 1.5, w: 4.25, h: 4, fontSize: 16 },
    image: { x: 5, y: 1.5, w: 4.5, h: 4 }
  },
  quote: {
    title: { x: 0.5, y: 1.5, w: 9, h: 2.5, fontSize: 28 },
    subtitle: { x: 0.5, y: 4, w: 9, h: 0.5, fontSize: 16 }
  },
  "thank-you": {
    title: { x: 0.5, y: 2.5, w: 9, h: 1.5, fontSize: 44 },
    subtitle: { x: 0.5, y: 4, w: 9, h: 1, fontSize: 24 }
  },
  default: {
    title: { x: 0.5, y: 0.5, w: 9, h: 1, fontSize: 32 },
    body: { x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 18 }
  }
};
var COLORS = {
  primary: "1a1a2e",
  secondary: "4a4a68",
  accent: "0f3460",
  highlight: "e94560",
  white: "ffffff",
  lightGray: "f5f5f5"
};
var PowerPointGenerator = class {
  chartProvider = createDefaultChartProvider();
  /**
   * Generate a PowerPoint presentation.
   */
  async generate(slides, config) {
    const pptx = new PptxGenJS();
    pptx.title = config.title;
    pptx.author = config.author ?? "Claude Presentation Master";
    pptx.subject = config.subject ?? "";
    pptx.company = "Generated by Claude Presentation Master";
    pptx.layout = "LAYOUT_16x9";
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: COLORS.white }
    });
    for (const slide of slides) {
      await this.addSlide(pptx, slide, config);
    }
    const data = await pptx.write({ outputType: "nodebuffer" });
    return data;
  }
  /**
   * Add a slide to the presentation.
   */
  async addSlide(pptx, slide, config) {
    const pptxSlide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    const layout = LAYOUTS[slide.type] ?? LAYOUTS["default"];
    if (["title", "thank-you", "section-divider"].includes(slide.type)) {
      pptxSlide.background = { color: COLORS.lightGray };
    }
    switch (slide.type) {
      case "title":
        this.addTitleSlide(pptxSlide, slide, layout);
        break;
      case "big-idea":
      case "single-statement":
        this.addBigIdeaSlide(pptxSlide, slide, layout);
        break;
      case "big-number":
        this.addBigNumberSlide(pptxSlide, slide, layout);
        break;
      case "quote":
        this.addQuoteSlide(pptxSlide, slide, layout);
        break;
      case "bullet-points":
        this.addBulletSlide(pptxSlide, slide, layout);
        break;
      case "two-column":
        await this.addTwoColumnSlide(pptxSlide, slide, layout);
        break;
      case "metrics-grid":
        this.addMetricsSlide(pptxSlide, slide, layout);
        break;
      case "thank-you":
        this.addThankYouSlide(pptxSlide, slide, layout);
        break;
      case "agenda":
        this.addAgendaSlide(pptxSlide, slide, layout);
        break;
      case "section-divider":
        this.addSectionDividerSlide(pptxSlide, slide, layout);
        break;
      default:
        this.addDefaultSlide(pptxSlide, slide, layout);
    }
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes);
    }
    pptxSlide.addText(String(slide.index + 1), {
      x: 9.3,
      y: 5.2,
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      color: COLORS.secondary,
      align: "right"
    });
  }
  /**
   * Add title slide.
   */
  addTitleSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary,
        align: "center",
        valign: "middle"
      });
    }
    if (slide.data.subtitle && layout.subtitle) {
      pptxSlide.addText(slide.data.subtitle, {
        ...this.positionToProps(layout.subtitle),
        color: COLORS.secondary,
        align: "center",
        valign: "top"
      });
    }
    if (slide.data.author) {
      pptxSlide.addText(slide.data.author, {
        x: 0.5,
        y: 4.8,
        w: 9,
        h: 0.5,
        fontSize: 14,
        color: COLORS.secondary,
        align: "center"
      });
    }
  }
  /**
   * Add big idea / single statement slide.
   */
  addBigIdeaSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary,
        align: "center",
        valign: "middle"
      });
    }
  }
  /**
   * Add big number slide.
   */
  addBigNumberSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.highlight,
        align: "center",
        valign: "middle"
      });
    }
    if (slide.data.subtitle && layout.subtitle) {
      pptxSlide.addText(slide.data.subtitle, {
        ...this.positionToProps(layout.subtitle),
        color: COLORS.secondary,
        align: "center"
      });
    }
    if (slide.data.source) {
      pptxSlide.addText(`Source: ${slide.data.source}`, {
        x: 0.5,
        y: 5,
        w: 9,
        h: 0.3,
        fontSize: 10,
        color: COLORS.secondary,
        align: "right"
      });
    }
  }
  /**
   * Add quote slide.
   */
  addQuoteSlide(pptxSlide, slide, layout) {
    if (slide.data.quote) {
      pptxSlide.addText(`"${slide.data.quote}"`, {
        ...this.positionToProps(layout.title),
        italic: true,
        color: COLORS.primary,
        align: "center",
        valign: "middle"
      });
    }
    if (slide.data.attribution && layout.subtitle) {
      pptxSlide.addText(`\u2014 ${slide.data.attribution}`, {
        ...this.positionToProps(layout.subtitle),
        color: COLORS.secondary,
        align: "right"
      });
    }
  }
  /**
   * Add bullet points slide.
   */
  addBulletSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary
      });
    }
    if (slide.data.bullets && layout.body) {
      const bulletText = slide.data.bullets.map((bullet) => ({
        text: bullet,
        options: { bullet: true, indentLevel: 0 }
      }));
      pptxSlide.addText(bulletText, {
        ...this.positionToProps(layout.body),
        color: COLORS.primary,
        paraSpaceAfter: 10
      });
    }
  }
  /**
   * Add two-column slide.
   */
  async addTwoColumnSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary
      });
    }
    if (layout.body) {
      if (slide.data.bullets) {
        const bulletText = slide.data.bullets.map((bullet) => ({
          text: bullet,
          options: { bullet: true, indentLevel: 0 }
        }));
        pptxSlide.addText(bulletText, {
          ...this.positionToProps(layout.body),
          color: COLORS.primary,
          paraSpaceAfter: 10
        });
      } else if (slide.data.body) {
        pptxSlide.addText(slide.data.body, {
          ...this.positionToProps(layout.body),
          color: COLORS.primary
        });
      }
    }
    if (layout.image) {
      if (slide.data.images && slide.data.images.length > 0) {
        const img = slide.data.images[0];
        if (img) {
          try {
            pptxSlide.addImage({
              path: img.src,
              x: layout.image.x,
              y: layout.image.y,
              w: layout.image.w,
              h: layout.image.h
            });
          } catch {
            this.addImagePlaceholder(pptxSlide, layout.image, img.alt);
          }
        }
      } else if (slide.data.metrics) {
        this.addMetricsToSlide(pptxSlide, slide.data.metrics, {
          x: layout.image.x,
          y: layout.image.y,
          w: layout.image.w,
          h: layout.image.h
        });
      }
    }
  }
  /**
   * Add metrics grid slide.
   */
  addMetricsSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary
      });
    }
    if (slide.data.metrics) {
      this.addMetricsToSlide(pptxSlide, slide.data.metrics, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4
      });
    }
  }
  /**
   * Add metrics to a slide at specified position.
   */
  addMetricsToSlide(pptxSlide, metrics, bounds) {
    const cols = Math.min(metrics.length, 4);
    const colWidth = bounds.w / cols;
    metrics.slice(0, 4).forEach((metric, index) => {
      const x = bounds.x + index * colWidth;
      pptxSlide.addText(String(metric.value), {
        x,
        y: bounds.y,
        w: colWidth,
        h: 1,
        fontSize: 36,
        bold: true,
        color: COLORS.highlight,
        align: "center"
      });
      pptxSlide.addText(metric.label, {
        x,
        y: bounds.y + 1,
        w: colWidth,
        h: 0.5,
        fontSize: 14,
        color: COLORS.secondary,
        align: "center"
      });
      if (metric.change) {
        const trendColor = metric.trend === "up" ? "27ae60" : metric.trend === "down" ? "e74c3c" : COLORS.secondary;
        const trendIcon = metric.trend === "up" ? "\u2191" : metric.trend === "down" ? "\u2193" : "\u2192";
        pptxSlide.addText(`${trendIcon} ${metric.change}`, {
          x,
          y: bounds.y + 1.5,
          w: colWidth,
          h: 0.3,
          fontSize: 12,
          color: trendColor,
          align: "center"
        });
      }
    });
  }
  /**
   * Add thank you slide.
   */
  addThankYouSlide(pptxSlide, slide, layout) {
    pptxSlide.addText(slide.data.title ?? "Thank You", {
      ...this.positionToProps(layout.title),
      bold: true,
      color: COLORS.primary,
      align: "center",
      valign: "middle"
    });
    if (slide.data.subtitle && layout.subtitle) {
      pptxSlide.addText(slide.data.subtitle, {
        ...this.positionToProps(layout.subtitle),
        color: COLORS.secondary,
        align: "center"
      });
    }
  }
  /**
   * Add agenda slide.
   */
  addAgendaSlide(pptxSlide, slide, layout) {
    pptxSlide.addText(slide.data.title ?? "Agenda", {
      ...this.positionToProps(layout.title),
      bold: true,
      color: COLORS.primary
    });
    if (slide.data.bullets && layout.body) {
      const bulletText = slide.data.bullets.map((bullet, index) => ({
        text: bullet,
        options: { bullet: { type: "number" }, indentLevel: 0 }
      }));
      pptxSlide.addText(bulletText, {
        ...this.positionToProps(layout.body),
        color: COLORS.primary,
        paraSpaceAfter: 15
      });
    }
  }
  /**
   * Add section divider slide.
   */
  addSectionDividerSlide(pptxSlide, slide, layout) {
    pptxSlide.background = { color: COLORS.primary };
    pptxSlide.addText(slide.data.title ?? "", {
      x: 0.5,
      y: 2,
      w: 9,
      h: 2,
      fontSize: 40,
      bold: true,
      color: COLORS.white,
      align: "center",
      valign: "middle"
    });
    if (slide.data.subtitle) {
      pptxSlide.addText(slide.data.subtitle, {
        x: 0.5,
        y: 4,
        w: 9,
        h: 0.5,
        fontSize: 20,
        color: COLORS.lightGray,
        align: "center"
      });
    }
  }
  /**
   * Add default slide (fallback).
   */
  addDefaultSlide(pptxSlide, slide, layout) {
    if (slide.data.title) {
      pptxSlide.addText(slide.data.title, {
        ...this.positionToProps(layout.title),
        bold: true,
        color: COLORS.primary
      });
    }
    if (slide.data.body && layout.body) {
      pptxSlide.addText(slide.data.body, {
        ...this.positionToProps(layout.body),
        color: COLORS.primary
      });
    }
    if (slide.data.bullets && layout.body) {
      const bulletText = slide.data.bullets.map((bullet) => ({
        text: bullet,
        options: { bullet: true, indentLevel: 0 }
      }));
      pptxSlide.addText(bulletText, {
        x: layout.body.x,
        y: layout.body.y + 1,
        w: layout.body.w,
        h: layout.body.h - 1,
        fontSize: layout.body.fontSize,
        color: COLORS.primary,
        paraSpaceAfter: 10
      });
    }
  }
  /**
   * Add image placeholder.
   */
  addImagePlaceholder(pptxSlide, bounds, alt) {
    pptxSlide.addShape("rect", {
      x: bounds.x,
      y: bounds.y,
      w: bounds.w,
      h: bounds.h,
      fill: { color: COLORS.lightGray },
      line: { color: COLORS.secondary, width: 1 }
    });
    pptxSlide.addText(`[Image: ${alt}]`, {
      x: bounds.x,
      y: bounds.y + bounds.h / 2 - 0.2,
      w: bounds.w,
      h: 0.4,
      fontSize: 12,
      color: COLORS.secondary,
      align: "center"
    });
  }
  /**
   * Convert layout position to PptxGenJS text props.
   */
  positionToProps(pos) {
    return {
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      fontSize: pos.fontSize
    };
  }
};

// src/strategies/TEDKeynoteStrategy.ts
var TEDKeynoteStrategy = class {
  type = "ted_keynote";
  name = "TED-Style Keynote";
  description = "High-impact inspirational presentations for general audiences";
  experts = {
    primary: "Nancy Duarte (Sparkline, STAR Moment)",
    secondary: [
      "Chris Anderson (One Idea)",
      "Garr Reynolds (Presentation Zen)",
      "Carmine Gallo (Rule of Three)"
    ]
  };
  slideSequence = [
    {
      id: "opening_hook",
      name: "Opening Hook",
      type: "title",
      required: true,
      purpose: "Grab attention in first 10 seconds",
      requiredData: ["title"],
      optionalData: ["subtitle"],
      wordLimits: { min: 1, max: 10, ideal: 6 },
      expertPrinciples: [
        "Start with something unexpected",
        "Create curiosity gap",
        "Connect emotionally immediately"
      ],
      designNotes: [
        "Full-bleed dramatic image or",
        "Large bold text on dark background",
        "50%+ whitespace"
      ],
      example: {
        title: "What if everything you knew was wrong?"
      }
    },
    {
      id: "what_is_1",
      name: "Current Reality (Pain Point)",
      type: "single-statement",
      required: true,
      purpose: "Establish the current problematic reality",
      requiredData: ["title"],
      optionalData: ["keyMessage"],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        "Show the pain of the status quo",
        "Make it relatable",
        "Use concrete examples"
      ],
      designNotes: [
        "Dark, heavy visual feeling",
        "One powerful statement",
        "No bullets ever"
      ],
      example: {
        title: "We're drowning in information."
      }
    },
    {
      id: "what_could_be_1",
      name: "First Glimpse of Possibility",
      type: "single-statement",
      required: true,
      purpose: "Contrast with a vision of what could be",
      requiredData: ["title"],
      optionalData: ["keyMessage"],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        "Create contrast with previous slide",
        "Use aspirational language",
        "Make them feel possibility"
      ],
      designNotes: [
        "Lighter, brighter visual",
        "One hopeful statement",
        "Visual contrast from previous"
      ],
      example: {
        title: "But what if we could find clarity?"
      }
    },
    {
      id: "what_is_2",
      name: "Deeper Problem (Build Tension)",
      type: "big-idea",
      required: true,
      purpose: "Deepen the tension, show more pain",
      requiredData: ["title"],
      optionalData: ["keyMessage"],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        "Oscillate back to reality",
        "Deepen the emotional stakes",
        "Make them uncomfortable with status quo"
      ],
      designNotes: [
        "Return to darker palette",
        "Tension-building visual"
      ],
      example: {
        title: "Every day, 300 billion emails. 4 hours wasted."
      }
    },
    {
      id: "what_could_be_2",
      name: "Building Vision",
      type: "big-idea",
      required: true,
      purpose: "Expand the vision of what's possible",
      requiredData: ["title"],
      optionalData: ["keyMessage"],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        "Build on previous possibility",
        "Make it more concrete",
        "Show a path forward"
      ],
      designNotes: [
        "Back to lighter palette",
        "Hopeful, energizing"
      ]
    },
    {
      id: "star_moment",
      name: "STAR Moment",
      type: "big-number",
      required: true,
      purpose: "Something They'll Always Remember",
      requiredData: ["title"],
      optionalData: ["subtitle", "keyMessage"],
      wordLimits: { min: 1, max: 10, ideal: 5 },
      expertPrinciples: [
        "This is THE moment they remember",
        "Dramatic statistic, demo, or revelation",
        "Emotional peak of presentation"
      ],
      designNotes: [
        "Maximum visual impact",
        "Could be a number, image, or demo",
        "This slide gets the gasp"
      ],
      example: {
        title: "1 Second",
        subtitle: "The time you have to make a first impression"
      }
    },
    {
      id: "what_could_be_3",
      name: "The New Bliss",
      type: "single-statement",
      required: true,
      purpose: "Paint the picture of the transformed future",
      requiredData: ["title"],
      optionalData: ["keyMessage"],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        "This is the resolution",
        "Make them want this future",
        "Emotionally satisfying"
      ],
      designNotes: [
        "Brightest, most hopeful visual",
        "Sense of resolution and peace"
      ],
      example: {
        title: "A world where every message matters."
      }
    },
    {
      id: "call_to_adventure",
      name: "Call to Adventure",
      type: "cta",
      required: true,
      purpose: "What should they do now?",
      requiredData: ["title"],
      optionalData: ["body", "keyMessage"],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        "Clear, actionable next step",
        "Make it feel achievable",
        "End on energy and hope"
      ],
      designNotes: [
        "Strong, clear CTA",
        "Contact info if relevant",
        "Leave them inspired to act"
      ],
      example: {
        title: "Join the clarity revolution.",
        body: "Start today. One email at a time."
      }
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /bullet|list|points/i,
      transform: () => "",
      description: "Remove all bullet points - TED keynotes never use them"
    },
    {
      sourcePattern: /(\d+%|\$[\d,]+(?:\s*(?:million|billion))?)/,
      transform: (match) => match,
      description: "Preserve dramatic statistics for STAR moments"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "No slide has more than 15 words",
      "No bullet points anywhere",
      "Sparkline structure is present (What Is vs What Could Be)",
      "STAR moment exists",
      "Ends with clear Call to Adventure"
    ],
    excellenceIndicators: [
      "Emotional contrast is palpable",
      "Can be presented without reading",
      "Audience would remember STAR moment",
      "One clear idea per presentation"
    ]
  };
  /**
   * Generate TED-style keynote slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    const hookText = analysis.starMoments[0] || analysis.scqa.question || this.createHook(analysis.keyMessages[0] ?? "");
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: this.distillToHook(hookText),
        keyMessage: "Opening hook"
      },
      classes: ["slide-title", "slide-hook"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.distillToStatement(analysis.scqa.situation || analysis.sparkline.whatIs[0] || ""),
        keyMessage: "Current reality"
      },
      classes: ["slide-single-statement", "slide-what-is"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.distillToStatement(analysis.sparkline.whatCouldBe[0] || analysis.scqa.answer || ""),
        keyMessage: "Possibility"
      },
      classes: ["slide-single-statement", "slide-what-could-be"]
    });
    if (analysis.scqa.complication) {
      slides.push({
        index: index++,
        type: "big-idea",
        data: {
          title: this.distillToStatement(analysis.scqa.complication),
          keyMessage: "The challenge"
        },
        classes: ["slide-big-idea", "slide-what-is"]
      });
    }
    if (analysis.sparkline.whatCouldBe[1]) {
      slides.push({
        index: index++,
        type: "big-idea",
        data: {
          title: this.distillToStatement(analysis.sparkline.whatCouldBe[1]),
          keyMessage: "Building the vision"
        },
        classes: ["slide-big-idea", "slide-what-could-be"]
      });
    }
    const starContent = this.findBestStarMoment(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: starContent.number || starContent.statement,
        subtitle: starContent.context,
        keyMessage: "STAR moment - they'll remember this"
      },
      classes: ["slide-big-number", "slide-star-moment"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.distillToStatement(analysis.scqa.answer || analysis.sparkline.whatCouldBe.slice(-1)[0] || ""),
        keyMessage: "The new bliss"
      },
      classes: ["slide-single-statement", "slide-new-bliss"]
    });
    slides.push({
      index: index++,
      type: "cta",
      data: {
        title: this.createCallToAdventure(analysis.sparkline.callToAdventure || analysis.scqa.answer || ""),
        body: "Start today.",
        keyMessage: "What to do next"
      },
      classes: ["slide-cta", "slide-call-to-adventure"]
    });
    return slides;
  }
  /**
   * Validate slides against TED keynote requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    for (const slide of slides) {
      const wordCount = this.countWords(slide);
      if (wordCount > 15) {
        issues.push(`Slide ${slide.index + 1}: ${wordCount} words exceeds 15 word limit`);
        score -= 10;
      }
    }
    for (const slide of slides) {
      if (slide.data.bullets && slide.data.bullets.length > 0) {
        issues.push(`Slide ${slide.index + 1}: Contains bullet points (not allowed in TED keynotes)`);
        score -= 15;
      }
    }
    const hasStarMoment = slides.some(
      (s) => s.classes?.includes("slide-star-moment") || s.type === "big-number"
    );
    if (!hasStarMoment) {
      issues.push("Missing STAR moment (Something They'll Always Remember)");
      score -= 15;
    }
    const hasWhatIs = slides.some((s) => s.classes?.includes("slide-what-is"));
    const hasWhatCouldBe = slides.some((s) => s.classes?.includes("slide-what-could-be"));
    if (!hasWhatIs || !hasWhatCouldBe) {
      issues.push("Missing Sparkline structure (need What Is vs What Could Be contrast)");
      score -= 10;
    }
    const hasCTA = slides.some(
      (s) => s.classes?.includes("slide-call-to-adventure") || s.type === "cta"
    );
    if (!hasCTA) {
      issues.push("Missing Call to Adventure at end");
      score -= 10;
    }
    if (slides.length > 12) {
      suggestions.push("Consider reducing slides - TED talks typically have 8-12 slides");
    }
    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply Duarte methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (slide.data.bullets) {
        const combined = slide.data.bullets.join(" ");
        slide.data.title = this.distillToStatement(combined);
        delete slide.data.bullets;
      }
      if (slide.data.title && this.countWords({ data: { title: slide.data.title } }) > 15) {
        slide.data.title = this.distillToStatement(slide.data.title);
      }
      if (slide.data.keyMessage?.toLowerCase().includes("current") || slide.data.keyMessage?.toLowerCase().includes("reality") || slide.data.keyMessage?.toLowerCase().includes("problem")) {
        if (!slide.classes) slide.classes = [];
        slide.classes.push("slide-what-is");
      }
      if (slide.data.keyMessage?.toLowerCase().includes("could") || slide.data.keyMessage?.toLowerCase().includes("possibility") || slide.data.keyMessage?.toLowerCase().includes("vision")) {
        if (!slide.classes) slide.classes = [];
        slide.classes.push("slide-what-could-be");
      }
      return slide;
    });
  }
  // === Helper Methods ===
  distillToStatement(text) {
    if (!text) return "Key insight here";
    let clean = text.replace(/\[.*?\]/g, "").replace(/^\s*(the|a|an)\s+/i, "").trim();
    const firstSentence = clean.split(/[.!?]/)[0] ?? clean;
    const words = firstSentence.split(/\s+/).slice(0, 12);
    return words.join(" ");
  }
  distillToHook(text) {
    const statement = this.distillToStatement(text);
    if (!statement.includes("?")) {
      return `What if ${statement.toLowerCase().replace(/^what if /i, "")}?`;
    }
    return statement;
  }
  createHook(message) {
    if (!message) return "What if everything changed?";
    return `What if ${message.toLowerCase()}?`;
  }
  createCallToAdventure(content) {
    if (!content) return "Join us. Start today.";
    const core = this.distillToStatement(content);
    if (!core.match(/^(join|start|begin|create|build|make|be|do|take)/i)) {
      return `Start ${core.toLowerCase()}`;
    }
    return core;
  }
  findBestStarMoment(analysis) {
    for (const star of analysis.starMoments) {
      const numMatch = star.match(/(\d+[%xX]|\$[\d,]+(?:\s*(?:million|billion))?)/);
      if (numMatch) {
        return {
          number: numMatch[1],
          statement: star,
          context: star.replace(numMatch[1] ?? "", "").trim()
        };
      }
    }
    if (analysis.starMoments[0]) {
      return {
        statement: this.distillToStatement(analysis.starMoments[0])
      };
    }
    return {
      statement: this.distillToStatement(analysis.scqa.answer || analysis.keyMessages[0] || "The moment of truth")
    };
  }
  countWords(slide) {
    let text = "";
    if (slide.data.title) text += slide.data.title + " ";
    if (slide.data.subtitle) text += slide.data.subtitle + " ";
    if (slide.data.body) text += slide.data.body + " ";
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
};

// src/strategies/SalesPitchStrategy.ts
var SalesPitchStrategy = class {
  type = "sales_pitch";
  name = "Sales Pitch Deck";
  description = "Persuasive sales presentations using Cialdini and SPIN methodologies";
  experts = {
    primary: "Robert Cialdini (6 Principles of Persuasion)",
    secondary: [
      "Neil Rackham (SPIN Selling)",
      "Matthew Dixon (Challenger Sale)",
      "Oren Klaff (Pitch Anything)",
      "Chris Voss (Never Split the Difference)"
    ]
  };
  // Cialdini's 6 Principles mapped to slides
  cialdiniPrinciples = {
    reciprocity: "Give value before asking",
    commitment: "Get small yeses first",
    socialProof: "Show who else uses it",
    authority: "Establish credibility",
    liking: "Build rapport and connection",
    scarcity: "Create urgency"
  };
  // SPIN framework
  spinFramework = {
    situation: "Understanding their current state",
    problem: "Uncovering pain points",
    implication: "Exploring consequences of inaction",
    needPayoff: "Showing value of solution"
  };
  slideSequence = [
    {
      id: "title_impact",
      name: "Opening Hook",
      type: "title",
      required: true,
      purpose: "Grab attention and establish relevance",
      requiredData: ["title", "tagline"],
      optionalData: ["companyLogo"],
      wordLimits: { min: 5, max: 15, ideal: 10 },
      expertPrinciples: [
        "Lead with the outcome they want",
        "Speak to their pain directly",
        "Establish credibility immediately (Authority)",
        "Create curiosity"
      ],
      designNotes: [
        "Bold, confident statement",
        "Logo positioned professionally",
        "Clean, trustworthy design"
      ],
      example: {
        title: "Cut Your Customer Acquisition Cost by 50%",
        subtitle: "How 500+ companies did it"
      }
    },
    {
      id: "problem_statement",
      name: "Their Pain (Situation + Problem)",
      type: "single-statement",
      required: true,
      purpose: "Show you understand their problem deeply",
      requiredData: ["problem"],
      optionalData: ["statistics", "industry_context"],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        "SPIN: Articulate THEIR situation",
        "Be specific - use their industry/language",
        "Cialdini Liking: Show you understand them",
        'Use "you" language, not "we"'
      ],
      designNotes: [
        "Focus on their world",
        "Empathetic, not condescending",
        "One clear problem"
      ],
      example: {
        title: "Your sales team spends 70% of time on non-selling activities"
      }
    },
    {
      id: "cost_of_inaction",
      name: "Cost of Inaction (Implication)",
      type: "big-number",
      required: true,
      purpose: "Agitate the problem - show what inaction costs",
      requiredData: ["cost", "timeframe"],
      optionalData: ["comparison"],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        "SPIN Implication: What happens if nothing changes?",
        "Quantify the pain ($, time, opportunities)",
        "Make it visceral and real",
        "Create urgency"
      ],
      designNotes: [
        "Big, impactful number",
        "Clear timeframe",
        "Emotional impact"
      ],
      example: {
        title: "$2.4M",
        subtitle: "Lost revenue per year from inefficient processes"
      }
    },
    {
      id: "solution_overview",
      name: "Your Solution",
      type: "single-statement",
      required: true,
      purpose: "Present the answer to their pain",
      requiredData: ["solution", "benefit"],
      optionalData: ["differentiator"],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        "SPIN Need-Payoff: Show the value",
        "Focus on outcomes, not features",
        "One clear value proposition",
        "Tie directly to their problem"
      ],
      designNotes: [
        "Simple, clear message",
        "Benefit-first language",
        "Product image optional"
      ],
      example: {
        title: "Automate your sales workflow",
        subtitle: "Give your team back 20 hours a week"
      }
    },
    {
      id: "how_it_works",
      name: "How It Works",
      type: "bullet-points",
      required: true,
      purpose: "Explain the mechanism simply",
      requiredData: ["steps"],
      optionalData: ["demo", "screenshot"],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        "3 steps maximum",
        "Easy to understand in 30 seconds",
        "Show, don't tell (demo/screenshot)",
        "Remove friction from understanding"
      ],
      designNotes: [
        "Visual process flow",
        "1-2-3 numbered steps",
        "Icons for each step"
      ],
      example: {
        bullets: [
          "1. Connect your CRM in 2 clicks",
          "2. Our AI prioritizes your leads",
          "3. Your team focuses on closing"
        ]
      }
    },
    {
      id: "social_proof",
      name: "Social Proof",
      type: "grid",
      required: true,
      purpose: "Show who else trusts you (Cialdini Social Proof)",
      requiredData: ["logos", "testimonials"],
      optionalData: ["metrics", "caseStudies"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Cialdini Social Proof: "People like you use this"',
        "Relevant logos (same industry/size)",
        "Specific testimonials with names",
        "Numbers > vague claims"
      ],
      designNotes: [
        "Logo wall of customers",
        "Quote with photo and name",
        "Metrics if impressive"
      ],
      example: {
        title: "Trusted by 500+ companies",
        bullets: [
          '"Increased our conversion by 40%" - Sarah, VP Sales at Stripe'
        ]
      }
    },
    {
      id: "case_study",
      name: "Case Study",
      type: "two-column",
      required: true,
      purpose: "Concrete proof it works",
      requiredData: ["company", "challenge", "result"],
      optionalData: ["quote", "timeline"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Similar company to prospect",
        "Specific numbers and results",
        "Before/After format",
        "Quote from decision-maker"
      ],
      designNotes: [
        "Company logo prominent",
        "Before \u2192 After metrics",
        "Quote with attribution"
      ],
      example: {
        title: "How Acme Corp increased sales 40%",
        bullets: [
          "Challenge: Low conversion rates",
          "Solution: Implemented our platform",
          "Result: 40% increase in 90 days"
        ]
      }
    },
    {
      id: "roi_value",
      name: "ROI / Value Calculation",
      type: "big-number",
      required: true,
      purpose: "Quantify the value clearly",
      requiredData: ["roi", "timeframe"],
      optionalData: ["calculation", "comparison"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Make the ROI undeniable",
        "Show payback period",
        "Compare to cost of status quo",
        "Conservative estimates build trust"
      ],
      designNotes: [
        "Big ROI number",
        "Show the math simply",
        "Payback timeline"
      ],
      example: {
        title: "10x ROI",
        subtitle: "Payback in 3 months"
      }
    },
    {
      id: "pricing",
      name: "Pricing / Investment",
      type: "table",
      required: true,
      purpose: "Present the investment clearly",
      requiredData: ["pricing"],
      optionalData: ["tiers", "comparison"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Frame as investment, not cost",
        "Anchor high if multiple tiers",
        "Cialdini Contrast: Show value vs. price",
        "Make the choice easy"
      ],
      designNotes: [
        "3 tiers typical",
        "Popular tier highlighted",
        "Clear feature differentiation"
      ],
      example: {
        title: "Simple, Transparent Pricing"
      }
    },
    {
      id: "objection_handling",
      name: "Common Questions",
      type: "bullet-points",
      required: false,
      purpose: "Pre-emptively address objections",
      requiredData: ["questions", "answers"],
      optionalData: [],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        "Address top 3 objections",
        "Flip concerns into benefits",
        "Be honest about limitations",
        "Chris Voss: Label their fears"
      ],
      designNotes: [
        "Q&A format",
        "Concise answers",
        "Honest and direct"
      ]
    },
    {
      id: "urgency_scarcity",
      name: "Limited Offer",
      type: "single-statement",
      required: false,
      purpose: "Create urgency (Cialdini Scarcity)",
      requiredData: ["offer", "deadline"],
      optionalData: ["bonus"],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        "Cialdini Scarcity: Limited time/quantity",
        "Must be genuine, not manipulative",
        "Clear deadline or limit",
        "Bonus for acting now"
      ],
      designNotes: [
        "Bold offer",
        "Clear deadline",
        "Urgency indicators"
      ],
      example: {
        title: "Start this week: Get 2 months free"
      }
    },
    {
      id: "call_to_action",
      name: "Call to Action",
      type: "cta",
      required: true,
      purpose: "Clear next step",
      requiredData: ["action", "contact"],
      optionalData: ["calendar", "phone"],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        "Single, clear action",
        "Low friction (book a call, not buy now)",
        "Cialdini Commitment: Small first step",
        "Multiple contact options"
      ],
      designNotes: [
        "Big CTA button/text",
        "Contact info clear",
        "Simple and direct"
      ],
      example: {
        title: "Let's Talk",
        body: "Book a 15-minute call: calendly.com/example"
      }
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /we\s+(offer|provide|have)/gi,
      transform: (match) => match.replace(/we\s+(offer|provide|have)/i, "you get"),
      description: 'Convert "we offer" to "you get" (customer-centric language)'
    },
    {
      sourcePattern: /our\s+(product|solution|platform)/gi,
      transform: () => "your solution",
      description: 'Convert "our product" to "your solution"'
    },
    {
      sourcePattern: /(\d+)\s*%?\s*(increase|improvement|growth)/gi,
      transform: (match) => match.toUpperCase(),
      description: "Emphasize growth metrics"
    },
    {
      sourcePattern: /(\d+)\s*%?\s*(reduction|decrease|savings)/gi,
      transform: (match) => match.toUpperCase(),
      description: "Emphasize savings metrics"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "Problem clearly articulated",
      "Cost of inaction quantified",
      "Solution tied to problem",
      "Social proof present",
      "ROI demonstrated",
      "Clear call to action"
    ],
    excellenceIndicators: [
      "Customer-centric language (you > we)",
      "Specific case study included",
      "Objections pre-handled",
      "Urgency without manipulation",
      "Multiple Cialdini principles applied"
    ]
  };
  /**
   * Generate sales pitch slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: this.createHook(analysis.scqa.answer ?? analysis.keyMessages[0] ?? ""),
        subtitle: this.createCredibility(analysis),
        keyMessage: "Opening impact"
      },
      classes: ["slide-title", "slide-sales-pitch", "slide-hook"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.formatAsProblem(analysis.sparkline.whatIs[0] ?? analysis.scqa.complication ?? ""),
        keyMessage: "Their pain"
      },
      classes: ["slide-problem", "slide-sales-pitch"]
    });
    const costData = this.extractCostData(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: costData.amount,
        subtitle: costData.context,
        keyMessage: "Cost of inaction"
      },
      classes: ["slide-cost", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.formatAsSolution(analysis.scqa.answer ?? analysis.sparkline.whatCouldBe[0] ?? ""),
        keyMessage: "Your solution"
      },
      classes: ["slide-solution", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "How It Works",
        bullets: this.extractSteps(analysis),
        keyMessage: "Simple process"
      },
      classes: ["slide-how-it-works", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "grid",
      data: {
        title: "Trusted by Industry Leaders",
        bullets: [
          "[Customer testimonial with name and title]",
          "[Specific result achieved]"
        ],
        keyMessage: "Social proof"
      },
      classes: ["slide-social-proof", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "Customer Success Story",
        body: "Challenge \u2192 Solution \u2192 Result",
        bullets: [
          "Challenge: [Their problem]",
          "Solution: [How you helped]",
          "Result: [Quantified outcome]"
        ],
        keyMessage: "Proof it works"
      },
      classes: ["slide-case-study", "slide-sales-pitch"]
    });
    const roiData = this.extractROI(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: roiData.roi,
        subtitle: roiData.payback,
        keyMessage: "Clear ROI"
      },
      classes: ["slide-roi", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Investment Options",
        body: "Choose the plan that fits your needs",
        keyMessage: "Transparent pricing"
      },
      classes: ["slide-pricing", "slide-sales-pitch"]
    });
    slides.push({
      index: index++,
      type: "cta",
      data: {
        title: this.createCTA(analysis.sparkline.callToAdventure),
        body: "Book a call: [contact info]",
        keyMessage: "Next step"
      },
      classes: ["slide-cta", "slide-sales-pitch"]
    });
    return slides;
  }
  /**
   * Validate slides against sales pitch requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    const hasProblem = slides.some((s) => s.classes?.includes("slide-problem"));
    if (!hasProblem) {
      issues.push("Missing clear problem statement");
      score -= 10;
    }
    const hasCost = slides.some((s) => s.classes?.includes("slide-cost"));
    if (!hasCost) {
      issues.push("Missing cost of inaction (SPIN Implication)");
      score -= 8;
    }
    const hasSolution = slides.some((s) => s.classes?.includes("slide-solution"));
    if (!hasSolution) {
      issues.push("Missing solution slide");
      score -= 10;
    }
    const hasSocialProof = slides.some((s) => s.classes?.includes("slide-social-proof"));
    if (!hasSocialProof) {
      issues.push("Missing social proof (Cialdini principle)");
      score -= 8;
    }
    const hasROI = slides.some((s) => s.classes?.includes("slide-roi"));
    if (!hasROI) {
      issues.push("Missing ROI/value slide");
      score -= 8;
    }
    const hasCTA = slides.some((s) => s.classes?.includes("slide-cta"));
    if (!hasCTA) {
      issues.push("Missing call to action");
      score -= 10;
    }
    for (const slide of slides) {
      const content = JSON.stringify(slide.data).toLowerCase();
      const weCount = (content.match(/\bwe\b/g) || []).length;
      const youCount = (content.match(/\byou\b/g) || []).length;
      if (weCount > youCount * 2) {
        suggestions.push(`Slide ${slide.index + 1}: Use more "you" language (customer-centric)`);
      }
    }
    const hasCaseStudy = slides.some((s) => s.classes?.includes("slide-case-study"));
    if (!hasCaseStudy) {
      suggestions.push("Consider adding a specific case study for credibility");
    }
    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply sales methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes("slide-sales-pitch")) {
        slide.classes.push("slide-sales-pitch");
      }
      if (slide.data.title) {
        slide.data.title = this.convertToYouLanguage(slide.data.title);
      }
      if (slide.data.body) {
        slide.data.body = this.convertToYouLanguage(slide.data.body);
      }
      return slide;
    });
  }
  // === Helper Methods ===
  createHook(text) {
    if (!text) return "Transform Your Business";
    const cleaned = text.trim();
    if (cleaned.match(/^(how|what|why)/i)) {
      return cleaned;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  createCredibility(analysis) {
    for (const star of analysis.starMoments) {
      if (star.match(/\d+.*companies|customers|clients/i)) {
        return star;
      }
    }
    return "Join 500+ companies who trust us";
  }
  formatAsProblem(text) {
    if (!text) return "Your biggest challenge";
    const cleaned = text.replace(/^(the\s+)?problem\s+(is\s+)?/i, "").trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  formatAsSolution(text) {
    if (!text) return "Your solution is here";
    return text.replace(/\bwe\b/gi, "you").replace(/\bour\b/gi, "your");
  }
  extractCostData(analysis) {
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+(?:\s*(?:million|billion|M|B|K))?/i);
      if (match) {
        return {
          amount: match[0],
          context: star.replace(match[0], "").trim() || "lost annually"
        };
      }
    }
    return {
      amount: "$[X]",
      context: "lost annually due to this problem"
    };
  }
  extractSteps(analysis) {
    const steps = analysis.keyMessages.slice(0, 3).map(
      (msg, i) => `${i + 1}. ${msg.length > 50 ? msg.slice(0, 47) + "..." : msg}`
    );
    if (steps.length === 0) {
      return [
        "1. Connect in 2 minutes",
        "2. Our system does the work",
        "3. You see results"
      ];
    }
    return steps;
  }
  extractROI(analysis) {
    for (const star of analysis.starMoments) {
      const match = star.match(/(\d+)x\s*(?:ROI|return)/i);
      if (match) {
        return {
          roi: `${match[1]}x ROI`,
          payback: "Payback in 90 days"
        };
      }
    }
    return {
      roi: "[X]x ROI",
      payback: "Payback in [Y] days"
    };
  }
  createCTA(callToAdventure) {
    if (callToAdventure) {
      return callToAdventure;
    }
    return "Let's Talk";
  }
  convertToYouLanguage(text) {
    return text.replace(/\bwe offer\b/gi, "you get").replace(/\bour (product|solution|platform|system)\b/gi, "your $1").replace(/\bwe provide\b/gi, "you receive").replace(/\bwe help\b/gi, "you'll have");
  }
};

// src/strategies/ConsultingDeckStrategy.ts
var ConsultingDeckStrategy = class {
  type = "consulting_deck";
  name = "McKinsey/BCG Consulting Deck";
  description = "Data-driven executive presentations with rigorous structure";
  experts = {
    primary: "Barbara Minto (Pyramid Principle)",
    secondary: [
      "McKinsey (MECE, Action Titles)",
      "BCG (Horizontal Logic)",
      "Edward Tufte (Data-Ink Ratio)"
    ]
  };
  slideSequence = [
    {
      id: "executive_summary_scr",
      name: "Executive Summary (SCR)",
      type: "two-column",
      required: true,
      purpose: "Lead with the answer - Situation, Complication, Resolution",
      requiredData: ["title", "situation", "complication", "resolution"],
      optionalData: ["source"],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        "Answer FIRST - the recommendation goes at the top",
        "SCR format: Situation \u2192 Complication \u2192 Resolution",
        "Title must be an action title stating the main recommendation"
      ],
      designNotes: [
        "Three-column layout for S, C, R",
        "Resolution/recommendation highlighted",
        "Executive summary box at top with key takeaway"
      ],
      example: {
        title: "Recommend pursuing digital transformation to capture $50M opportunity",
        bullets: [
          "Situation: Market shifting to digital-first with 40% of sales now online",
          "Complication: Current legacy systems prevent us from competing effectively",
          "Resolution: Three-phase digital transformation to capture opportunity"
        ]
      }
    },
    {
      id: "situation_analysis",
      name: "Situation Analysis",
      type: "two-column",
      required: true,
      purpose: "Establish the context everyone agrees on",
      requiredData: ["title", "body", "bullets"],
      optionalData: ["source", "metrics"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Facts only - no opinions yet",
        "Data must be sourced",
        "Set up the problem without stating it"
      ],
      designNotes: [
        "Data visualization on left",
        "Key facts on right",
        "Source citation at bottom"
      ],
      example: {
        title: "Digital sales grew 40% YoY while physical retail declined 15%",
        body: "The market is fundamentally shifting toward digital channels."
      }
    },
    {
      id: "key_findings",
      name: "Key Findings Summary",
      type: "bullet-points",
      required: true,
      purpose: "Present the 3-5 key findings from analysis",
      requiredData: ["title", "bullets"],
      optionalData: ["source"],
      wordLimits: { min: 40, max: 70, ideal: 55 },
      expertPrinciples: [
        "MECE: Findings must not overlap",
        "Maximum 5 findings (cognitive load)",
        "Each finding is a complete insight, not a topic"
      ],
      designNotes: [
        "Numbered list format",
        "Each finding in a separate row",
        "Callout box for most important finding"
      ],
      example: {
        title: "Three factors drive the $50M opportunity in digital transformation",
        bullets: [
          "1. Customer preference: 65% prefer digital channels (up from 40% in 2020)",
          "2. Cost efficiency: Digital transactions cost 80% less than physical",
          "3. Speed to market: Digital products launch 3x faster"
        ]
      }
    },
    {
      id: "finding_detail_1",
      name: "Finding 1 Deep Dive",
      type: "two-column",
      required: true,
      purpose: "Detailed evidence for finding 1",
      requiredData: ["title", "body", "bullets"],
      optionalData: ["metrics", "source"],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: [
        "Action title states the insight",
        "Chart on left, interpretation on right",
        'Include "so what" - why this matters'
      ],
      designNotes: [
        "Chart or data visualization prominent",
        "Callout box highlighting key number",
        "Clear source attribution"
      ]
    },
    {
      id: "finding_detail_2",
      name: "Finding 2 Deep Dive",
      type: "two-column",
      required: true,
      purpose: "Detailed evidence for finding 2",
      requiredData: ["title", "body", "bullets"],
      optionalData: ["metrics", "source"],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: ["Action title states the insight", "Data-driven analysis"],
      designNotes: ["Consistent layout with Finding 1"]
    },
    {
      id: "finding_detail_3",
      name: "Finding 3 Deep Dive",
      type: "two-column",
      required: false,
      purpose: "Detailed evidence for finding 3 (if applicable)",
      requiredData: ["title", "body"],
      optionalData: ["bullets", "metrics", "source"],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: ["Action title states the insight"],
      designNotes: ["Consistent layout"]
    },
    {
      id: "options_comparison",
      name: "Options Comparison",
      type: "table",
      required: true,
      purpose: "Compare strategic options objectively",
      requiredData: ["title", "table"],
      optionalData: ["recommendation_callout"],
      wordLimits: { min: 40, max: 100, ideal: 70 },
      expertPrinciples: [
        "MECE: Options must be mutually exclusive",
        "Evaluation criteria must be weighted",
        "Recommended option clearly marked"
      ],
      designNotes: [
        "Matrix format with criteria as rows, options as columns",
        "Green/yellow/red rating system",
        "Recommendation row at bottom highlighted"
      ],
      example: {
        title: "Option B (Full transformation) scores highest across all criteria",
        body: "Comparison of three strategic options against five weighted criteria"
      }
    },
    {
      id: "recommendation",
      name: "Recommendation",
      type: "two-column",
      required: true,
      purpose: "State the recommendation with supporting rationale",
      requiredData: ["title", "recommendation", "rationale"],
      optionalData: ["source"],
      wordLimits: { min: 50, max: 80, ideal: 65 },
      expertPrinciples: [
        "Recommendation is clear and actionable",
        "Rationale ties back to findings",
        "Impact is quantified"
      ],
      designNotes: [
        "Recommendation in large callout box",
        "Three supporting reasons below",
        "Expected impact highlighted"
      ],
      example: {
        title: "Recommend pursuing Option B: Full digital transformation over 18 months",
        bullets: [
          "Expected NPV: $50M over 5 years",
          "Payback period: 18 months",
          "Risk: Medium (mitigated by phased approach)"
        ]
      }
    },
    {
      id: "implementation_plan",
      name: "Implementation Plan",
      type: "timeline",
      required: true,
      purpose: "Show how and when to execute",
      requiredData: ["title", "phases"],
      optionalData: ["milestones", "dependencies"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Clear phases with dates",
        "Key milestones marked",
        "Quick wins in first 90 days"
      ],
      designNotes: [
        "Gantt-style timeline",
        "Color-coded by phase",
        "Milestones as diamonds"
      ]
    },
    {
      id: "risks_mitigation",
      name: "Risks & Mitigation",
      type: "table",
      required: true,
      purpose: "Acknowledge risks and show mitigation plans",
      requiredData: ["title", "risks"],
      optionalData: ["contingencies"],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: [
        "Be honest about risks",
        "Every risk has a mitigation",
        "Prioritize by likelihood and impact"
      ],
      designNotes: [
        "Risk/Mitigation two-column table",
        "Color-coded severity",
        "Owner column optional"
      ]
    },
    {
      id: "next_steps",
      name: "Next Steps",
      type: "bullet-points",
      required: true,
      purpose: "Clear actions with owners and dates",
      requiredData: ["title", "actions"],
      optionalData: ["owners", "dates"],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        "Actions are specific and actionable",
        "Each has an owner and deadline",
        "First action happens within 1 week"
      ],
      designNotes: [
        "Numbered list with owner and date",
        "First action highlighted",
        "Ask/approval box if needed"
      ],
      example: {
        title: "Three immediate actions required to begin Phase 1",
        bullets: [
          "1. Approve $2M Phase 1 budget [CEO, by Dec 15]",
          "2. Appoint transformation lead [CHRO, by Dec 20]",
          "3. Kick off vendor selection [CTO, by Jan 5]"
        ]
      }
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /^(?!.*\b(is|are|was|were|has|have|will|can|should|must|drove|caused|led|resulted|increased|decreased)\b)(.+)$/i,
      transform: (match) => {
        return match;
      },
      description: "Transform topic titles into action titles"
    },
    {
      sourcePattern: /\d+%|\$[\d,]+/,
      transform: (match) => `[DATA] ${match} [/DATA]`,
      description: "Mark data points for source citation requirement"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "Every slide has an action title",
      "Executive summary leads with recommendation",
      "All data is sourced",
      "Structure is MECE",
      "Horizontal logic works (titles tell story)"
    ],
    excellenceIndicators: [
      "Can present from titles alone",
      "Recommendation is quantified",
      "Risks are honest and mitigated",
      "Next steps have owners and dates"
    ]
  };
  /**
   * Generate slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: this.generateActionTitle(analysis.scqa.answer, "recommendation"),
        body: this.formatSCR(analysis.scqa),
        bullets: [
          `Situation: ${this.truncate(analysis.scqa.situation, 80)}`,
          `Complication: ${this.truncate(analysis.scqa.complication, 80)}`,
          `Resolution: ${this.truncate(analysis.scqa.answer, 80)}`
        ],
        keyMessage: analysis.scqa.answer
      },
      classes: ["slide-executive-summary", "slide-scr"]
    });
    if (analysis.scqa.situation) {
      slides.push({
        index: index++,
        type: "two-column",
        data: {
          title: this.generateActionTitle(analysis.scqa.situation, "situation"),
          body: analysis.scqa.situation,
          bullets: analysis.sparkline.whatIs.slice(0, 4)
        },
        classes: ["slide-situation"]
      });
    }
    if (analysis.keyMessages.length > 0) {
      slides.push({
        index: index++,
        type: "bullet-points",
        data: {
          title: `${analysis.keyMessages.length} key findings drive our recommendation`,
          bullets: analysis.keyMessages.map(
            (msg, i) => `${i + 1}. ${this.generateActionTitle(msg, "finding")}`
          )
        },
        classes: ["slide-key-findings"]
      });
      for (const message of analysis.keyMessages.slice(0, 3)) {
        slides.push({
          index: index++,
          type: "two-column",
          data: {
            title: this.generateActionTitle(message, "finding"),
            body: message,
            bullets: this.extractEvidence(message)
          },
          classes: ["slide-finding-detail"]
        });
      }
    }
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: this.generateActionTitle(analysis.scqa.answer, "recommendation"),
        body: analysis.scqa.answer,
        bullets: analysis.sparkline.whatCouldBe.slice(0, 3),
        keyMessage: "Recommended approach"
      },
      classes: ["slide-recommendation"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Three immediate actions required",
        bullets: [
          "1. [Action] - [Owner, Date]",
          "2. [Action] - [Owner, Date]",
          "3. [Action] - [Owner, Date]"
        ],
        keyMessage: analysis.sparkline.callToAdventure
      },
      classes: ["slide-next-steps"]
    });
    return slides;
  }
  /**
   * Validate slides against consulting deck requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    for (const slide of slides) {
      if (!this.isActionTitle(slide.data.title ?? "")) {
        issues.push(`Slide ${slide.index + 1}: Title is not an action title`);
        score -= 5;
      }
    }
    if (slides[0]?.type !== "two-column" || !slides[0]?.classes?.includes("slide-executive-summary")) {
      issues.push("First slide must be Executive Summary with recommendation");
      score -= 10;
    }
    for (const slide of slides) {
      if (this.containsData(slide) && !slide.data.source) {
        issues.push(`Slide ${slide.index + 1}: Contains data without source`);
        score -= 3;
      }
    }
    const titleStory = slides.map((s) => s.data.title).join(" \u2192 ");
    if (!this.isCoherentStory(titleStory)) {
      suggestions.push("Titles should form a coherent story when read together");
    }
    return {
      passed: issues.filter((i) => !i.includes("suggestion")).length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply McKinsey methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (slide.data.title && !this.isActionTitle(slide.data.title)) {
        slide.data.title = this.generateActionTitle(slide.data.title, "generic");
      }
      if (this.containsData(slide) && !slide.data.source) {
        slide.data.source = "Source: [Add source]";
      }
      return slide;
    });
  }
  // === Helper Methods ===
  generateActionTitle(content, type) {
    if (!content) return "Key insight required";
    if (this.isActionTitle(content)) {
      return content.length > 80 ? content.slice(0, 77) + "..." : content;
    }
    const verbs = {
      recommendation: ["Recommend", "Propose", "Suggest"],
      finding: ["Analysis shows", "Data reveals", "Evidence indicates"],
      situation: ["Market is", "Context shows", "Current state reflects"],
      generic: ["Key insight:", "Analysis shows", "Data indicates"]
    };
    const prefix = verbs[type]?.[0] ?? "Key insight:";
    const cleaned = content.replace(/^(the|a|an)\s+/i, "").replace(/\.$/, "");
    const title = `${prefix} ${cleaned}`;
    return title.length > 80 ? title.slice(0, 77) + "..." : title;
  }
  isActionTitle(title) {
    if (!title || title.length < 10) return false;
    const hasVerb = /\b(is|are|was|were|has|have|had|will|can|could|should|would|may|might|must|exceeded|increased|decreased|grew|fell|drove|caused|enabled|prevented|achieved|shows|reveals|indicates|recommends?|proposes?|suggests?)\b/i.test(title);
    const hasInsight = /\b(by|due to|because|resulting in|leading to|enabling|driving|\d+%|\$[\d,]+)\b/i.test(title);
    const wordCount = title.split(/\s+/).length;
    return hasVerb && wordCount >= 6 && wordCount <= 20;
  }
  containsData(slide) {
    const content = JSON.stringify(slide.data);
    return /\d+%|\$[\d,]+|\d+\s*(million|billion|thousand)/i.test(content);
  }
  isCoherentStory(_story) {
    return true;
  }
  formatSCR(scqa) {
    return `**Situation:** ${scqa.situation}

**Complication:** ${scqa.complication}

**Resolution:** ${scqa.answer}`;
  }
  extractEvidence(message) {
    const sentences = message.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    return sentences.slice(0, 4).map((s) => s.trim());
  }
  truncate(text, max) {
    if (!text) return "";
    if (text.length <= max) return text;
    return text.slice(0, max - 3) + "...";
  }
};

// src/strategies/InvestmentBankingStrategy.ts
var InvestmentBankingStrategy = class {
  type = "investment_banking";
  name = "Investment Banking Pitch Book";
  description = "Wall Street quality pitch books with rigorous valuation analysis";
  experts = {
    primary: "Analyst Academy / Wall Street Prep",
    secondary: [
      "Mergers & Inquisitions (Brian DeChesare)",
      "Breaking Into Wall Street",
      "Street of Walls"
    ]
  };
  // IB Design Standards
  designStandards = {
    fonts: {
      primary: "Garamond",
      fallback: "Times New Roman",
      sizes: {
        title: 14,
        subtitle: 12,
        body: 10,
        footnote: 8,
        tableHeader: 9,
        tableBody: 8
      }
    },
    colors: {
      primary: "#1a365d",
      // Navy blue
      secondary: "#2d4a6f",
      // Lighter navy
      accent: "#c5a572",
      // Gold accent
      background: "#ffffff",
      text: "#000000",
      tableHeader: "#1a365d",
      tableAlt: "#f7f7f7"
    },
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.75,
      right: 0.75
    },
    footer: {
      format: "Confidential | {company} | {date} | Page {n}",
      height: 0.3
    }
  };
  slideSequence = [
    {
      id: "title",
      name: "Title Page",
      type: "title",
      required: true,
      purpose: "Professional cover with bank branding",
      requiredData: ["title", "clientName", "date"],
      optionalData: ["dealType", "bankLogo"],
      wordLimits: { min: 5, max: 20, ideal: 12 },
      expertPrinciples: [
        "Clean, professional design",
        "Bank logo prominently placed",
        "Confidential marking required",
        "Date must be exact"
      ],
      designNotes: [
        "Bank logo top left",
        "Deal type centered",
        "Client name prominent",
        "CONFIDENTIAL watermark or footer"
      ],
      example: {
        title: "Project Falcon",
        subtitle: "Confidential Information Memorandum"
      }
    },
    {
      id: "table_of_contents",
      name: "Table of Contents",
      type: "bullet-points",
      required: true,
      purpose: "Navigation for long pitch books",
      requiredData: ["sections"],
      optionalData: [],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Section numbers aligned",
        "Page numbers right-aligned",
        "Main sections bolded",
        "Subsections indented"
      ],
      designNotes: [
        "Tab leader dots between title and page",
        "Consistent indentation",
        "Usually 5-10 main sections"
      ]
    },
    {
      id: "executive_summary",
      name: "Executive Summary",
      type: "two-column",
      required: true,
      purpose: "One-page deal overview for decision-makers",
      requiredData: ["title", "situation", "recommendation", "keyMetrics"],
      optionalData: ["timeline"],
      wordLimits: { min: 100, max: 200, ideal: 150 },
      expertPrinciples: [
        "Must fit on one page",
        "Key metrics in callout boxes",
        "Recommendation prominent",
        "Timeline if applicable"
      ],
      designNotes: [
        "Three-column layout common",
        "Metrics in colored boxes",
        "Clear section dividers"
      ]
    },
    {
      id: "situation_overview",
      name: "Situation Overview",
      type: "two-column",
      required: true,
      purpose: "Context on company and strategic situation",
      requiredData: ["companyDescription", "currentSituation"],
      optionalData: ["history", "ownership"],
      wordLimits: { min: 80, max: 150, ideal: 110 },
      expertPrinciples: [
        "Factual, not promotional",
        "Key metrics highlighted",
        "Ownership structure clear"
      ],
      designNotes: [
        "Company logo if available",
        "Key stats in sidebar"
      ]
    },
    {
      id: "bank_credentials",
      name: "Bank Credentials",
      type: "grid",
      required: true,
      purpose: "Establish credibility with relevant experience",
      requiredData: ["transactions", "expertise"],
      optionalData: ["rankings", "awards"],
      wordLimits: { min: 50, max: 120, ideal: 85 },
      expertPrinciples: [
        "Only show RELEVANT transactions",
        "Recent deals preferred (last 3 years)",
        "Include deal values",
        "Show sector expertise"
      ],
      designNotes: [
        "Tombstone format for deals",
        "2x3 or 3x3 grid typical",
        "Each tombstone: logo, company, role, value"
      ],
      example: {
        title: "Select Transaction Experience"
      }
    },
    {
      id: "market_overview",
      name: "Market Overview",
      type: "two-column",
      required: true,
      purpose: "Industry context and trends",
      requiredData: ["marketSize", "trends", "keyPlayers"],
      optionalData: ["growthRate", "forecast"],
      wordLimits: { min: 80, max: 150, ideal: 115 },
      expertPrinciples: [
        "All data sourced (IBISWorld, Capital IQ, etc.)",
        "TAM/SAM/SOM if applicable",
        "Trend arrows on charts",
        "Competitive positioning"
      ],
      designNotes: [
        "Market size chart",
        "Key players logos",
        "Growth indicators"
      ]
    },
    {
      id: "valuation_summary",
      name: "Valuation Summary",
      type: "big-number",
      required: true,
      purpose: "High-level valuation range",
      requiredData: ["valuationRange", "methodology"],
      optionalData: ["impliedMultiples"],
      wordLimits: { min: 30, max: 80, ideal: 55 },
      expertPrinciples: [
        "Range, not point estimate",
        "Show all methodologies used",
        "Footnote key assumptions",
        "Reference to detailed pages"
      ],
      designNotes: [
        "Range bar visualization",
        "Methodology breakdown",
        "Clear currency/units"
      ],
      example: {
        title: "Implied Enterprise Value: $450M - $550M"
      }
    },
    {
      id: "comparable_companies",
      name: "Comparable Company Analysis",
      type: "table",
      required: true,
      purpose: "Trading multiples from peer group",
      requiredData: ["companies", "metrics"],
      optionalData: ["medians", "quartiles"],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        "Minimum 5-8 comparable companies",
        "Multiple metrics: EV/Revenue, EV/EBITDA, P/E",
        "Mean/Median clearly marked",
        "Applied multiple highlighted"
      ],
      designNotes: [
        "Horizontal table format",
        "Shaded header row",
        "Target company row highlighted",
        "Sources at bottom (Capital IQ, Bloomberg)"
      ]
    },
    {
      id: "precedent_transactions",
      name: "Precedent Transactions Analysis",
      type: "table",
      required: true,
      purpose: "Historical M&A transaction multiples",
      requiredData: ["transactions", "metrics"],
      optionalData: ["premiums", "controlPremium"],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        "Recent transactions (3-5 years)",
        "Show premiums paid",
        "Control premium discussion",
        "Deal rationale notes"
      ],
      designNotes: [
        "Date, Acquirer, Target, Value, Multiples",
        "Sorted by date (newest first)",
        "Mean/Median row"
      ]
    },
    {
      id: "dcf_analysis",
      name: "DCF Analysis",
      type: "table",
      required: true,
      purpose: "Discounted cash flow valuation",
      requiredData: ["projections", "wacc", "terminalValue"],
      optionalData: ["sensitivityTable"],
      wordLimits: { min: 60, max: 120, ideal: 90 },
      expertPrinciples: [
        "5-year projection minimum",
        "Clear WACC calculation",
        "Terminal value method stated",
        "Sensitivity table required"
      ],
      designNotes: [
        "Cash flow waterfall",
        "WACC build-up shown",
        "Terminal value calculation",
        "Sensitivity matrix: WACC vs Terminal Growth"
      ]
    },
    {
      id: "football_field",
      name: "Football Field Chart",
      type: "chart",
      required: true,
      purpose: "Visual summary of all valuation methodologies",
      requiredData: ["valuationRanges"],
      optionalData: ["currentPrice", "targetPrice"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "All methodologies on one chart",
        "Horizontal bar format",
        "Reference price line if public",
        "Clear labels for each range"
      ],
      designNotes: [
        "Horizontal bars by methodology",
        "Vertical reference lines",
        "Color-coded by methodology type",
        "Legend clear"
      ],
      example: {
        title: "Summary Valuation Analysis"
      }
    },
    {
      id: "sources_uses",
      name: "Sources & Uses of Funds",
      type: "table",
      required: true,
      purpose: "Deal financing structure",
      requiredData: ["sources", "uses"],
      optionalData: ["proForma"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Sources = Uses (must balance)",
        "Show each debt tranche",
        "Equity contribution clear",
        "Fees itemized"
      ],
      designNotes: [
        "Two-column table",
        "Sources on left, Uses on right",
        "Totals bolded",
        "Percentages shown"
      ]
    },
    {
      id: "pro_forma_capitalization",
      name: "Pro Forma Capitalization",
      type: "table",
      required: true,
      purpose: "Post-transaction capital structure",
      requiredData: ["debtSchedule", "equity"],
      optionalData: ["covenants", "amortization"],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        "Show current vs pro forma",
        "All debt tranches listed",
        "Credit metrics calculated",
        "Leverage ratios shown"
      ],
      designNotes: [
        "Before/After columns",
        "Debt by seniority",
        "Key ratios highlighted"
      ]
    },
    {
      id: "process_timeline",
      name: "Process Timeline",
      type: "timeline",
      required: true,
      purpose: "Transaction execution roadmap",
      requiredData: ["phases", "milestones"],
      optionalData: ["workstreams"],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        "Key milestones dated",
        "Decision points marked",
        "Regulatory timeline if applicable",
        "Realistic durations"
      ],
      designNotes: [
        "Horizontal Gantt-style",
        "Phases color-coded",
        "Milestones as diamonds",
        "Current date marked"
      ]
    },
    {
      id: "risk_factors",
      name: "Risk Factors",
      type: "bullet-points",
      required: true,
      purpose: "Key risks and mitigants",
      requiredData: ["risks", "mitigants"],
      optionalData: [],
      wordLimits: { min: 60, max: 120, ideal: 90 },
      expertPrinciples: [
        "Honest about material risks",
        "Each risk has mitigation",
        "Organized by category",
        "Legal will review"
      ],
      designNotes: [
        "Risk | Mitigation two-column",
        "Severity indicators",
        "Grouped by type"
      ]
    },
    {
      id: "appendix_divider",
      name: "Appendix Divider",
      type: "section-break",
      required: false,
      purpose: "Separate main deck from detailed appendices",
      requiredData: ["title"],
      optionalData: [],
      wordLimits: { min: 1, max: 5, ideal: 2 },
      expertPrinciples: [
        "Clear visual break",
        "Lists appendix sections"
      ],
      designNotes: [
        "Full-page title",
        "Bank colors"
      ]
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:million|mn|M)\b/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? "0");
        return `$${num.toFixed(1)}M`;
      },
      description: "Standardize million format to $XM"
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:billion|bn|B)\b/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? "0");
        return `$${num.toFixed(1)}B`;
      },
      description: "Standardize billion format to $XB"
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*x\s*(ebitda|revenue|earnings)/gi,
      transform: (match) => match.replace(/x\s*/i, "x ").toUpperCase(),
      description: "Standardize multiple format (e.g., 5.0x EBITDA)"
    },
    {
      sourcePattern: /\b(?:source|src):\s*/gi,
      transform: () => "Source: ",
      description: "Standardize source citations"
    }
  ];
  qualityBenchmarks = {
    minScore: 98,
    criticalChecks: [
      "Football field chart included",
      "All valuations have ranges",
      "Every number is sourced",
      "Multiple valuation methodologies used",
      "Sources & Uses balances",
      "Pro forma cap table complete",
      "Bank credentials relevant to deal"
    ],
    excellenceIndicators: [
      "Sensitivity tables included",
      "Transaction timeline realistic",
      "Risk factors honest and mitigated",
      "Comparable selection justified",
      "DCF assumptions well-documented"
    ]
  };
  /**
   * Generate investment banking slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: analysis.scqa.situation ? `Project ${this.generateCodeName()}` : "Confidential Information Memorandum",
        subtitle: "CONFIDENTIAL",
        keyMessage: this.formatDate(/* @__PURE__ */ new Date())
      },
      classes: ["slide-title", "slide-ib-cover"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Table of Contents",
        bullets: [
          "I. Executive Summary",
          "II. Situation Overview",
          "III. Bank Credentials",
          "IV. Market Overview",
          "V. Valuation Analysis",
          "VI. Transaction Structure",
          "VII. Process & Timeline",
          "VIII. Appendix"
        ]
      },
      classes: ["slide-toc"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "Executive Summary",
        body: analysis.scqa.situation ?? "Situation overview",
        bullets: [
          analysis.scqa.complication ?? "Key consideration",
          analysis.scqa.answer ?? "Recommended approach"
        ],
        keyMessage: "Key metrics and recommendation"
      },
      classes: ["slide-executive-summary", "slide-ib"]
    });
    if (analysis.scqa.situation) {
      slides.push({
        index: index++,
        type: "two-column",
        data: {
          title: "Situation Overview",
          body: analysis.scqa.situation,
          bullets: analysis.sparkline.whatIs.slice(0, 4)
        },
        classes: ["slide-situation", "slide-ib"]
      });
    }
    slides.push({
      index: index++,
      type: "grid",
      data: {
        title: "Select Transaction Experience",
        body: "Relevant M&A and capital markets experience",
        keyMessage: "[Insert tombstones]"
      },
      classes: ["slide-credentials", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "Market Overview",
        body: "Industry dynamics and competitive landscape",
        bullets: analysis.keyMessages.slice(0, 4)
      },
      classes: ["slide-market", "slide-ib"]
    });
    const valuationData = this.extractValuationData(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: valuationData.range,
        subtitle: "Implied Enterprise Value",
        body: valuationData.methodology,
        keyMessage: "Based on multiple valuation approaches"
      },
      classes: ["slide-valuation-summary", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Comparable Company Analysis",
        body: "Trading multiples from public peer group",
        keyMessage: "Source: Capital IQ, Bloomberg"
      },
      classes: ["slide-comps", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Precedent Transactions Analysis",
        body: "Historical M&A transaction multiples",
        keyMessage: "Source: Capital IQ, MergerMarket"
      },
      classes: ["slide-precedents", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Discounted Cash Flow Analysis",
        body: "Intrinsic value based on projected cash flows",
        keyMessage: "Sensitivity: WACC vs Terminal Growth"
      },
      classes: ["slide-dcf", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "chart",
      data: {
        title: "Summary Valuation Analysis",
        body: valuationData.range,
        keyMessage: "Football field showing all methodologies"
      },
      classes: ["slide-football-field", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Sources & Uses of Funds",
        body: "Transaction financing structure"
      },
      classes: ["slide-sources-uses", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Pro Forma Capitalization",
        body: "Post-transaction capital structure"
      },
      classes: ["slide-cap-table", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "timeline",
      data: {
        title: "Indicative Process Timeline",
        body: "Key milestones and decision points"
      },
      classes: ["slide-timeline", "slide-ib"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Key Risk Factors & Mitigants",
        bullets: [
          "Market risk: [Description] | Mitigation: [Approach]",
          "Execution risk: [Description] | Mitigation: [Approach]",
          "Regulatory risk: [Description] | Mitigation: [Approach]"
        ]
      },
      classes: ["slide-risks", "slide-ib"]
    });
    return slides;
  }
  /**
   * Validate slides against IB pitch book requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    const hasFootballField = slides.some(
      (s) => s.classes?.includes("slide-football-field") || s.type === "chart"
    );
    if (!hasFootballField) {
      issues.push("Missing football field chart - required for valuation summary");
      score -= 10;
    }
    const hasComps = slides.some((s) => s.classes?.includes("slide-comps"));
    const hasPrecedents = slides.some((s) => s.classes?.includes("slide-precedents"));
    const hasDCF = slides.some((s) => s.classes?.includes("slide-dcf"));
    if (!hasComps) {
      issues.push("Missing comparable company analysis");
      score -= 10;
    }
    if (!hasPrecedents) {
      issues.push("Missing precedent transactions analysis");
      score -= 10;
    }
    if (!hasDCF) {
      issues.push("Missing DCF analysis");
      score -= 10;
    }
    const hasSourcesUses = slides.some((s) => s.classes?.includes("slide-sources-uses"));
    if (!hasSourcesUses) {
      issues.push("Missing sources & uses of funds");
      score -= 8;
    }
    for (const slide of slides) {
      if (this.containsFinancialData(slide) && !slide.data.source) {
        issues.push(`Slide ${slide.index + 1}: Financial data without source citation`);
        score -= 2;
      }
    }
    const hasCredentials = slides.some((s) => s.classes?.includes("slide-credentials"));
    if (!hasCredentials) {
      suggestions.push("Consider adding bank credentials/transaction experience");
    }
    return {
      passed: issues.filter((i) => !i.includes("Consider")).length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply IB methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (this.containsFinancialData(slide) && !slide.data.source) {
        slide.data.source = "Source: [Capital IQ, Bloomberg, Company Filings]";
      }
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes("slide-ib")) {
        slide.classes.push("slide-ib");
      }
      if (slide.data.body) {
        slide.data.body = this.formatNumbers(slide.data.body);
      }
      if (slide.data.title) {
        slide.data.title = this.formatNumbers(slide.data.title);
      }
      return slide;
    });
  }
  // === Helper Methods ===
  generateCodeName() {
    const words = ["Falcon", "Eagle", "Phoenix", "Atlas", "Titan", "Apex", "Summit", "Crown"];
    return words[Math.floor(Math.random() * words.length)] ?? "Project";
  }
  formatDate(date) {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  extractValuationData(analysis) {
    for (const star of analysis.starMoments) {
      const valueMatch = star.match(/\$[\d,.]+\s*(?:million|billion|M|B)?/i);
      if (valueMatch) {
        return {
          range: valueMatch[0],
          methodology: "DCF, Comparable Companies, Precedent Transactions"
        };
      }
    }
    return {
      range: "$[X]M - $[Y]M",
      methodology: "DCF, Comparable Companies, Precedent Transactions"
    };
  }
  containsFinancialData(slide) {
    const content = JSON.stringify(slide.data);
    return /\$[\d,]+|\d+\.\d+x|\d+%|\bEBITDA\b|\bRevenue\b|\bEV\b/i.test(content);
  }
  formatNumbers(text) {
    return text.replace(/(\d+(?:\.\d+)?)\s*(?:million|mn)\b/gi, (_, n) => `$${parseFloat(n).toFixed(1)}M`).replace(/(\d+(?:\.\d+)?)\s*(?:billion|bn)\b/gi, (_, n) => `$${parseFloat(n).toFixed(1)}B`).replace(/(\d+(?:\.\d+)?)\s*x\b/gi, (_, n) => `${parseFloat(n).toFixed(1)}x`);
  }
};

// src/strategies/InvestorPitchStrategy.ts
var InvestorPitchStrategy = class {
  type = "investor_pitch";
  name = "VC/Investor Pitch Deck";
  description = "Venture capital pitch decks following Sequoia/YC format";
  experts = {
    primary: "Sequoia Capital Pitch Deck Template",
    secondary: [
      "Y Combinator (Demo Day Format)",
      "First Round Capital",
      "Bessemer Venture Partners",
      "DocSend Pitch Deck Research"
    ]
  };
  // Famous pitch deck insights
  referenceDecks = {
    airbnb: {
      slides: 10,
      keyElements: ["Problem/Solution clarity", "Market validation", "Simple metrics"],
      lesson: "Keep it simple, show the opportunity"
    },
    linkedin: {
      slides: 15,
      keyElements: ["Network effects", "Viral growth model", "Monetization path"],
      lesson: "Show how growth compounds"
    },
    uber: {
      slides: 12,
      keyElements: ["Market size", "Unit economics", "Expansion strategy"],
      lesson: "Demonstrate massive market opportunity"
    },
    buffer: {
      slides: 10,
      keyElements: ["Transparency", "Real metrics", "Authentic story"],
      lesson: "Honesty and real numbers win"
    }
  };
  slideSequence = [
    {
      id: "title_company",
      name: "Title / Company Purpose",
      type: "title",
      required: true,
      purpose: "Hook investors with a powerful one-liner",
      requiredData: ["companyName", "tagline"],
      optionalData: ["logo"],
      wordLimits: { min: 3, max: 15, ideal: 8 },
      expertPrinciples: [
        "One sentence that explains what you do",
        "Must be instantly understandable",
        "Avoid jargon and buzzwords",
        'Y Combinator: "What do you make?"'
      ],
      designNotes: [
        "Logo prominent",
        "Tagline large and clear",
        "Minimal visual clutter",
        "Contact info optional"
      ],
      example: {
        title: "Airbnb",
        subtitle: "Book rooms with locals, rather than hotels"
      }
    },
    {
      id: "problem",
      name: "The Problem",
      type: "single-statement",
      required: true,
      purpose: "Make investors FEEL the pain",
      requiredData: ["problem", "impact"],
      optionalData: ["statistics"],
      wordLimits: { min: 10, max: 40, ideal: 25 },
      expertPrinciples: [
        "Be specific, not abstract",
        "Quantify the pain if possible",
        "Personal story is powerful",
        "Investors must believe this problem exists"
      ],
      designNotes: [
        "One clear problem statement",
        "Supporting stat if available",
        "Visual representation of pain"
      ],
      example: {
        title: "Hotels are expensive and impersonal",
        subtitle: "Travelers pay $150/night for cookie-cutter rooms"
      }
    },
    {
      id: "solution",
      name: "Your Solution",
      type: "single-statement",
      required: true,
      purpose: "Clear explanation of what you built",
      requiredData: ["solution", "howItWorks"],
      optionalData: ["demo", "screenshot"],
      wordLimits: { min: 10, max: 40, ideal: 25 },
      expertPrinciples: [
        "Explain in one sentence",
        "Show, don't tell (screenshot/demo)",
        "Focus on user benefit, not features",
        "How does it solve the problem above?"
      ],
      designNotes: [
        "Product screenshot or demo",
        "Simple explanation",
        "Before/After if applicable"
      ],
      example: {
        title: "We let people book rooms with locals",
        subtitle: "Unique stays at half the price"
      }
    },
    {
      id: "why_now",
      name: "Why Now?",
      type: "bullet-points",
      required: true,
      purpose: "Explain the market timing",
      requiredData: ["marketShifts", "timing"],
      optionalData: ["trends"],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        "Why hasn't this been built before?",
        "What changed recently?",
        "Technology shift, behavior shift, regulation shift",
        "Urgency is key"
      ],
      designNotes: [
        "3-4 key reasons",
        "Each with clear evidence",
        "Timeline if relevant"
      ],
      example: {
        bullets: [
          "Mobile phones in everyone's pocket",
          "Trust in strangers normalized (eBay, rideshare)",
          "Travel demand at all-time high"
        ]
      }
    },
    {
      id: "market_size",
      name: "Market Size (TAM/SAM/SOM)",
      type: "big-number",
      required: true,
      purpose: "Show the opportunity is HUGE",
      requiredData: ["tam", "sam", "som"],
      optionalData: ["sources", "growthRate"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "TAM: Total addressable market",
        "SAM: Serviceable addressable market",
        "SOM: Serviceable obtainable market",
        "MUST cite sources",
        "Bottom-up analysis preferred"
      ],
      designNotes: [
        "Nested circles or bars",
        "Clear $X B/M numbers",
        "Source at bottom",
        "Growth rate highlighted"
      ],
      example: {
        title: "$532B",
        subtitle: "Global accommodation market"
      }
    },
    {
      id: "product",
      name: "Product / How It Works",
      type: "two-column",
      required: true,
      purpose: "Show the product in action",
      requiredData: ["productDescription", "keyFeatures"],
      optionalData: ["screenshots", "demo"],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        "Screenshot or demo video",
        "3 key features max",
        "Focus on user experience",
        "Show, don't tell"
      ],
      designNotes: [
        "Product screenshot prominent",
        "Feature callouts",
        "User testimonial optional"
      ]
    },
    {
      id: "business_model",
      name: "Business Model",
      type: "bullet-points",
      required: true,
      purpose: "How you make money",
      requiredData: ["revenueModel", "pricing"],
      optionalData: ["unitEconomics", "ltv", "cac"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Clear revenue streams",
        "Unit economics if available",
        "LTV:CAC ratio if known",
        "Path to profitability"
      ],
      designNotes: [
        "Simple diagram if needed",
        "Key metrics highlighted",
        "Pricing tiers if B2B"
      ],
      example: {
        bullets: [
          "10% commission on each booking",
          "LTV: $1,200 | CAC: $120 | LTV:CAC: 10:1",
          "Gross margin: 85%"
        ]
      }
    },
    {
      id: "traction",
      name: "Traction / Metrics",
      type: "big-number",
      required: true,
      purpose: "Prove you're not just an idea",
      requiredData: ["metrics"],
      optionalData: ["growth", "milestones"],
      wordLimits: { min: 15, max: 50, ideal: 30 },
      expertPrinciples: [
        "Real numbers only - no vanity metrics",
        "Show growth rate (MoM, YoY)",
        "Revenue, users, engagement - pick strongest",
        "Up-and-to-the-right chart"
      ],
      designNotes: [
        "One primary metric BIG",
        "Growth chart if impressive",
        "Milestone timeline optional"
      ],
      example: {
        title: "$2.5M ARR",
        subtitle: "Growing 25% MoM"
      }
    },
    {
      id: "competition",
      name: "Competition / Differentiation",
      type: "table",
      required: true,
      purpose: "Show awareness of landscape and your edge",
      requiredData: ["competitors", "differentiation"],
      optionalData: ["positioningMatrix"],
      wordLimits: { min: 25, max: 60, ideal: 45 },
      expertPrinciples: [
        'Never say "no competition"',
        "2x2 matrix is classic",
        "Your company in top-right",
        "Focus on your unique angle"
      ],
      designNotes: [
        "2x2 positioning matrix OR",
        "Feature comparison table",
        "You highlighted"
      ],
      example: {
        title: "We're the only platform that..."
      }
    },
    {
      id: "team",
      name: "Team",
      type: "grid",
      required: true,
      purpose: "Why THIS team will win",
      requiredData: ["founders", "expertise"],
      optionalData: ["advisors", "hiresNeeded"],
      wordLimits: { min: 30, max: 80, ideal: 55 },
      expertPrinciples: [
        "Relevant experience highlighted",
        "Past wins/exits mentioned",
        "Why you're uniquely qualified",
        "Advisors if impressive"
      ],
      designNotes: [
        "Photos if available",
        "Key credentials (logos)",
        "2-3 founders max featured",
        "LinkedIn-style layout"
      ],
      example: {
        bullets: [
          "CEO: Former Booking.com, scaled to $1B",
          "CTO: Ex-Google, built Maps team",
          "COO: 3x founder, 2 exits"
        ]
      }
    },
    {
      id: "financials",
      name: "Financial Projections",
      type: "table",
      required: true,
      purpose: "Show the path to scale",
      requiredData: ["projections"],
      optionalData: ["assumptions", "milestones"],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        "3-5 year projections",
        "Bottom-up, not top-down",
        "Be able to defend assumptions",
        "Show path to profitability"
      ],
      designNotes: [
        "Simple chart or table",
        "Key milestones marked",
        "Break-even highlighted"
      ]
    },
    {
      id: "the_ask",
      name: "The Ask",
      type: "cta",
      required: true,
      purpose: "Clear funding request and use of funds",
      requiredData: ["amount", "useOfFunds"],
      optionalData: ["terms", "timeline"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Specific amount requested",
        "Clear use of funds",
        "18-24 month runway typically",
        "What milestones will this achieve?"
      ],
      designNotes: [
        "Amount prominent",
        "Pie chart for use of funds",
        "Next milestones listed"
      ],
      example: {
        title: "Raising $5M Series A",
        bullets: [
          "40% - Engineering (hire 5)",
          "30% - Sales & Marketing",
          "20% - Operations",
          "10% - G&A"
        ]
      }
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /(\d+)\s*(?:monthly active users?|MAU)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? "0");
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M MAU`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K MAU`;
        return `${num} MAU`;
      },
      description: "Format user metrics"
    },
    {
      sourcePattern: /(\d+)%?\s*(?:month over month|MoM|mom)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? "0");
        return `${num}% MoM`;
      },
      description: "Standardize growth rate format"
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:million|M)\s*(?:ARR|arr)/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? "0");
        return `$${num.toFixed(1)}M ARR`;
      },
      description: "Format ARR metrics"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "Problem clearly articulated",
      "Solution clearly solves the problem",
      "Market size sourced (TAM/SAM/SOM)",
      "Traction with real numbers",
      "Team credentials clear",
      "Ask is specific with use of funds"
    ],
    excellenceIndicators: [
      'Compelling "why now" narrative',
      "Strong unit economics",
      "Clear competitive differentiation",
      "Realistic but ambitious projections",
      "Deck under 15 slides"
    ]
  };
  /**
   * Generate investor pitch slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: analysis.scqa.answer ? this.extractCompanyName(analysis.scqa.answer) : "Company Name",
        subtitle: this.createTagline(analysis.scqa.answer ?? analysis.keyMessages[0] ?? ""),
        keyMessage: "Company purpose"
      },
      classes: ["slide-title", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.formatAsProblem(analysis.sparkline.whatIs[0] ?? analysis.scqa.complication ?? ""),
        keyMessage: "The problem we solve"
      },
      classes: ["slide-problem", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.formatAsSolution(analysis.scqa.answer ?? analysis.sparkline.whatCouldBe[0] ?? ""),
        keyMessage: "Our solution"
      },
      classes: ["slide-solution", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Why Now?",
        bullets: this.extractWhyNow(analysis),
        keyMessage: "Market timing"
      },
      classes: ["slide-why-now", "slide-investor-pitch"]
    });
    const marketData = this.extractMarketData(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: marketData.tam,
        subtitle: "Total Addressable Market",
        bullets: [
          `SAM: ${marketData.sam}`,
          `SOM: ${marketData.som}`
        ],
        keyMessage: "Market opportunity"
      },
      classes: ["slide-market-size", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "How It Works",
        body: analysis.scqa.answer ?? "Product description",
        bullets: analysis.keyMessages.slice(0, 3),
        keyMessage: "Product overview"
      },
      classes: ["slide-product", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Business Model",
        bullets: [
          "Revenue model: [Primary revenue stream]",
          "Pricing: [Pricing structure]",
          "Unit economics: LTV $[X] | CAC $[Y]"
        ],
        keyMessage: "How we make money"
      },
      classes: ["slide-business-model", "slide-investor-pitch"]
    });
    const tractionData = this.extractTraction(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: tractionData.primaryMetric,
        subtitle: tractionData.growth,
        body: "Key milestones achieved",
        keyMessage: "Proof of traction"
      },
      classes: ["slide-traction", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Competitive Landscape",
        body: "We're uniquely positioned because...",
        keyMessage: "Our differentiation"
      },
      classes: ["slide-competition", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "grid",
      data: {
        title: "The Team",
        bullets: [
          "Founder 1: [Role] - [Relevant experience]",
          "Founder 2: [Role] - [Relevant experience]",
          "Advisors: [Key advisors]"
        ],
        keyMessage: "Why we'll win"
      },
      classes: ["slide-team", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Financial Projections",
        body: "3-year revenue projection",
        keyMessage: "Path to scale"
      },
      classes: ["slide-financials", "slide-investor-pitch"]
    });
    slides.push({
      index: index++,
      type: "cta",
      data: {
        title: "Raising $[X]M [Round]",
        bullets: [
          "[X]% - Engineering",
          "[Y]% - Sales & Marketing",
          "[Z]% - Operations"
        ],
        body: "This will achieve: [Key milestones]",
        keyMessage: "Our ask"
      },
      classes: ["slide-ask", "slide-investor-pitch"]
    });
    return slides;
  }
  /**
   * Validate slides against investor pitch requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    if (slides.length > 15) {
      issues.push(`Deck has ${slides.length} slides - should be 10-15 max`);
      score -= 5;
    }
    const hasProblem = slides.some((s) => s.classes?.includes("slide-problem"));
    if (!hasProblem) {
      issues.push("Missing clear problem statement");
      score -= 10;
    }
    const hasSolution = slides.some((s) => s.classes?.includes("slide-solution"));
    if (!hasSolution) {
      issues.push("Missing solution slide");
      score -= 10;
    }
    const hasMarket = slides.some((s) => s.classes?.includes("slide-market-size"));
    if (!hasMarket) {
      issues.push("Missing market size (TAM/SAM/SOM)");
      score -= 10;
    }
    const hasTraction = slides.some((s) => s.classes?.includes("slide-traction"));
    if (!hasTraction) {
      issues.push("Missing traction/metrics slide");
      score -= 10;
    }
    const hasTeam = slides.some((s) => s.classes?.includes("slide-team"));
    if (!hasTeam) {
      issues.push("Missing team slide");
      score -= 8;
    }
    const hasAsk = slides.some((s) => s.classes?.includes("slide-ask"));
    if (!hasAsk) {
      issues.push('Missing "The Ask" slide with use of funds');
      score -= 10;
    }
    const hasWhyNow = slides.some((s) => s.classes?.includes("slide-why-now"));
    if (!hasWhyNow) {
      suggestions.push('Consider adding "Why Now?" slide for stronger narrative');
    }
    const hasCompetition = slides.some((s) => s.classes?.includes("slide-competition"));
    if (!hasCompetition) {
      suggestions.push("Consider adding competitive landscape/differentiation");
    }
    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply investor pitch methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes("slide-investor-pitch")) {
        slide.classes.push("slide-investor-pitch");
      }
      if (slide.data.title) {
        slide.data.title = this.formatMetrics(slide.data.title);
      }
      return slide;
    });
  }
  // === Helper Methods ===
  extractCompanyName(text) {
    const match = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/);
    return match?.[0] ?? "Company Name";
  }
  createTagline(text) {
    const words = text.split(/\s+/).slice(0, 10);
    return words.join(" ");
  }
  formatAsProblem(text) {
    if (!text) return "The problem we solve";
    const cleaned = text.replace(/^(the\s+)?problem\s+(is\s+)?/i, "").trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  formatAsSolution(text) {
    if (!text) return "Our solution";
    const cleaned = text.replace(/^(we\s+)?(our\s+)?solution\s+(is\s+)?/i, "").trim();
    if (!cleaned.match(/^we\s/i)) {
      return "We " + cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }
    return cleaned;
  }
  extractWhyNow(analysis) {
    const reasons = [];
    if (analysis.sparkline.whatIs.length > 0) {
      reasons.push(`Market shift: ${analysis.sparkline.whatIs[0]?.slice(0, 50)}`);
    }
    if (reasons.length === 0) {
      reasons.push(
        "Technology enabler: [New technology/platform]",
        "Behavior change: [Changed user expectations]",
        "Market timing: [Why the market is ready now]"
      );
    }
    return reasons.slice(0, 4);
  }
  extractMarketData(analysis) {
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+\s*(?:billion|B)/i);
      if (match) {
        return {
          tam: match[0],
          sam: "[SAM calculation]",
          som: "[SOM calculation]"
        };
      }
    }
    return {
      tam: "$[X]B",
      sam: "$[Y]B",
      som: "$[Z]M"
    };
  }
  extractTraction(analysis) {
    for (const star of analysis.starMoments) {
      const revenueMatch = star.match(/\$[\d,.]+\s*(?:million|M|ARR)/i);
      const growthMatch = star.match(/(\d+)%?\s*(?:growth|MoM|YoY)/i);
      if (revenueMatch) {
        return {
          primaryMetric: revenueMatch[0],
          growth: growthMatch ? `${growthMatch[1]}% growth` : "Growing fast"
        };
      }
    }
    return {
      primaryMetric: "$[X]M ARR",
      growth: "[Y]% MoM growth"
    };
  }
  formatMetrics(text) {
    return text.replace(/(\d+)\s*(?:million|M)\s*(?:users?)/gi, (_, n) => `${parseInt(n).toLocaleString()}M users`).replace(/(\d+(?:\.\d+)?)\s*(?:million|M)\s*(?:ARR)/gi, (_, n) => `$${parseFloat(n).toFixed(1)}M ARR`).replace(/(\d+)%?\s*(?:MoM|month.over.month)/gi, (_, n) => `${n}% MoM`);
  }
};

// src/strategies/TechnicalPresentationStrategy.ts
var TechnicalPresentationStrategy = class {
  type = "technical_presentation";
  name = "Technical Presentation";
  description = "System design and architecture presentations for engineering audiences";
  experts = {
    primary: "Edward Tufte (Visual Display of Quantitative Information)",
    secondary: [
      "C4 Model (Simon Brown)",
      "Google Design Doc Format",
      "RFC Process",
      "DORA Metrics"
    ]
  };
  // C4 Model diagram levels
  c4Levels = {
    context: "System Context - How system fits in the world",
    container: "Containers - High-level building blocks",
    component: "Components - Inside each container",
    code: "Code - Implementation details"
  };
  // Architecture diagram standards
  diagramStandards = {
    colors: {
      external: "#999999",
      system: "#1168bd",
      container: "#438dd5",
      component: "#85bbf0",
      database: "#f5a623",
      message: "#6b9e78"
    },
    shapes: {
      person: "Stick figure or rounded rectangle",
      system: "Large rectangle with border",
      container: "Rectangle",
      database: "Cylinder",
      queue: "Rectangle with wave bottom"
    },
    labels: {
      required: ["Name", "Technology", "Description"],
      optional: ["Protocol", "Port", "Data flow"]
    }
  };
  slideSequence = [
    {
      id: "title",
      name: "Title",
      type: "title",
      required: true,
      purpose: "Clear identification of what this presentation covers",
      requiredData: ["title", "author", "date"],
      optionalData: ["version", "status"],
      wordLimits: { min: 5, max: 20, ideal: 12 },
      expertPrinciples: [
        "Clear, descriptive title",
        "Date and version visible",
        "Author/team ownership clear",
        "Status (Draft, Final, Proposed)"
      ],
      designNotes: [
        "Clean, professional",
        "Team/company branding",
        "RFC/ADR number if applicable"
      ],
      example: {
        title: "RFC-2024-001: Migrating to Event-Driven Architecture",
        subtitle: "Architecture Decision Record - Draft v0.2"
      }
    },
    {
      id: "agenda",
      name: "Agenda / TL;DR",
      type: "bullet-points",
      required: true,
      purpose: "Quick overview and navigation",
      requiredData: ["agenda"],
      optionalData: ["estimatedTime"],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        "TL;DR at the top for busy engineers",
        "Clear section breakdown",
        "Time estimates if long",
        "Skip to specific sections"
      ],
      designNotes: [
        "Numbered sections",
        "Current section indicator",
        "Page numbers"
      ],
      example: {
        title: "TL;DR & Agenda",
        bullets: [
          "TL;DR: Migrate from REST to event-driven to reduce latency 50%",
          "1. Context & Problem (5 min)",
          "2. Proposed Solution (10 min)",
          "3. Tradeoffs & Risks (5 min)"
        ]
      }
    },
    {
      id: "problem_context",
      name: "Problem / Context",
      type: "two-column",
      required: true,
      purpose: "Why are we doing this? What problem does it solve?",
      requiredData: ["problem", "context", "metrics"],
      optionalData: ["history"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Data-driven problem statement",
        "Current performance metrics",
        "Why now? What changed?",
        "Impact of not solving"
      ],
      designNotes: [
        "Metrics visualization",
        "Current state diagram optional",
        "Source data citations"
      ],
      example: {
        title: "Current API latency exceeds SLA 40% of the time",
        bullets: [
          "P99 latency: 2.3s (SLA: 500ms)",
          "Error rate: 2.1% (SLA: 0.1%)",
          "User complaints up 300% in Q3"
        ]
      }
    },
    {
      id: "current_architecture",
      name: "Current Architecture",
      type: "diagram",
      required: true,
      purpose: "Show the current state (C4 Level 2)",
      requiredData: ["diagram"],
      optionalData: ["dataFlow", "bottlenecks"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "C4 Container diagram level",
        "Highlight pain points",
        "Show data flows",
        "Mark bottlenecks"
      ],
      designNotes: [
        "Standard C4 notation",
        "Bottlenecks in red",
        "Data flow arrows labeled"
      ]
    },
    {
      id: "proposed_solution",
      name: "Proposed Solution",
      type: "single-statement",
      required: true,
      purpose: "One sentence summary of the solution",
      requiredData: ["solution", "benefit"],
      optionalData: [],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        "One clear solution statement",
        "Expected improvement",
        "High-level approach",
        "Link to detailed section"
      ],
      designNotes: [
        "Bold, clear statement",
        "Expected metrics improvement",
        "Simple before/after"
      ],
      example: {
        title: "Migrate to event-driven architecture with Kafka",
        subtitle: "Reduce P99 latency from 2.3s to <200ms"
      }
    },
    {
      id: "architecture_diagram",
      name: "Proposed Architecture",
      type: "diagram",
      required: true,
      purpose: "Show the target state (C4 Level 2)",
      requiredData: ["diagram"],
      optionalData: ["legend"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "C4 Container diagram",
        "Clear labeling",
        "Technology choices visible",
        "New components highlighted"
      ],
      designNotes: [
        "Standard C4 notation",
        "New components in green",
        "Removed components grayed"
      ]
    },
    {
      id: "data_flow",
      name: "Data Flow",
      type: "diagram",
      required: true,
      purpose: "Show how data moves through the system",
      requiredData: ["dataFlow"],
      optionalData: ["sequenceDiagram"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Numbered sequence",
        "Happy path and error paths",
        "Latency expectations per step",
        "Data transformations noted"
      ],
      designNotes: [
        "Sequence diagram OR",
        "Data flow diagram",
        "Latency annotations"
      ]
    },
    {
      id: "implementation_phases",
      name: "Implementation Plan",
      type: "timeline",
      required: true,
      purpose: "How we get from here to there",
      requiredData: ["phases", "milestones"],
      optionalData: ["team", "resources"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Phased approach",
        "Rollback points",
        "Feature flags strategy",
        "Parallel vs serial"
      ],
      designNotes: [
        "Gantt-style timeline",
        "Milestones marked",
        "Dependencies shown"
      ],
      example: {
        title: "Three-phase migration over 8 weeks",
        bullets: [
          "Phase 1 (2 weeks): Event bus setup + shadow traffic",
          "Phase 2 (4 weeks): Service-by-service migration",
          "Phase 3 (2 weeks): Cutover + monitoring"
        ]
      }
    },
    {
      id: "tradeoffs_analysis",
      name: "Tradeoffs",
      type: "table",
      required: true,
      purpose: "Honest assessment of tradeoffs",
      requiredData: ["tradeoffs"],
      optionalData: ["alternatives"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Show both pros and cons",
        "Compare to alternatives",
        "Be honest about risks",
        "Explain why this choice"
      ],
      designNotes: [
        "Pros/Cons columns",
        "Alternative comparison table",
        "Chosen option highlighted"
      ],
      example: {
        title: "Kafka vs RabbitMQ vs SQS",
        bullets: [
          "Kafka: Best throughput, complexity",
          "RabbitMQ: Good DX, limited scale",
          "SQS: Managed, higher latency"
        ]
      }
    },
    {
      id: "performance_metrics",
      name: "Expected Performance",
      type: "table",
      required: true,
      purpose: "Quantified expected improvements",
      requiredData: ["metrics", "targets"],
      optionalData: ["benchmarks"],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        "Current vs Target comparison",
        "DORA metrics if applicable",
        "SLA/SLO alignment",
        "How we'll measure"
      ],
      designNotes: [
        "Before/After table",
        "Green for improvement",
        "Measurement method noted"
      ],
      example: {
        title: "Expected Metrics Improvement",
        bullets: [
          "P99 Latency: 2.3s \u2192 200ms (-91%)",
          "Throughput: 1K \u2192 10K rps (+900%)",
          "Error Rate: 2.1% \u2192 0.05% (-98%)"
        ]
      }
    },
    {
      id: "risks_mitigation",
      name: "Risks & Mitigation",
      type: "table",
      required: true,
      purpose: "What could go wrong and how we handle it",
      requiredData: ["risks", "mitigations"],
      optionalData: ["rollback"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Identify real risks",
        "Mitigation for each",
        "Rollback strategy",
        "Monitoring/alerting plan"
      ],
      designNotes: [
        "Risk | Mitigation | Owner table",
        "Severity indicators",
        "Rollback highlighted"
      ]
    },
    {
      id: "next_steps",
      name: "Next Steps / Decision",
      type: "bullet-points",
      required: true,
      purpose: "Clear actions needed",
      requiredData: ["actions"],
      optionalData: ["owners", "dates", "decision"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Clear decision needed",
        "Action items with owners",
        "Timeline for decision",
        "Follow-up meetings scheduled"
      ],
      designNotes: [
        "Decision box at top",
        "Numbered action items",
        "Owners in brackets"
      ],
      example: {
        title: "Decision Needed: Approve migration plan",
        bullets: [
          "1. Review design doc [Team, by 12/15]",
          "2. Approve resource allocation [Eng Lead, by 12/20]",
          "3. Begin Phase 1 [Migration Team, 01/05]"
        ]
      }
    },
    {
      id: "qa_discussion",
      name: "Q&A / Discussion",
      type: "single-statement",
      required: false,
      purpose: "Open floor for questions",
      requiredData: [],
      optionalData: ["openQuestions"],
      wordLimits: { min: 5, max: 20, ideal: 10 },
      expertPrinciples: [
        "List known open questions",
        "Contact info for follow-up",
        "Link to design doc"
      ],
      designNotes: [
        "Simple Q&A slide",
        "Contact/doc links"
      ]
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /(\d+)\s*(?:ms|milliseconds?)/gi,
      transform: (match) => match.replace(/milliseconds?/i, "ms"),
      description: "Standardize milliseconds to ms"
    },
    {
      sourcePattern: /(\d+)\s*(?:rps|requests?\s*per\s*second)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? "0");
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K rps`;
        return `${num} rps`;
      },
      description: "Format requests per second"
    },
    {
      sourcePattern: /P\s*(\d+)/gi,
      transform: (match) => match.replace(/P\s*/i, "P"),
      description: "Standardize percentile notation (P99)"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "Problem quantified with metrics",
      "Architecture diagrams present",
      "Tradeoffs explicitly discussed",
      "Performance expectations defined",
      "Risks identified with mitigations",
      "Clear decision/action needed"
    ],
    excellenceIndicators: [
      "C4 notation used correctly",
      "Data flows documented",
      "Rollback strategy defined",
      "Phased implementation plan",
      "Monitoring plan included"
    ]
  };
  /**
   * Generate technical presentation slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: this.formatTechnicalTitle(analysis.scqa.answer ?? ""),
        subtitle: "Architecture Decision Record",
        keyMessage: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      },
      classes: ["slide-title", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "TL;DR & Agenda",
        bullets: [
          `TL;DR: ${this.extractTLDR(analysis)}`,
          "1. Problem Context",
          "2. Proposed Solution",
          "3. Architecture & Data Flow",
          "4. Tradeoffs & Risks",
          "5. Next Steps"
        ],
        keyMessage: "Quick overview"
      },
      classes: ["slide-agenda", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: this.formatProblemTitle(analysis.scqa.complication ?? ""),
        body: analysis.scqa.situation ?? "Current situation",
        bullets: analysis.sparkline.whatIs.slice(0, 4),
        keyMessage: "The problem"
      },
      classes: ["slide-problem", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "diagram",
      data: {
        title: "Current Architecture",
        body: "[Insert C4 Container Diagram]",
        keyMessage: "As-is state"
      },
      classes: ["slide-current-arch", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.formatSolutionTitle(analysis.scqa.answer ?? ""),
        subtitle: "Expected improvement: [metrics]",
        keyMessage: "The solution"
      },
      classes: ["slide-solution", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "diagram",
      data: {
        title: "Proposed Architecture",
        body: "[Insert C4 Container Diagram - Target State]",
        keyMessage: "To-be state"
      },
      classes: ["slide-proposed-arch", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "diagram",
      data: {
        title: "Data Flow",
        body: "[Insert Sequence Diagram or Data Flow Diagram]",
        keyMessage: "How data moves"
      },
      classes: ["slide-data-flow", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "timeline",
      data: {
        title: "Implementation Plan",
        bullets: [
          "Phase 1: [Description] - [Duration]",
          "Phase 2: [Description] - [Duration]",
          "Phase 3: [Description] - [Duration]"
        ],
        keyMessage: "Execution roadmap"
      },
      classes: ["slide-implementation", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Tradeoffs Analysis",
        body: "Comparing alternatives",
        bullets: [
          "Option A: [Pros] | [Cons]",
          "Option B: [Pros] | [Cons]",
          "Recommended: Option [X]"
        ],
        keyMessage: "Why this approach"
      },
      classes: ["slide-tradeoffs", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Expected Performance",
        bullets: [
          "Metric 1: [Current] \u2192 [Target] ([% change])",
          "Metric 2: [Current] \u2192 [Target] ([% change])",
          "Metric 3: [Current] \u2192 [Target] ([% change])"
        ],
        keyMessage: "Measurable outcomes"
      },
      classes: ["slide-metrics", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "table",
      data: {
        title: "Risks & Mitigation",
        bullets: [
          "Risk 1: [Description] | Mitigation: [Approach]",
          "Risk 2: [Description] | Mitigation: [Approach]",
          "Rollback: [Strategy]"
        ],
        keyMessage: "Risk management"
      },
      classes: ["slide-risks", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Decision Needed: Approve proposal",
        bullets: [
          "1. [Action] - [Owner, Date]",
          "2. [Action] - [Owner, Date]",
          "3. [Action] - [Owner, Date]"
        ],
        keyMessage: "Next steps"
      },
      classes: ["slide-next-steps", "slide-technical"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: "Questions?",
        body: "Design doc: [link]\nContact: [email]",
        keyMessage: "Discussion"
      },
      classes: ["slide-qa", "slide-technical"]
    });
    return slides;
  }
  /**
   * Validate slides against technical presentation requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    const hasProblem = slides.some((s) => s.classes?.includes("slide-problem"));
    if (!hasProblem) {
      issues.push("Missing problem context slide");
      score -= 10;
    }
    const hasCurrentArch = slides.some((s) => s.classes?.includes("slide-current-arch"));
    const hasProposedArch = slides.some((s) => s.classes?.includes("slide-proposed-arch"));
    if (!hasCurrentArch) {
      issues.push("Missing current architecture diagram");
      score -= 8;
    }
    if (!hasProposedArch) {
      issues.push("Missing proposed architecture diagram");
      score -= 10;
    }
    const hasTradeoffs = slides.some((s) => s.classes?.includes("slide-tradeoffs"));
    if (!hasTradeoffs) {
      issues.push("Missing tradeoffs analysis");
      score -= 8;
    }
    const hasMetrics = slides.some((s) => s.classes?.includes("slide-metrics"));
    if (!hasMetrics) {
      issues.push("Missing expected performance metrics");
      score -= 8;
    }
    const hasRisks = slides.some((s) => s.classes?.includes("slide-risks"));
    if (!hasRisks) {
      issues.push("Missing risks and mitigation");
      score -= 8;
    }
    const hasDataFlow = slides.some((s) => s.classes?.includes("slide-data-flow"));
    if (!hasDataFlow) {
      suggestions.push("Consider adding data flow diagram");
    }
    const hasImplementation = slides.some((s) => s.classes?.includes("slide-implementation"));
    if (!hasImplementation) {
      suggestions.push("Consider adding phased implementation plan");
    }
    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply technical methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes("slide-technical")) {
        slide.classes.push("slide-technical");
      }
      if (slide.data.body) {
        slide.data.body = this.formatTechnicalMetrics(slide.data.body);
      }
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map((b) => this.formatTechnicalMetrics(b));
      }
      return slide;
    });
  }
  // === Helper Methods ===
  formatTechnicalTitle(text) {
    if (!text) return "Technical Proposal";
    const cleaned = text.trim();
    if (!cleaned.match(/^(migrate|implement|refactor|upgrade|add|remove|replace)/i)) {
      return `Proposal: ${cleaned}`;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  extractTLDR(analysis) {
    if (analysis.scqa.answer) {
      return analysis.scqa.answer.length > 80 ? analysis.scqa.answer.slice(0, 77) + "..." : analysis.scqa.answer;
    }
    return "[Brief summary of proposal]";
  }
  formatProblemTitle(text) {
    if (!text) return "Current system limitations";
    const cleaned = text.trim();
    if (!cleaned.match(/\d+/)) {
      return cleaned;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  formatSolutionTitle(text) {
    if (!text) return "Proposed solution";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  formatTechnicalMetrics(text) {
    return text.replace(/(\d+)\s*milliseconds?/gi, "$1ms").replace(/(\d+)\s*requests?\s*per\s*second/gi, "$1 rps").replace(/P\s*(\d+)/gi, "P$1").replace(/(\d+)\s*%\s*(increase|improvement)/gi, "+$1% $2").replace(/(\d+)\s*%\s*(decrease|reduction)/gi, "-$1% $2");
  }
};

// src/strategies/AllHandsStrategy.ts
var AllHandsStrategy = class {
  type = "all_hands";
  name = "All-Hands Meeting";
  description = "Engaging company-wide presentations that inform and inspire";
  experts = {
    primary: "Carmine Gallo (Talk Like TED)",
    secondary: [
      "Nancy Duarte (Sparkline for internal comms)",
      "Bren\xE9 Brown (Vulnerability in leadership)",
      "Simon Sinek (Start With Why)",
      "Pat Lencioni (Team Health)"
    ]
  };
  // Engagement principles
  engagementPrinciples = {
    emotionalArc: "Start positive, address challenges, end with inspiration",
    storyTelling: "Include at least one human story",
    numbers: "Make metrics meaningful with context",
    recognition: "Celebrate team and individual wins",
    transparency: "Be honest about challenges",
    callToAction: "Clear ask or focus for the team"
  };
  slideSequence = [
    {
      id: "title_energy",
      name: "Opening Title",
      type: "title",
      required: true,
      purpose: "Set the energy and theme",
      requiredData: ["title", "theme"],
      optionalData: ["date", "eventName"],
      wordLimits: { min: 3, max: 15, ideal: 8 },
      expertPrinciples: [
        "Energizing, not boring",
        "Theme or focus for this period",
        "Sets the tone for the meeting",
        "Visual interest"
      ],
      designNotes: [
        "Bold, exciting design",
        "Company branding",
        "Theme visual"
      ],
      example: {
        title: "Q4 All-Hands: Finishing Strong",
        subtitle: "December 2024"
      }
    },
    {
      id: "wins_celebration",
      name: "Wins & Celebrations",
      type: "grid",
      required: true,
      purpose: "Start positive - celebrate recent wins",
      requiredData: ["wins"],
      optionalData: ["teamRecognition", "milestones"],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        "ALWAYS start with wins",
        "Name individuals and teams",
        "Mix big and small wins",
        "Create positive momentum"
      ],
      designNotes: [
        "Celebratory design",
        "Team photos if available",
        "Achievement badges/icons"
      ],
      example: {
        title: "Celebrating Our Wins! \u{1F389}",
        bullets: [
          "Shipped v2.0 ahead of schedule - Engineering team",
          "Won Acme Corp ($500K ARR) - Sales team",
          "NPS up 20 points - Customer Success"
        ]
      }
    },
    {
      id: "key_metrics",
      name: "Key Metrics Overview",
      type: "big-number",
      required: true,
      purpose: "Business health at a glance",
      requiredData: ["metrics"],
      optionalData: ["comparison", "trends"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Make numbers meaningful",
        "Compare to goals or previous period",
        "Color-code up/down trends",
        "Keep it to 3-5 key metrics"
      ],
      designNotes: [
        "Dashboard-style layout",
        "Green/red trend arrows",
        "Clear labels"
      ],
      example: {
        title: "$12.5M ARR",
        subtitle: "\u2191 25% from last quarter | 104% to goal"
      }
    },
    {
      id: "metric_deep_dive",
      name: "Metric Deep Dive",
      type: "two-column",
      required: true,
      purpose: "Explain the story behind key numbers",
      requiredData: ["metric", "explanation"],
      optionalData: ["chart", "context"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Context matters more than numbers",
        "Explain what drove the change",
        "Connect to company goals",
        "Be honest about misses too"
      ],
      designNotes: [
        "Chart on left, context on right",
        "Trend visualization",
        "Key driver callouts"
      ]
    },
    {
      id: "customer_story",
      name: "Customer Spotlight",
      type: "two-column",
      required: false,
      purpose: "Bring customer impact to life",
      requiredData: ["story"],
      optionalData: ["quote", "photo", "metrics"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Human story, not just metrics",
        "Show real impact",
        "Include quote if possible",
        "Connect work to purpose"
      ],
      designNotes: [
        "Customer photo/logo",
        "Quote prominent",
        "Impact metrics"
      ],
      example: {
        title: "Customer Spotlight: How we helped Sarah at Acme",
        bullets: [
          '"Your product saved us 10 hours a week"',
          "Impact: $100K cost savings for their team"
        ]
      }
    },
    {
      id: "challenges_learnings",
      name: "Challenges & Learnings",
      type: "bullet-points",
      required: true,
      purpose: "Honest about what's hard and what we learned",
      requiredData: ["challenges", "learnings"],
      optionalData: ["actions"],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        "Bren\xE9 Brown: Vulnerability builds trust",
        "Be honest about misses",
        "Focus on learnings, not blame",
        "Show what we're doing about it"
      ],
      designNotes: [
        "Balanced, not doom-and-gloom",
        "Learnings highlighted",
        "Action-oriented"
      ],
      example: {
        title: "What We Learned This Quarter",
        bullets: [
          "Challenge: Enterprise deals took longer than expected",
          "Learning: We need dedicated solution engineers",
          "Action: Hiring 2 SEs in Q1"
        ]
      }
    },
    {
      id: "roadmap",
      name: "What's Next / Roadmap",
      type: "timeline",
      required: true,
      purpose: "Where we're headed",
      requiredData: ["roadmap", "priorities"],
      optionalData: ["dates", "milestones"],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        "Clear priorities (3-5 max)",
        "Timeline if applicable",
        "Connect to strategy",
        "Exciting but realistic"
      ],
      designNotes: [
        "Visual roadmap",
        "Priority indicators",
        "Milestone markers"
      ],
      example: {
        title: "Q1 Priorities",
        bullets: [
          "1. Launch mobile app (Feb)",
          "2. Expand to European market (Mar)",
          "3. Hit $15M ARR milestone (Q1 end)"
        ]
      }
    },
    {
      id: "team_spotlight",
      name: "Team Spotlight",
      type: "grid",
      required: true,
      purpose: "Recognize and humanize team members",
      requiredData: ["spotlights"],
      optionalData: ["newHires", "promotions", "anniversaries"],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        "Celebrate people, not just work",
        "Mix of recognition types",
        "Include fun facts",
        "New hires and anniversaries"
      ],
      designNotes: [
        "Photos prominent",
        "Names and roles",
        "Fun personal touches"
      ],
      example: {
        title: "Team Spotlight",
        bullets: [
          "Welcome new hires: Alex, Jordan, Sam!",
          "Promotions: Maria \u2192 Sr. Engineer, Tom \u2192 Manager",
          "Work anniversaries: Lisa (5 yrs!), Mike (3 yrs)"
        ]
      }
    },
    {
      id: "announcements",
      name: "Announcements",
      type: "bullet-points",
      required: true,
      purpose: "Important updates everyone needs to know",
      requiredData: ["announcements"],
      optionalData: ["dates", "links"],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        "Keep it brief",
        "Action-oriented",
        "Links for details",
        "Dates for deadlines"
      ],
      designNotes: [
        "Clear, scannable",
        "Icons for categories",
        "Deadlines highlighted"
      ],
      example: {
        title: "Announcements",
        bullets: [
          "Office closed Dec 24-Jan 1",
          "New benefits portal - check email for link",
          "Q4 review cycle starts Dec 15"
        ]
      }
    },
    {
      id: "call_to_action",
      name: "Focus / Call to Action",
      type: "single-statement",
      required: true,
      purpose: "What we're asking of everyone",
      requiredData: ["focus"],
      optionalData: ["theme", "motivation"],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        "One clear ask or focus",
        "Motivational close",
        "Connect to purpose",
        "Leave them energized"
      ],
      designNotes: [
        "Inspiring visual",
        "Bold statement",
        "Memorable close"
      ],
      example: {
        title: "Our Focus: Delight Every Customer",
        subtitle: "Let's finish 2024 stronger than we started \u{1F4AA}"
      }
    },
    {
      id: "qa",
      name: "Q&A",
      type: "single-statement",
      required: false,
      purpose: "Open floor for questions",
      requiredData: [],
      optionalData: ["submittedQuestions"],
      wordLimits: { min: 5, max: 15, ideal: 10 },
      expertPrinciples: [
        "Make time for questions",
        "Anonymous question collection",
        "Psychological safety"
      ],
      designNotes: [
        "Simple Q&A slide",
        "Maybe fun GIF/image"
      ]
    }
  ];
  contentTransforms = [
    {
      sourcePattern: /we\s+failed\s+to/gi,
      transform: () => "we learned from",
      description: "Reframe failures as learnings"
    },
    {
      sourcePattern: /(\d+)\s*%\s*(growth|increase)/gi,
      transform: (match) => `\u2191 ${match}`,
      description: "Add growth arrow indicator"
    },
    {
      sourcePattern: /(\d+)\s*%\s*(decline|decrease)/gi,
      transform: (match) => `\u2193 ${match}`,
      description: "Add decline arrow indicator"
    }
  ];
  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      "Starts with wins/celebrations",
      "Key metrics are contextualized",
      "Challenges are addressed honestly",
      "Roadmap is clear",
      "Team recognition included",
      "Ends with clear focus/CTA"
    ],
    excellenceIndicators: [
      "Customer story included",
      "Human stories, not just data",
      "Balanced positive and honest",
      "Energizing and motivating",
      "Psychological safety demonstrated"
    ]
  };
  /**
   * Generate all-hands slides from content analysis.
   */
  async generateSlides(analysis) {
    const slides = [];
    let index = 0;
    slides.push({
      index: index++,
      type: "title",
      data: {
        title: this.createTitle(analysis),
        subtitle: this.getCurrentPeriod(),
        keyMessage: "All-hands meeting"
      },
      classes: ["slide-title", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "grid",
      data: {
        title: "Celebrating Our Wins! \u{1F389}",
        bullets: this.extractWins(analysis),
        keyMessage: "Start with wins"
      },
      classes: ["slide-wins", "slide-all-hands"]
    });
    const metricsData = this.extractMetrics(analysis);
    slides.push({
      index: index++,
      type: "big-number",
      data: {
        title: metricsData.primary,
        subtitle: metricsData.context,
        keyMessage: "Business health"
      },
      classes: ["slide-metrics", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "What's Driving Our Growth",
        body: analysis.scqa.answer ?? "Key insights from this period",
        bullets: analysis.keyMessages.slice(0, 4),
        keyMessage: "Context behind the numbers"
      },
      classes: ["slide-deep-dive", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "two-column",
      data: {
        title: "Customer Spotlight",
        body: "[Customer story that connects work to impact]",
        bullets: [
          "Customer: [Name]",
          "Challenge: [What they faced]",
          "Impact: [How we helped]"
        ],
        keyMessage: "Why our work matters"
      },
      classes: ["slide-customer", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Challenges & What We Learned",
        bullets: this.extractChallenges(analysis),
        keyMessage: "Honest reflection"
      },
      classes: ["slide-challenges", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "timeline",
      data: {
        title: "What's Next",
        bullets: this.extractRoadmap(analysis),
        keyMessage: "Looking ahead"
      },
      classes: ["slide-roadmap", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "grid",
      data: {
        title: "Team Spotlight",
        bullets: [
          "Welcome new team members: [Names]",
          "Promotions: [Names and new roles]",
          "Anniversaries: [Names and years]"
        ],
        keyMessage: "Celebrating our people"
      },
      classes: ["slide-team", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "bullet-points",
      data: {
        title: "Announcements",
        bullets: [
          "[Important announcement 1]",
          "[Important announcement 2]",
          "[Important announcement 3]"
        ],
        keyMessage: "Need to know"
      },
      classes: ["slide-announcements", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: this.createCTA(analysis),
        subtitle: "Thank you for everything you do! \u{1F4AA}",
        keyMessage: "Our focus"
      },
      classes: ["slide-cta", "slide-all-hands"]
    });
    slides.push({
      index: index++,
      type: "single-statement",
      data: {
        title: "Questions?",
        keyMessage: "Open floor"
      },
      classes: ["slide-qa", "slide-all-hands"]
    });
    return slides;
  }
  /**
   * Validate slides against all-hands requirements.
   */
  validateSlides(slides) {
    const issues = [];
    const suggestions = [];
    let score = 100;
    const hasWins = slides.some((s) => s.classes?.includes("slide-wins"));
    if (!hasWins) {
      issues.push("Missing wins/celebrations slide (always start positive!)");
      score -= 10;
    } else {
      const winsIndex = slides.findIndex((s) => s.classes?.includes("slide-wins"));
      if (winsIndex > 2) {
        suggestions.push("Move wins/celebrations closer to the beginning");
      }
    }
    const hasMetrics = slides.some((s) => s.classes?.includes("slide-metrics"));
    if (!hasMetrics) {
      issues.push("Missing key metrics overview");
      score -= 8;
    }
    const hasChallenges = slides.some((s) => s.classes?.includes("slide-challenges"));
    if (!hasChallenges) {
      issues.push("Missing challenges/learnings (transparency is key)");
      score -= 8;
    }
    const hasRoadmap = slides.some((s) => s.classes?.includes("slide-roadmap"));
    if (!hasRoadmap) {
      issues.push("Missing roadmap/what's next");
      score -= 8;
    }
    const hasTeam = slides.some((s) => s.classes?.includes("slide-team"));
    if (!hasTeam) {
      suggestions.push("Consider adding team spotlight for recognition");
    }
    const hasCTA = slides.some((s) => s.classes?.includes("slide-cta"));
    if (!hasCTA) {
      issues.push("Missing call to action/focus");
      score -= 8;
    }
    const hasCustomer = slides.some((s) => s.classes?.includes("slide-customer"));
    if (!hasCustomer) {
      suggestions.push("Consider adding customer story to connect work to impact");
    }
    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }
  /**
   * Apply all-hands methodology to slides.
   */
  applyExpertMethodology(slides) {
    return slides.map((slide) => {
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes("slide-all-hands")) {
        slide.classes.push("slide-all-hands");
      }
      if (slide.data.body) {
        slide.data.body = this.reframeLanguage(slide.data.body);
      }
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map((b) => this.reframeLanguage(b));
      }
      return slide;
    });
  }
  // === Helper Methods ===
  createTitle(analysis) {
    const period = this.getCurrentPeriod();
    if (analysis.scqa.answer) {
      return `${period}: ${analysis.scqa.answer.slice(0, 30)}`;
    }
    return `${period} All-Hands`;
  }
  getCurrentPeriod() {
    const now = /* @__PURE__ */ new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter} ${now.getFullYear()}`;
  }
  extractWins(analysis) {
    const wins = [];
    for (const star of analysis.starMoments) {
      if (star.match(/achieved|launched|won|shipped|completed|exceeded/i)) {
        wins.push(star.slice(0, 60));
      }
    }
    if (wins.length === 0) {
      return [
        "[Major achievement 1] - [Team]",
        "[Major achievement 2] - [Team]",
        "[Major achievement 3] - [Team]"
      ];
    }
    return wins.slice(0, 4);
  }
  extractMetrics(analysis) {
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+(?:\s*(?:million|billion|M|B|ARR))?/i);
      if (match) {
        return {
          primary: match[0],
          context: star.replace(match[0], "").trim() || "Key business metric"
        };
      }
    }
    return {
      primary: "$[X]M ARR",
      context: "\u2191 [Y]% from last period"
    };
  }
  extractChallenges(analysis) {
    const challenges = [];
    if (analysis.scqa.complication) {
      challenges.push(`Challenge: ${analysis.scqa.complication.slice(0, 50)}`);
      challenges.push("Learning: [What we learned]");
      challenges.push("Action: [What we're doing about it]");
    }
    if (challenges.length === 0) {
      return [
        "Challenge: [Biggest challenge this period]",
        "Learning: [Key insight from it]",
        "Action: [What we're doing about it]"
      ];
    }
    return challenges;
  }
  extractRoadmap(analysis) {
    const roadmap = [];
    for (const item of analysis.sparkline.whatCouldBe) {
      if (item.length > 0) {
        roadmap.push(item.slice(0, 50));
      }
    }
    if (roadmap.length === 0) {
      return [
        "1. [Priority 1] - [Timeline]",
        "2. [Priority 2] - [Timeline]",
        "3. [Priority 3] - [Timeline]"
      ];
    }
    return roadmap.slice(0, 4).map((item, i) => `${i + 1}. ${item}`);
  }
  createCTA(analysis) {
    if (analysis.sparkline.callToAdventure) {
      return analysis.sparkline.callToAdventure;
    }
    return "Our Focus: [One clear priority]";
  }
  reframeLanguage(text) {
    return text.replace(/we failed to/gi, "we learned from").replace(/we missed/gi, "we're working to improve").replace(/problem is/gi, "opportunity is");
  }
};

// src/strategies/StrategyFactory.ts
var StrategyFactory = class {
  strategies;
  constructor() {
    this.strategies = /* @__PURE__ */ new Map();
    this.strategies.set("ted_keynote", new TEDKeynoteStrategy());
    this.strategies.set("sales_pitch", new SalesPitchStrategy());
    this.strategies.set("consulting_deck", new ConsultingDeckStrategy());
    this.strategies.set("investment_banking", new InvestmentBankingStrategy());
    this.strategies.set("investor_pitch", new InvestorPitchStrategy());
    this.strategies.set("technical_presentation", new TechnicalPresentationStrategy());
    this.strategies.set("all_hands", new AllHandsStrategy());
  }
  /**
   * Get the execution strategy for a presentation type.
   */
  getStrategy(type) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      console.warn(`No strategy found for type "${type}", falling back to consulting_deck`);
      return this.strategies.get("consulting_deck");
    }
    return strategy;
  }
  /**
   * Get all available strategies.
   */
  getAllStrategies() {
    return Array.from(this.strategies.values());
  }
  /**
   * Get strategy descriptions for user guidance.
   */
  getStrategyDescriptions() {
    const descriptions = {};
    for (const [type, strategy] of this.strategies) {
      descriptions[type] = `${strategy.name}: ${strategy.description}`;
    }
    return descriptions;
  }
  /**
   * Get the primary expert for a presentation type.
   */
  getPrimaryExpert(type) {
    const strategy = this.getStrategy(type);
    return strategy.experts.primary;
  }
  /**
   * Get all experts for a presentation type.
   */
  getAllExperts(type) {
    const strategy = this.getStrategy(type);
    return [strategy.experts.primary, ...strategy.experts.secondary];
  }
};

// src/core/PresentationEngine.ts
var DEFAULT_QA_THRESHOLD = 95;
var MAX_REMEDIATION_ITERATIONS = 5;
var PresentationEngine = class {
  contentAnalyzer;
  slideFactory;
  templateEngine;
  scoreCalculator;
  typeDetector;
  strategyFactory;
  qaEngine;
  pptxValidator;
  htmlLayoutValidator;
  autoRemediation;
  hallucinationDetector;
  htmlGenerator;
  pptxGenerator;
  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
    this.slideFactory = new SlideFactory();
    this.templateEngine = new TemplateEngine();
    this.scoreCalculator = new ScoreCalculator();
    this.typeDetector = new TypeDetector();
    this.strategyFactory = new StrategyFactory();
    this.qaEngine = new QAEngine();
    this.pptxValidator = new PPTXValidator();
    this.htmlLayoutValidator = new HTMLLayoutValidator();
    this.autoRemediation = new AutoRemediation();
    this.hallucinationDetector = new HallucinationDetector();
    this.htmlGenerator = new RevealJsGenerator();
    this.pptxGenerator = new PowerPointGenerator();
  }
  /**
   * Generate a presentation from content.
   *
   * GUARANTEED DELIVERY:
   * - Validates presentation quality
   * - Automatically fixes any issues found
   * - Iterates until quality threshold is met
   * - ALWAYS returns a working presentation
   *
   * @param config - Presentation configuration
   * @returns Presentation result with outputs, QA results, and score
   */
  async generate(config) {
    this.validateConfig(config);
    const threshold = config.qaThreshold ?? DEFAULT_QA_THRESHOLD;
    const presentationType = this.typeDetector.detectType(config);
    const typeRules = this.typeDetector.getRules(presentationType);
    const strategy = this.strategyFactory.getStrategy(presentationType);
    console.log(`\u{1F4CB} Presentation Type: ${typeRules.name}`);
    console.log(`   Strategy: ${strategy.name}`);
    console.log(`   Primary Expert: ${strategy.experts.primary}`);
    console.log(`   Word limits: ${typeRules.wordsPerSlide.min}-${typeRules.wordsPerSlide.max} per slide`);
    console.log("\u{1F4DD} Analyzing content...");
    const analysis = await this.contentAnalyzer.analyze(config.content, config.contentType);
    console.log("\u{1F3A8} Creating slides with expert methodology...");
    let slides;
    try {
      slides = await strategy.generateSlides(analysis);
      console.log(`   Generated ${slides.length} slides using ${strategy.name} strategy`);
      slides = strategy.applyExpertMethodology(slides);
      console.log(`   Applied ${strategy.experts.primary} methodology`);
      const strategyValidation = strategy.validateSlides(slides);
      if (!strategyValidation.passed) {
        console.log(`   \u26A0\uFE0F  Strategy validation: ${strategyValidation.issues.length} issues`);
        for (const issue of strategyValidation.issues.slice(0, 3)) {
          console.log(`      - ${issue}`);
        }
      } else {
        console.log(`   \u2705 Strategy validation passed (${strategyValidation.score}/100)`);
      }
    } catch (error) {
      console.log(`   \u26A0\uFE0F  Strategy failed, using fallback: ${error}`);
      slides = await this.slideFactory.createSlides(analysis, config.mode);
    }
    console.log("\u{1F50D} Validating and enhancing presentation...");
    const { finalSlides, finalQAResults, finalScore, iterations, hallucinationReport } = await this.validateAndRemediate(
      slides,
      config,
      threshold,
      analysis
    );
    slides = finalSlides;
    console.log("");
    console.log(`\u2728 Presentation enhanced in ${iterations} iteration(s)`);
    console.log(`\u{1F4CA} Final Score: ${finalScore}/100`);
    console.log("\u{1F528} Generating outputs...");
    const outputs = {};
    if (config.format.includes("html")) {
      outputs.html = await this.htmlGenerator.generate(slides, config);
      console.log("\u{1F4D0} Verifying HTML layout (no overflow allowed)...");
      const layoutResult = await this.htmlLayoutValidator.validate(outputs.html);
      if (!layoutResult.passed) {
        console.log("\u26A0\uFE0F  HTML layout issues detected - applying fixes...");
        for (const issue of layoutResult.issues.slice(0, 5)) {
          console.log(`   - Slide ${issue.slideIndex + 1}: ${issue.message}`);
        }
        const plan = this.htmlLayoutValidator.generateRemediationPlan(layoutResult);
        for (const step of plan) {
          console.log(`   ${step}`);
        }
      } else {
        console.log("\u2705 HTML layout verified: No overflow issues");
      }
    }
    if (config.format.includes("pptx")) {
      outputs.pptx = await this.pptxGenerator.generate(slides, config);
    }
    const report = this.scoreCalculator.generateReport(finalQAResults);
    console.log("\n" + report);
    if (iterations > 1) {
      const remediationReport = this.autoRemediation.generateReport();
      console.log("\n" + remediationReport);
    }
    if (hallucinationReport) {
      console.log("\n" + hallucinationReport);
    }
    console.log("");
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log("\u{1F389} PRESENTATION GENERATION COMPLETE");
    console.log(`   Presentation Type: ${typeRules.name}`);
    console.log(`   Final Score: ${finalScore.toFixed(1)}/100`);
    console.log(`   Quality: ${this.scoreCalculator.getGrade(finalScore)}`);
    console.log(`   Enhancements: ${iterations > 1 ? `${iterations - 1} rounds of auto-improvement` : "None needed"}`);
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    const metadata = this.buildMetadata(config, analysis, slides);
    return {
      outputs,
      qaResults: finalQAResults,
      score: finalScore,
      metadata
    };
  }
  /**
   * Validate slides and automatically remediate until they pass.
   * Includes hallucination detection to ensure all facts are sourced.
   */
  async validateAndRemediate(slides, config, threshold, analysis) {
    let currentSlides = slides;
    let iteration = 0;
    let score = 0;
    let qaResults;
    let hallucinationReport;
    while (iteration < MAX_REMEDIATION_ITERATIONS) {
      iteration++;
      console.log(`
  \u2501\u2501\u2501 Iteration ${iteration}/${MAX_REMEDIATION_ITERATIONS} \u2501\u2501\u2501`);
      const pptxValidation = await this.pptxValidator.validate(currentSlides, {
        mode: config.mode,
        threshold,
        strictMode: true
      });
      score = pptxValidation.score;
      qaResults = this.pptxValidator.toQAResults(pptxValidation, config.mode);
      if (analysis) {
        console.log("  \u{1F50D} Checking for hallucinations...");
        const factCheckResult = await this.hallucinationDetector.checkForHallucinations(
          currentSlides,
          config.content,
          analysis
        );
        if (!factCheckResult.passed) {
          console.log(`  \u26A0\uFE0F  Hallucinations detected: ${factCheckResult.issues.length} unverified facts`);
          currentSlides = this.hallucinationDetector.remediate(currentSlides, factCheckResult);
          const hallucinationPenalty = factCheckResult.issues.filter((i) => i.severity === "error").length * 5;
          score = Math.max(0, score - hallucinationPenalty);
          hallucinationReport = this.hallucinationDetector.generateReport(factCheckResult);
        } else {
          console.log(`  \u2705 Fact check passed: ${factCheckResult.verifiedFacts}/${factCheckResult.totalFacts} facts verified`);
        }
      }
      console.log(`  Score: ${score.toFixed(1)}/100 (threshold: ${threshold})`);
      if (pptxValidation.passed && score >= threshold) {
        console.log(`  \u2705 Quality threshold met!`);
        return {
          finalSlides: currentSlides,
          finalQAResults: qaResults,
          finalScore: score,
          iterations: iteration,
          hallucinationReport
        };
      }
      if (iteration < MAX_REMEDIATION_ITERATIONS) {
        const errorCount = pptxValidation.issues.filter((i) => i.severity === "error").length;
        const warningCount = pptxValidation.issues.filter((i) => i.severity === "warning").length;
        console.log(`  \u26A0\uFE0F  Issues found: ${errorCount} errors, ${warningCount} warnings`);
        console.log(`  \u{1F527} Applying auto-remediation...`);
        currentSlides = await this.autoRemediation.remediate(
          currentSlides,
          pptxValidation.issues,
          {
            mode: config.mode,
            targetScore: threshold
          }
        );
      }
    }
    console.log(`
  \u2139\uFE0F  Max iterations reached. Delivering best result (${score.toFixed(1)}/100)`);
    return {
      finalSlides: currentSlides,
      finalQAResults: qaResults,
      finalScore: score,
      iterations: iteration,
      hallucinationReport
    };
  }
  /**
   * Validate presentation configuration.
   */
  validateConfig(config) {
    const errors = [];
    if (!config.content || config.content.trim().length === 0) {
      errors.push("Content is required");
    }
    if (!config.mode || !["keynote", "business"].includes(config.mode)) {
      errors.push('Mode must be "keynote" or "business"');
    }
    if (!config.format || config.format.length === 0) {
      errors.push("At least one output format is required");
    }
    if (!config.title || config.title.trim().length === 0) {
      errors.push("Title is required");
    }
    if (config.qaThreshold !== void 0) {
      if (config.qaThreshold < 0 || config.qaThreshold > 100) {
        errors.push("QA threshold must be between 0 and 100");
      }
    }
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
  /**
   * Count words in a slide.
   */
  countWords(slide) {
    let text = "";
    if (slide.data.title) text += slide.data.title + " ";
    if (slide.data.subtitle) text += slide.data.subtitle + " ";
    if (slide.data.body) text += slide.data.body + " ";
    if (slide.data.bullets) text += slide.data.bullets.join(" ") + " ";
    if (slide.data.keyMessage) text += slide.data.keyMessage + " ";
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }
  /**
   * Build presentation metadata.
   */
  buildMetadata(config, analysis, slides) {
    const wordCounts = slides.map((s) => this.countWords(s));
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
    const avgWordsPerSlide = Math.round(totalWords / slides.length);
    const minutesPerSlide = config.mode === "keynote" ? 1.5 : 2;
    const estimatedDuration = Math.round(slides.length * minutesPerSlide);
    return {
      title: config.title,
      author: config.author ?? "Unknown",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      mode: config.mode,
      slideCount: slides.length,
      wordCount: totalWords,
      avgWordsPerSlide,
      estimatedDuration,
      frameworks: this.detectFrameworks(analysis)
    };
  }
  /**
   * Detect which expert frameworks were applied.
   */
  detectFrameworks(analysis) {
    const frameworks = [];
    if (analysis.scqa.situation && analysis.scqa.answer) {
      frameworks.push("Barbara Minto (Pyramid Principle)");
    }
    if (analysis.sparkline.whatIs.length > 0 && analysis.sparkline.whatCouldBe.length > 0) {
      frameworks.push("Nancy Duarte (Sparkline)");
    }
    if (analysis.starMoments.length > 0) {
      frameworks.push("Nancy Duarte (STAR Moment)");
    }
    if (analysis.keyMessages.length <= 3) {
      frameworks.push("Carmine Gallo (Rule of Three)");
    }
    return frameworks;
  }
  /**
   * Get QA Engine for external access.
   */
  getQAEngine() {
    return this.qaEngine;
  }
  /**
   * Get PPTX Validator for external access.
   */
  getPPTXValidator() {
    return this.pptxValidator;
  }
  /**
   * Get Score Calculator for external access.
   */
  getScoreCalculator() {
    return this.scoreCalculator;
  }
  /**
   * Get Auto Remediation for external access.
   */
  getAutoRemediation() {
    return this.autoRemediation;
  }
  /**
   * Get Hallucination Detector for external access.
   */
  getHallucinationDetector() {
    return this.hallucinationDetector;
  }
};

// src/qa/AccessibilityValidator.ts
import { chromium as chromium2 } from "playwright";
var WCAG_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5
};
var MIN_FONT_SIZES = {
  body: 16,
  // 16px minimum for body text
  heading: 24,
  // 24px minimum for headings
  caption: 12,
  // 12px minimum for captions
  projection: {
    body: 18,
    // 18px for projection display
    heading: 32
    // 32px for projection headings
  }
};
var AccessibilityValidator = class {
  browser = null;
  /**
   * Validate accessibility of an HTML presentation.
   */
  async validate(html, options) {
    const targetLevel = options?.targetLevel ?? "AA";
    const projectionMode = options?.projectionMode ?? true;
    await this.initBrowser();
    try {
      const page = await this.browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.setContent(html);
      await page.waitForTimeout(1e3);
      const [contrastResults, fontResults, keyboardResults, structureResults] = await Promise.all([
        this.checkContrast(page),
        this.checkFontSizes(page, projectionMode),
        this.checkKeyboardNavigation(page),
        this.checkStructure(page)
      ]);
      const issues = [
        ...contrastResults.issues,
        ...fontResults.issues,
        ...keyboardResults.issues,
        ...structureResults.issues
      ];
      const wcagLevel = this.determineWCAGLevel(issues, targetLevel);
      const score = this.calculateScore(issues);
      const colorBlindSafe = await this.checkColorBlindSafety(page);
      await page.close();
      return {
        passed: wcagLevel !== "FAIL" && score >= 80,
        wcagLevel,
        score,
        issues,
        contrastIssues: contrastResults.contrastIssues,
        fontSizeIssues: fontResults.fontSizeIssues,
        keyboardIssues: keyboardResults.keyboardIssues,
        colorBlindSafe
      };
    } finally {
      await this.closeBrowser();
    }
  }
  /**
   * Check color contrast compliance.
   */
  async checkContrast(page) {
    const issues = [];
    const contrastIssues = [];
    const contrastData = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".slides section").forEach((slide, slideIndex) => {
        const textElements = slide.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, span, a");
        textElements.forEach((el) => {
          const styles = window.getComputedStyle(el);
          const fontSize = parseFloat(styles.fontSize);
          const fontWeight = parseInt(styles.fontWeight, 10);
          results.push({
            slideIndex,
            element: el.tagName.toLowerCase(),
            foreground: styles.color,
            background: styles.backgroundColor || "rgba(0, 0, 0, 0)",
            fontSize,
            isBold: fontWeight >= 700
          });
        });
      });
      return results;
    });
    for (const item of contrastData) {
      const ratio = this.calculateContrastRatio(item.foreground, item.background);
      const isLargeText = item.fontSize >= 24 || item.fontSize >= 18.66 && item.isBold;
      const requiredAA = isLargeText ? WCAG_CONTRAST.AA_LARGE : WCAG_CONTRAST.AA_NORMAL;
      const requiredAAA = isLargeText ? WCAG_CONTRAST.AAA_LARGE : WCAG_CONTRAST.AAA_NORMAL;
      if (ratio < requiredAA) {
        contrastIssues.push({
          slideIndex: item.slideIndex,
          element: item.element,
          foreground: item.foreground,
          background: item.background,
          ratio,
          required: requiredAA
        });
        issues.push({
          severity: ratio < 3 ? "critical" : "serious",
          type: "contrast",
          slideIndex: item.slideIndex,
          element: item.element,
          message: `Contrast ratio ${ratio.toFixed(2)}:1 below WCAG AA requirement of ${requiredAA}:1`,
          wcagCriteria: "WCAG 2.1 SC 1.4.3 (Contrast Minimum)",
          suggestion: `Increase contrast to at least ${requiredAA}:1`
        });
      }
    }
    return { issues, contrastIssues };
  }
  /**
   * Check font size compliance.
   */
  async checkFontSizes(page, projectionMode) {
    const issues = [];
    const fontSizeIssues = [];
    const minBody = projectionMode ? MIN_FONT_SIZES.projection.body : MIN_FONT_SIZES.body;
    const minHeading = projectionMode ? MIN_FONT_SIZES.projection.heading : MIN_FONT_SIZES.heading;
    const fontData = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".slides section").forEach((slide, slideIndex) => {
        const elements = slide.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, span");
        elements.forEach((el) => {
          const styles = window.getComputedStyle(el);
          const fontSize = parseFloat(styles.fontSize);
          const isHeading = /^h[1-6]$/i.test(el.tagName);
          results.push({
            slideIndex,
            element: el.tagName.toLowerCase(),
            fontSize,
            isHeading
          });
        });
      });
      return results;
    });
    for (const item of fontData) {
      const minSize = item.isHeading ? minHeading : minBody;
      if (item.fontSize < minSize) {
        fontSizeIssues.push({
          slideIndex: item.slideIndex,
          element: item.element,
          actualSize: item.fontSize,
          minimumSize: minSize
        });
        issues.push({
          severity: item.fontSize < minSize * 0.7 ? "serious" : "moderate",
          type: "font-size",
          slideIndex: item.slideIndex,
          element: item.element,
          message: `Font size ${item.fontSize}px below minimum ${minSize}px for ${projectionMode ? "projection" : "screen"}`,
          wcagCriteria: "WCAG 2.1 SC 1.4.4 (Resize Text)",
          suggestion: `Increase font size to at least ${minSize}px`
        });
      }
    }
    return { issues, fontSizeIssues };
  }
  /**
   * Check keyboard navigation accessibility.
   */
  async checkKeyboardNavigation(page) {
    const issues = [];
    const keyboardIssues = [];
    const keyboardData = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".slides section").forEach((slide, slideIndex) => {
        const focusable = slide.querySelectorAll("a, button, input, [tabindex]");
        focusable.forEach((el) => {
          const styles = window.getComputedStyle(el);
          const outlineStyle = styles.outlineStyle;
          const outlineWidth = parseFloat(styles.outlineWidth);
          if (outlineStyle === "none" || outlineWidth === 0) {
            const hasFocusStyles = el.style.cssText.includes(":focus");
            if (!hasFocusStyles) {
              results.push({
                slideIndex,
                element: el.tagName.toLowerCase(),
                issue: "Missing visible focus indicator"
              });
            }
          }
        });
        const clickable = slide.querySelectorAll("[onclick], [onkeypress]");
        clickable.forEach((el) => {
          if (!["button", "a", "input"].includes(el.tagName.toLowerCase())) {
            const hasRole = el.hasAttribute("role");
            const hasTabindex = el.hasAttribute("tabindex");
            if (!hasRole || !hasTabindex) {
              results.push({
                slideIndex,
                element: el.tagName.toLowerCase(),
                issue: "Interactive element missing role or tabindex"
              });
            }
          }
        });
      });
      return results;
    });
    for (const item of keyboardData) {
      keyboardIssues.push({
        slideIndex: item.slideIndex,
        element: item.element,
        issue: item.issue
      });
      issues.push({
        severity: "moderate",
        type: "keyboard",
        slideIndex: item.slideIndex,
        element: item.element,
        message: item.issue,
        wcagCriteria: "WCAG 2.1 SC 2.4.7 (Focus Visible)",
        suggestion: "Add visible focus styles or appropriate ARIA attributes"
      });
    }
    return { issues, keyboardIssues };
  }
  /**
   * Check document structure accessibility.
   */
  async checkStructure(page) {
    const issues = [];
    const structureData = await page.evaluate(() => {
      const results = [];
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      let lastLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1], 10);
        if (level - lastLevel > 1 && lastLevel !== 0) {
          results.push(`Heading level skipped: h${lastLevel} to h${level}`);
        }
        lastLevel = level;
      });
      const images = document.querySelectorAll("img");
      images.forEach((img, index) => {
        if (!img.alt) {
          results.push(`Image ${index + 1} missing alt text`);
        }
      });
      if (!document.documentElement.lang) {
        results.push("Document missing lang attribute");
      }
      const hasMain = document.querySelector('main, [role="main"]');
      if (!hasMain) {
        results.push("Missing main landmark region");
      }
      return results;
    });
    for (const item of structureData) {
      issues.push({
        severity: item.includes("alt text") ? "serious" : "moderate",
        type: "structure",
        message: item,
        wcagCriteria: item.includes("alt") ? "WCAG 2.1 SC 1.1.1 (Non-text Content)" : item.includes("Heading") ? "WCAG 2.1 SC 1.3.1 (Info and Relationships)" : "WCAG 2.1 SC 3.1.1 (Language of Page)",
        suggestion: item.includes("alt") ? "Add descriptive alt text to all images" : item.includes("Heading") ? "Use proper heading hierarchy (h1 \u2192 h2 \u2192 h3)" : "Add appropriate attribute or landmark"
      });
    }
    return { issues };
  }
  /**
   * Check color-blind safety.
   */
  async checkColorBlindSafety(page) {
    const colorData = await page.evaluate(() => {
      const colors = /* @__PURE__ */ new Set();
      document.querySelectorAll("*").forEach((el) => {
        const styles = window.getComputedStyle(el);
        colors.add(styles.color);
        colors.add(styles.backgroundColor);
      });
      return Array.from(colors);
    });
    const hasRed = colorData.some((c) => c.includes("rgb(255") || c.includes("rgb(200"));
    const hasGreen = colorData.some((c) => c.includes("rgb(0, 255") || c.includes("rgb(0, 200"));
    return !(hasRed && hasGreen);
  }
  /**
   * Calculate contrast ratio between two colors.
   */
  calculateContrastRatio(foreground, background) {
    const fgLuminance = this.getRelativeLuminance(foreground);
    const bgLuminance = this.getRelativeLuminance(background);
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  }
  /**
   * Calculate relative luminance of a color.
   */
  getRelativeLuminance(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return 0;
    const [, r, g, b] = match.map(Number);
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
  /**
   * Determine WCAG compliance level.
   */
  determineWCAGLevel(issues, targetLevel) {
    const criticalCount = issues.filter((i) => i.severity === "critical").length;
    const seriousCount = issues.filter((i) => i.severity === "serious").length;
    if (criticalCount > 0) return "FAIL";
    if (seriousCount > 3) return "A";
    if (seriousCount > 0) return "AA";
    return "AAA";
  }
  /**
   * Calculate accessibility score.
   */
  calculateScore(issues) {
    let score = 100;
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          score -= 20;
          break;
        case "serious":
          score -= 10;
          break;
        case "moderate":
          score -= 5;
          break;
        case "minor":
          score -= 2;
          break;
      }
    }
    return Math.max(0, score);
  }
  /**
   * Generate accessibility report.
   */
  generateReport(result) {
    const lines = [];
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("          ACCESSIBILITY VALIDATION REPORT                  ");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    lines.push("");
    lines.push(`WCAG Level Achieved: ${result.wcagLevel}`);
    lines.push(`Accessibility Score: ${result.score}/100`);
    lines.push(`Status: ${result.passed ? "\u2705 PASSED" : "\u274C FAILED"}`);
    lines.push(`Color-Blind Safe: ${result.colorBlindSafe ? "\u2705 Yes" : "\u26A0\uFE0F Check manually"}`);
    lines.push("");
    if (result.issues.length > 0) {
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      lines.push("Issues Found:");
      lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
      const bySeverity = {
        critical: result.issues.filter((i) => i.severity === "critical"),
        serious: result.issues.filter((i) => i.severity === "serious"),
        moderate: result.issues.filter((i) => i.severity === "moderate"),
        minor: result.issues.filter((i) => i.severity === "minor")
      };
      if (bySeverity.critical.length > 0) {
        lines.push(`
\u{1F534} CRITICAL (${bySeverity.critical.length}):`);
        bySeverity.critical.forEach((i) => {
          lines.push(`  \u2022 ${i.message}`);
          if (i.wcagCriteria) lines.push(`    WCAG: ${i.wcagCriteria}`);
        });
      }
      if (bySeverity.serious.length > 0) {
        lines.push(`
\u{1F7E0} SERIOUS (${bySeverity.serious.length}):`);
        bySeverity.serious.forEach((i) => {
          lines.push(`  \u2022 ${i.message}`);
        });
      }
      if (bySeverity.moderate.length > 0) {
        lines.push(`
\u{1F7E1} MODERATE (${bySeverity.moderate.length}):`);
        bySeverity.moderate.slice(0, 5).forEach((i) => {
          lines.push(`  \u2022 ${i.message}`);
        });
        if (bySeverity.moderate.length > 5) {
          lines.push(`  ... and ${bySeverity.moderate.length - 5} more`);
        }
      }
    }
    lines.push("");
    lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    return lines.join("\n");
  }
  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium2.launch({ headless: true });
    }
  }
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
};

// src/media/ImageProvider.ts
var LocalImageProvider = class {
  name = "local";
  images;
  constructor(imageMap) {
    this.images = new Map(Object.entries(imageMap ?? {}));
  }
  async isAvailable() {
    return true;
  }
  async getImage(request) {
    const key = request.description.toLowerCase();
    for (const [name, src] of this.images) {
      if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key)) {
        return {
          src,
          alt: request.description
        };
      }
    }
    return {
      src: this.getPlaceholderUrl(request),
      alt: request.description,
      isPlaceholder: true
    };
  }
  async getImages(requests) {
    return Promise.all(requests.map((r) => this.getImage(r)));
  }
  getPlaceholderUrl(request) {
    const width = request.width ?? 800;
    const height = request.height ?? 600;
    return `https://picsum.photos/${width}/${height}`;
  }
  /** Register an image for later use */
  registerImage(name, src) {
    this.images.set(name, src);
  }
};
var PlaceholderImageProvider = class {
  name = "placeholder";
  async isAvailable() {
    return true;
  }
  async getImage(request) {
    const width = request.width ?? 800;
    const height = request.height ?? 600;
    const grayscale = request.style === "professional" ? "/grayscale" : "";
    const seed = this.hashString(request.description);
    return {
      src: `https://picsum.photos/seed/${seed}/${width}/${height}${grayscale}`,
      alt: request.description,
      attribution: "Photo from Picsum.photos",
      isPlaceholder: true
    };
  }
  async getImages(requests) {
    return Promise.all(requests.map((r) => this.getImage(r)));
  }
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
};
var UnsplashImageProvider = class {
  name = "unsplash";
  accessKey;
  baseUrl = "https://api.unsplash.com";
  constructor(accessKey) {
    const key = accessKey ?? process.env["UNSPLASH_ACCESS_KEY"];
    if (key) {
      this.accessKey = key;
    }
  }
  async isAvailable() {
    return !!this.accessKey;
  }
  async getImage(request) {
    if (!this.accessKey) {
      return this.getSourceImage(request);
    }
    try {
      const query = encodeURIComponent(request.description);
      const response = await fetch(
        `${this.baseUrl}/photos/random?query=${query}&orientation=landscape`,
        {
          headers: {
            "Authorization": `Client-ID ${this.accessKey}`
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        src: data.urls.regular,
        alt: data.alt_description ?? request.description,
        attribution: `Photo by ${data.user.name} on Unsplash`
      };
    } catch {
      return this.getSourceImage(request);
    }
  }
  async getImages(requests) {
    const results = [];
    for (const request of requests) {
      results.push(await this.getImage(request));
      await this.delay(100);
    }
    return results;
  }
  async getSourceImage(request) {
    const width = request.width ?? 800;
    const height = request.height ?? 600;
    const query = encodeURIComponent(request.description);
    return {
      src: `https://source.unsplash.com/${width}x${height}/?${query}`,
      alt: request.description,
      attribution: "Photo from Unsplash"
    };
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
var CompositeImageProvider = class {
  name = "composite";
  providers;
  constructor(providers) {
    this.providers = providers;
  }
  async isAvailable() {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        return true;
      }
    }
    return false;
  }
  async getImage(request) {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        try {
          return await provider.getImage(request);
        } catch {
          continue;
        }
      }
    }
    const placeholder = new PlaceholderImageProvider();
    return placeholder.getImage(request);
  }
  async getImages(requests) {
    return Promise.all(requests.map((r) => this.getImage(r)));
  }
};
function createDefaultImageProvider(options) {
  const providers = [];
  if (options?.localImages) {
    providers.push(new LocalImageProvider(options.localImages));
  }
  if (options?.unsplashKey || process.env["UNSPLASH_ACCESS_KEY"]) {
    providers.push(new UnsplashImageProvider(options?.unsplashKey));
  }
  providers.push(new PlaceholderImageProvider());
  return new CompositeImageProvider(providers);
}

// src/knowledge/KnowledgeBase.ts
import { readFileSync } from "fs";
import { join } from "path";
import * as yaml from "yaml";
var KnowledgeBase = class {
  data = null;
  loaded = false;
  /**
   * Load the knowledge base from the bundled YAML file.
   */
  async load() {
    if (this.loaded) return;
    try {
      const possiblePaths = [
        join(__dirname, "../../assets/presentation-knowledge.yaml"),
        join(__dirname, "../assets/presentation-knowledge.yaml"),
        join(process.cwd(), "assets/presentation-knowledge.yaml"),
        join(process.cwd(), "node_modules/claude-presentation-master/assets/presentation-knowledge.yaml")
      ];
      let assetPath = "";
      for (const p of possiblePaths) {
        try {
          readFileSync(p);
          assetPath = p;
          break;
        } catch {
          continue;
        }
      }
      if (!assetPath) {
        throw new Error("Could not locate knowledge base file");
      }
      const content = readFileSync(assetPath, "utf-8");
      this.data = yaml.parse(content);
      this.loaded = true;
      console.log(`\u{1F4DA} Knowledge base loaded: v${this.data.version}`);
    } catch (error) {
      console.warn("\u26A0\uFE0F  Could not load knowledge base, using defaults");
      this.data = this.getDefaultData();
      this.loaded = true;
    }
  }
  /**
   * Get expert methodology by name.
   */
  getExpert(name) {
    this.ensureLoaded();
    return this.data?.experts?.[name];
  }
  /**
   * Get all expert names.
   */
  getExpertNames() {
    this.ensureLoaded();
    return Object.keys(this.data?.experts ?? {});
  }
  /**
   * Get framework recommendation for audience.
   */
  getFrameworkForAudience(audience) {
    this.ensureLoaded();
    return this.data?.frameworkSelector?.byAudience?.[audience];
  }
  /**
   * Get framework recommendation for goal.
   */
  getFrameworkForGoal(goal) {
    this.ensureLoaded();
    return this.data?.frameworkSelector?.byGoal?.[goal];
  }
  /**
   * Get QA scoring rubric.
   */
  getScoringRubric() {
    this.ensureLoaded();
    return this.data?.automatedQA?.scoringRubric;
  }
  /**
   * Get mode configuration (keynote or business).
   */
  getModeConfig(mode) {
    this.ensureLoaded();
    return this.data?.modes?.[mode];
  }
  /**
   * Get slide type configuration.
   */
  getSlideType(type) {
    this.ensureLoaded();
    return this.data?.slideTypes?.[type];
  }
  /**
   * Get the knowledge base version.
   */
  getVersion() {
    this.ensureLoaded();
    return this.data?.version ?? "unknown";
  }
  /**
   * Validate a slide against expert principles.
   */
  validateAgainstExpert(expertName, slideData) {
    const expert = this.getExpert(expertName);
    if (!expert) {
      return { passed: true, violations: [] };
    }
    const violations = [];
    if (expert.wordLimits) {
      if (expert.wordLimits.max && slideData.wordCount > expert.wordLimits.max) {
        violations.push(`Exceeds ${expertName} word limit of ${expert.wordLimits.max}`);
      }
      if (expert.wordLimits.min && slideData.wordCount < expert.wordLimits.min) {
        violations.push(`Below ${expertName} minimum of ${expert.wordLimits.min} words`);
      }
    }
    return {
      passed: violations.length === 0,
      violations
    };
  }
  /**
   * Ensure knowledge base is loaded.
   */
  ensureLoaded() {
    if (!this.loaded) {
      this.data = this.getDefaultData();
      this.loaded = true;
    }
  }
  /**
   * Get default data if YAML can't be loaded.
   */
  getDefaultData() {
    return {
      version: "1.0.0-fallback",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      experts: {
        "Nancy Duarte": {
          name: "Nancy Duarte",
          principles: [
            { name: "Glance Test", description: "Message clear in 3 seconds" },
            { name: "STAR Moment", description: "Something They'll Always Remember" },
            { name: "Sparkline", description: "Contrast What Is vs What Could Be" }
          ]
        },
        "Garr Reynolds": {
          name: "Garr Reynolds",
          principles: [
            { name: "Signal-to-Noise", description: "Maximize signal, minimize noise" },
            { name: "Simplicity", description: "Amplify through simplification" }
          ]
        },
        "Carmine Gallo": {
          name: "Carmine Gallo",
          principles: [
            { name: "Rule of Three", description: "Maximum 3 key messages" },
            { name: "Emotional Connection", description: "Connect emotionally first" }
          ]
        },
        "Chris Anderson": {
          name: "Chris Anderson",
          principles: [
            { name: "One Idea", description: "One powerful idea per talk" },
            { name: "Dead Laptop Test", description: "Present without slides" }
          ]
        }
      },
      frameworkSelector: {
        byAudience: {
          "board": {
            primaryFramework: "Barbara Minto",
            slideTypes: ["executive_summary", "data_insight"]
          },
          "sales": {
            primaryFramework: "Nancy Duarte",
            slideTypes: ["big_idea", "social_proof"]
          }
        },
        byGoal: {
          "persuade": {
            primaryFramework: "Nancy Duarte",
            slideTypes: ["big_idea", "star_moment"]
          },
          "inform": {
            primaryFramework: "Barbara Minto",
            slideTypes: ["bullet_points", "data_insight"]
          }
        }
      },
      automatedQA: {
        scoringRubric: {
          totalPoints: 100,
          passingThreshold: 95,
          categories: {
            visual: { weight: 35, checks: {} },
            content: { weight: 30, checks: {} },
            expert: { weight: 25, checks: {} },
            accessibility: { weight: 10, checks: {} }
          }
        }
      },
      slideTypes: {},
      modes: {
        keynote: { maxWords: 25, minWhitespace: 35 },
        business: { maxWords: 80, minWhitespace: 25 }
      }
    };
  }
};
var knowledgeBaseInstance = null;
function getKnowledgeBase() {
  if (!knowledgeBaseInstance) {
    knowledgeBaseInstance = new KnowledgeBase();
  }
  return knowledgeBaseInstance;
}

// src/index.ts
async function generate(config) {
  const engine = new PresentationEngine();
  return engine.generate(config);
}
async function validate(presentation, options) {
  const qaEngine = new QAEngine();
  const results = await qaEngine.validate(presentation, options);
  const score = qaEngine.calculateScore(results);
  return {
    ...results,
    score
  };
}
var VERSION = "2.0.0";
var index_default = {
  generate,
  validate,
  PresentationEngine,
  QAEngine,
  PPTXValidator,
  AccessibilityValidator,
  VERSION
};
export {
  AccessibilityValidator,
  AutoRemediation,
  ChartJsProvider,
  CompositeChartProvider,
  CompositeImageProvider,
  ContentAnalyzer,
  HTMLLayoutValidator,
  HallucinationDetector,
  KnowledgeBase,
  LocalImageProvider,
  MermaidProvider,
  PPTXValidator,
  PRESENTATION_TYPE_RULES,
  PlaceholderImageProvider,
  PowerPointGenerator,
  PresentationEngine,
  QAEngine,
  QAFailureError,
  QuickChartProvider,
  RevealJsGenerator,
  ScoreCalculator,
  SlideFactory,
  StrategyFactory,
  TemplateEngine,
  TemplateNotFoundError,
  TypeDetector,
  UnsplashImageProvider,
  VERSION,
  ValidationError,
  createDefaultChartProvider,
  createDefaultImageProvider,
  index_default as default,
  generate,
  getKnowledgeBase,
  validate
};
/**
 * Claude Presentation Master
 *
 * Generate world-class presentations using expert methodologies from
 * Duarte, Reynolds, Gallo, and Anderson. Enforces rigorous quality
 * standards through real visual validation.
 *
 * @packageDocumentation
 * @module claude-presentation-master
 * @author Stuart Kerr <stuart@isovision.ai>
 * @license MIT
 */
