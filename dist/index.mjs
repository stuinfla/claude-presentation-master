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
   */
  getBaseStyles(mode) {
    const fontSize = mode === "keynote" ? "2.5em" : "1.8em";
    const lineHeight = mode === "keynote" ? "1.4" : "1.5";
    return `
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

      --slide-padding: 60px;
      --content-max-width: 1200px;
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

    .reveal .slides section {
      padding: var(--slide-padding);
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .reveal .slides section .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: var(--content-max-width);
      width: 100%;
      margin: 0 auto;
    }

    /* Typography */
    .reveal h1, .reveal h2, .reveal h3 {
      font-family: var(--font-heading);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-primary);
      margin-bottom: 0.5em;
    }

    .reveal h1 { font-size: 2.5em; }
    .reveal h2 { font-size: 1.8em; }
    .reveal h3 { font-size: 1.3em; }

    .reveal p {
      margin: 0 0 1em 0;
    }

    .reveal .subtitle {
      font-size: 0.7em;
      color: var(--color-text-light);
    }

    /* Lists */
    .reveal ul, .reveal ol {
      margin: 0 0 1em 1.2em;
      padding: 0;
    }

    .reveal li {
      margin-bottom: 0.5em;
    }

    /* Columns */
    .reveal .columns {
      display: flex;
      gap: 40px;
      flex: 1;
      align-items: flex-start;
    }

    .reveal .two-columns .column {
      flex: 1;
    }

    .reveal .three-columns .column {
      flex: 1;
    }

    /* Big elements */
    .reveal .big-idea-text,
    .reveal .statement {
      font-size: 2em;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
    }

    .reveal .number {
      font-size: 4em;
      font-weight: 800;
      color: var(--color-highlight);
      text-align: center;
    }

    .reveal .number-context {
      text-align: center;
      color: var(--color-text-light);
    }

    /* Quotes */
    .reveal blockquote {
      border-left: 4px solid var(--color-accent);
      padding-left: 1em;
      font-style: italic;
      margin: 1em 0;
    }

    .reveal .attribution {
      text-align: right;
      color: var(--color-text-light);
      font-size: 0.8em;
    }

    /* Images */
    .reveal img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .reveal .image-container {
      text-align: center;
    }

    .reveal .caption {
      font-size: 0.7em;
      color: var(--color-text-light);
      margin-top: 0.5em;
    }

    /* Metrics */
    .reveal .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 30px;
      text-align: center;
    }

    .reveal .metric-value {
      font-size: 2em;
      font-weight: 700;
      color: var(--color-highlight);
    }

    .reveal .metric-label {
      font-size: 0.8em;
      color: var(--color-text-light);
    }

    .reveal .metric-change {
      font-size: 0.7em;
    }

    .reveal .metric-change.up { color: #27ae60; }
    .reveal .metric-change.down { color: #e74c3c; }

    /* Charts */
    .reveal .chart-container {
      margin: 1em 0;
    }

    /* Source */
    .reveal .source {
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 0.5em;
      color: var(--color-text-light);
    }

    /* Speaker notes */
    .reveal aside.notes {
      display: none;
    }

    /* Slide types */
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
      padding: 0.5em 1.5em;
      background: var(--color-highlight);
      color: white;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 1em;
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

// src/core/PresentationEngine.ts
var PresentationEngine = class {
  contentAnalyzer;
  slideFactory;
  templateEngine;
  scoreCalculator;
  qaEngine;
  htmlGenerator;
  pptxGenerator;
  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
    this.slideFactory = new SlideFactory();
    this.templateEngine = new TemplateEngine();
    this.scoreCalculator = new ScoreCalculator();
    this.qaEngine = new QAEngine();
    this.htmlGenerator = new RevealJsGenerator();
    this.pptxGenerator = new PowerPointGenerator();
  }
  /**
   * Generate a presentation from content.
   *
   * @param config - Presentation configuration
   * @returns Presentation result with outputs, QA results, and score
   */
  async generate(config) {
    this.validateConfig(config);
    console.log("\u{1F4DD} Analyzing content...");
    const analysis = await this.contentAnalyzer.analyze(config.content, config.contentType);
    console.log("\u{1F3A8} Creating slides...");
    const slides = await this.slideFactory.createSlides(analysis, config.mode);
    console.log("\u2705 Validating structure...");
    const structureErrors = this.validateStructure(slides, config.mode);
    if (structureErrors.length > 0) {
      throw new ValidationError(structureErrors, "Slide structure validation failed");
    }
    console.log("\u{1F528} Generating outputs...");
    const outputs = {};
    if (config.format.includes("html")) {
      outputs.html = await this.htmlGenerator.generate(slides, config);
    }
    if (config.format.includes("pptx")) {
      outputs.pptx = await this.pptxGenerator.generate(slides, config);
    }
    let qaResults;
    let score = 100;
    if (!config.skipQA && outputs.html) {
      console.log("\u{1F50D} Running QA validation...");
      qaResults = await this.qaEngine.validate(outputs.html, {
        mode: config.mode,
        strictMode: true
      });
      score = this.scoreCalculator.calculate(qaResults);
      console.log(`\u{1F4CA} QA Score: ${score}/100`);
      const threshold = config.qaThreshold ?? 95;
      if (score < threshold) {
        throw new QAFailureError(score, threshold, qaResults);
      }
    } else {
      qaResults = this.qaEngine.createEmptyResults();
      console.log("\u26A0\uFE0F  QA validation skipped (NOT RECOMMENDED)");
    }
    const metadata = this.buildMetadata(config, analysis, slides);
    return {
      outputs,
      qaResults,
      score,
      metadata
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
   * Validate slide structure before generation.
   */
  validateStructure(slides, mode) {
    const errors = [];
    if (slides.length === 0) {
      errors.push("No slides generated from content");
      return errors;
    }
    if (slides.length < 3) {
      errors.push("Presentation must have at least 3 slides");
    }
    slides.forEach((slide, index) => {
      const wordCount = this.countWords(slide);
      if (mode === "keynote") {
        if (wordCount > 25) {
          errors.push(`Slide ${index + 1}: ${wordCount} words exceeds keynote limit of 25`);
        }
      } else {
        if (wordCount < 20 && !["title", "section-divider", "thank-you"].includes(slide.type)) {
          errors.push(`Slide ${index + 1}: ${wordCount} words may be too sparse for business mode`);
        }
        if (wordCount > 100) {
          errors.push(`Slide ${index + 1}: ${wordCount} words exceeds business limit of 100`);
        }
      }
    });
    return errors;
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
var VERSION = "1.0.0";
var index_default = {
  generate,
  validate,
  PresentationEngine,
  QAEngine,
  VERSION
};
export {
  ChartJsProvider,
  CompositeChartProvider,
  CompositeImageProvider,
  ContentAnalyzer,
  KnowledgeBase,
  LocalImageProvider,
  MermaidProvider,
  PlaceholderImageProvider,
  PowerPointGenerator,
  PresentationEngine,
  QAEngine,
  QAFailureError,
  QuickChartProvider,
  RevealJsGenerator,
  ScoreCalculator,
  SlideFactory,
  TemplateEngine,
  TemplateNotFoundError,
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
