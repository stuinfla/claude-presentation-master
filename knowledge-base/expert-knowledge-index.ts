/**
 * Expert Knowledge Index
 *
 * This file consolidates all expert knowledge from deep research
 * into structured, actionable data for the presentation engine.
 *
 * Sources:
 * - Investment Banking: Wall Street Prep, Mergers & Inquisitions, Analyst Academy
 * - VC Pitch Decks: Sequoia, Y Combinator, First Round Capital, DocSend
 * - Sales Presentations: Cialdini, SPIN Selling, Challenger Sale, Pitch Anything
 * - TED/Keynotes: Nancy Duarte, Garr Reynolds, Carmine Gallo, Chris Anderson
 * - Technical: Edward Tufte, C4 Model, Google Design Docs, DORA Metrics
 */

// ==============================================================================
// INVESTMENT BANKING EXPERTISE
// ==============================================================================

export const INVESTMENT_BANKING_EXPERTISE = {
  sources: [
    'Wall Street Prep',
    'Mergers & Inquisitions (Brian DeChesare)',
    'Breaking Into Wall Street',
    'Analyst Academy',
    'Street of Walls'
  ],

  typography: {
    fonts: {
      primary: ['Garamond', 'Times New Roman'],
      secondary: ['Arial'],
      sizes: {
        title: { min: 24, max: 32, ideal: 28 },
        subtitle: { min: 18, max: 24, ideal: 20 },
        body: { min: 10, max: 14, ideal: 12 },
        footnote: { min: 8, max: 10, ideal: 8 },
        tableHeader: { min: 9, max: 11, ideal: 10 },
        tableBody: { min: 8, max: 10, ideal: 9 }
      }
    }
  },

  colors: {
    navy: '#002855',
    darkGray: '#333333',
    lightGray: '#E8E8E8',
    accent: '#B8860B', // Dark goldenrod for emphasis
    negative: '#8B0000', // Dark red for negative numbers
    positive: '#006400', // Dark green for positive
    maxColors: 6,
    contrastRatio: 4.5
  },

  numberFormatting: {
    millions: '$XXM or $X.XM',
    billions: '$XXB or $X.XB',
    negatives: '($X.XM) not -$X.XM',
    multiples: 'X.Xx (e.g., 5.0x EBITDA)',
    percentages: 'XX.X% (one decimal)',
    thousandSeparator: true
  },

  slideStructure: {
    mainDeck: { min: 35, max: 50, ideal: 40 },
    appendix: { min: 40, max: 80, ideal: 60 },
    wordsPerSlide: { min: 60, max: 120, ideal: 90 },
    framework: 'Situation-Complication-Hypothesis'
  },

  requiredSections: [
    'Title & TOC',
    'Executive Summary',
    'Situation Overview',
    'Bank Credentials',
    'Market Overview',
    'Valuation Analysis',
    'Transaction Structure',
    'Process Timeline',
    'Risk Factors',
    'Appendix'
  ],

  valuationMethods: [
    { name: 'Comparable Companies', priority: 1, slides: 2 },
    { name: 'Precedent Transactions', priority: 1, slides: 2 },
    { name: 'DCF Analysis', priority: 1, slides: 3 },
    { name: 'LBO Analysis', priority: 2, slides: 2 },
    { name: 'Sum-of-Parts', priority: 2, slides: 1 },
    { name: 'Football Field Summary', priority: 1, slides: 1 }
  ],

  footballField: {
    methodologies: 6,
    layout: 'horizontal bars',
    colorCoding: true,
    referenceLines: ['52-week range', 'current price'],
    lowestValuePosition: 'top-left',
    highestValuePosition: 'bottom-right'
  },

  compsTable: {
    sections: ['Market Data', 'Financial Data', 'Trading Multiples'],
    primaryMultiple: 'EV/EBITDA',
    minCompanies: 5,
    maxCompanies: 12,
    statistics: ['Mean', 'Median', 'High', 'Low'],
    rowShading: 'alternating'
  },

  dcfSensitivity: {
    variables: ['WACC', 'Terminal Growth Rate'],
    waccRange: '±1.0%',
    tgRange: '±0.5%',
    colorGradient: true,
    centerValue: 'base case'
  },

  tombstones: {
    columns: ['Date', 'Client', 'Description', 'Size', 'Industry', 'Role'],
    font: 'Arial',
    includeLogo: true,
    gridLayout: '2x3 or 3x3'
  },

  sources: {
    required: true,
    position: 'bottom of slide',
    format: 'Source: [Source Name], as of [Date]',
    trustedSources: [
      'Capital IQ',
      'Bloomberg',
      'Company Filings',
      'World Bank',
      'IMF',
      'McKinsey',
      'BCG',
      'Bain'
    ]
  }
};

// ==============================================================================
// VC/INVESTOR PITCH EXPERTISE
// ==============================================================================

export const INVESTOR_PITCH_EXPERTISE = {
  sources: [
    'Sequoia Capital',
    'Y Combinator',
    'First Round Capital',
    'Bessemer Venture Partners',
    'DocSend Research'
  ],

  metrics: {
    optimalSlides: { min: 10, max: 15, ideal: 12 },
    viewingTime: '3 minutes 44 seconds average',
    successRate: '1% of decks secure funding',
    wordsPerSlide: { min: 5, max: 30, ideal: 15 }
  },

  slideSequence: [
    { name: 'Title/Purpose', words: 8, required: true },
    { name: 'Problem', words: 25, required: true },
    { name: 'Solution', words: 25, required: true },
    { name: 'Why Now', words: 30, required: true },
    { name: 'Market Size (TAM/SAM/SOM)', words: 35, required: true },
    { name: 'Product/How It Works', words: 40, required: true },
    { name: 'Business Model', words: 35, required: true },
    { name: 'Traction', words: 30, required: true },
    { name: 'Competition', words: 45, required: true },
    { name: 'Team', words: 55, required: true },
    { name: 'Financials', words: 40, required: true },
    { name: 'The Ask', words: 35, required: true }
  ],

  marketSize: {
    tam: 'Total Addressable Market',
    sam: 'Serviceable Addressable Market',
    som: 'Serviceable Obtainable Market',
    visualizations: ['Concentric Circles', 'Funnel', 'Bar Chart'],
    sourcesRequired: true,
    calculationMethod: 'Bottom-up preferred over top-down'
  },

  traction: {
    preRevenue: ['Users', 'Engagement', 'Growth Rate', 'Waitlist', 'LOIs'],
    withRevenue: ['ARR/MRR', 'Growth %', 'Retention', 'CAC', 'LTV', 'LTV:CAC'],
    preferredFormat: 'Up-and-to-the-right chart',
    showGrowthRate: true
  },

  competition: {
    format: '2x2 Matrix',
    youPosition: 'top-right',
    neverSay: '"No competition"',
    axes: ['Choose meaningful differentiators, not arbitrary ones'],
    alternative: 'Feature comparison table'
  },

  theAsk: {
    specificAmount: true,
    runway: '18-24 months',
    useOfFunds: {
      showPercentages: true,
      categories: ['Engineering', 'Sales/Marketing', 'Operations', 'G&A']
    },
    milestones: 'What this funding achieves'
  },

  successfulDecks: {
    airbnb: { slides: 14, raised: '$600K', lesson: 'One-line value prop' },
    linkedin: { slides: 15, lesson: 'Data-driven proof' },
    buffer: { slides: 13, raised: '$500K', lesson: 'Radical transparency' },
    uber: { raised: '$1.25M', lesson: 'Market timing and scenarios' },
    facebook: { lesson: 'External validation opening' }
  },

  design: {
    fonts: { header: 36, body: 24, minimum: 24 },
    keyNumbers: 48,
    whitespace: '35%+',
    maxFontFamilies: 2,
    glanceTest: '3 seconds to understand'
  }
};

// ==============================================================================
// SALES PRESENTATION EXPERTISE
// ==============================================================================

export const SALES_PRESENTATION_EXPERTISE = {
  sources: [
    'Robert Cialdini (Influence)',
    'Neil Rackham (SPIN Selling)',
    'Matthew Dixon (Challenger Sale)',
    'Oren Klaff (Pitch Anything)',
    'Chris Voss (Never Split the Difference)',
    'Sandler Selling System'
  ],

  cialdiniPrinciples: {
    reciprocity: {
      principle: 'Give value before asking',
      slideApplication: 'Lead with insights, not pitch',
      example: 'Free analysis or industry insight'
    },
    commitment: {
      principle: 'Get small yeses first',
      slideApplication: 'Interactive elements, nodding points',
      example: 'Confirm pain points before solution'
    },
    socialProof: {
      principle: 'Show who else trusts you',
      slideApplication: 'Customer logos, testimonials, case studies',
      example: '"Join 500+ companies who..."'
    },
    authority: {
      principle: 'Establish credibility',
      slideApplication: 'Credentials early, expertise proof',
      example: 'Years in business, certifications, media mentions'
    },
    liking: {
      principle: 'Build rapport and connection',
      slideApplication: 'Common ground, empathy for their situation',
      example: 'We understand because we\'ve been there'
    },
    scarcity: {
      principle: 'Create urgency',
      slideApplication: 'Limited offers, deadline-driven',
      example: 'Pilot pricing ends [date]'
    }
  },

  spinSelling: {
    situation: 'Understanding their current state',
    problem: 'Uncovering pain points',
    implication: 'Exploring consequences of inaction',
    needPayoff: 'Showing value of solution',
    hierarchy: 'Features < Advantages < Benefits'
  },

  challengerSale: {
    stages: [
      'Warm-up (build credibility)',
      'Reframe (challenge assumptions)',
      'Rational Drowning (cost of problem)',
      'Emotional Impact (make it personal)',
      'New Way (your approach)',
      'Solution (your product)'
    ],
    keyInsight: 'Teach, don\'t pitch',
    dropFromDeck: ['Company overview', 'Logo slides', 'History']
  },

  pitchAnything: {
    strongMethod: {
      S: 'Set the frame',
      T: 'Tell the story',
      R: 'Reveal the intrigue',
      O: 'Offer the prize',
      N: 'Nail the hookpoint',
      G: 'Get the deal'
    },
    maxDuration: 20,
    crocBrain: 'Appeal to primitive brain first (visuals, contrast)',
    frameControl: 'You are the prize, not them'
  },

  chrisVoss: {
    tacticalEmpathy: 'Acknowledge their position',
    labeling: 'It seems like...', 'It sounds like...',
    calibratedQuestions: 'How/What questions (never Why)',
    accusationAudit: 'Pre-empt objections',
    ackermanMethod: [0.65, 0.85, 0.95, 1.0]
  },

  slideStructure: {
    enterprise: { slides: 14, cycleMonths: '6-24' },
    smb: { slides: 10, cycleMonths: '<4' },
    consumer: { slides: 8, focusOn: 'emotion' }
  },

  languagePatterns: {
    youVsWe: 'Use "you" 3x more than "we"',
    powerWords: ['Transform', 'Accelerate', 'Eliminate', 'Guarantee'],
    feelFeltFound: 'I understand how you feel. Others felt the same. They found...',
    presupposition: 'When you implement this...',
    embeddedCommand: 'Imagine the impact...'
  },

  pricingSlide: {
    approaches: ['Good-Better-Best', 'Single Premium', 'Custom Quote'],
    anchoring: 'Show highest tier first',
    framing: 'Investment, not cost',
    comparison: 'Show value vs. cost of inaction'
  },

  cta: {
    friction: 'Low friction first step (demo, not buy)',
    options: ['Book a call', 'Start free trial', 'Get custom quote'],
    contactInfo: 'Multiple options (email, phone, calendar)'
  }
};

// ==============================================================================
// TED/KEYNOTE EXPERTISE
// ==============================================================================

export const TED_KEYNOTE_EXPERTISE = {
  sources: [
    'Nancy Duarte (Slide:ology, Resonate)',
    'Garr Reynolds (Presentation Zen)',
    'Carmine Gallo (Talk Like TED)',
    'Chris Anderson (TED Talks Official Guide)',
    'Chip & Dan Heath (Made to Stick)'
  ],

  nancyDuarte: {
    sparkline: {
      whatIs: 'Current reality (the pain)',
      whatCouldBe: 'Future possibility (the vision)',
      oscillation: 'Move between them to create tension',
      resolution: 'End in the new bliss'
    },
    starMoment: {
      definition: 'Something They\'ll Always Remember',
      types: ['Shocking statistic', 'Prop/Demo', 'Personal story', 'Dramatic reveal'],
      placement: 'Around 2/3 through presentation'
    },
    glanceTest: '3 seconds to understand a slide',
    wordLimit: 75
  },

  garrReynolds: {
    signalToNoise: 'Maximize signal, minimize noise',
    amplification: 'Simplify to amplify',
    restraint: 'Removing elements increases impact',
    bigIdea: 'One clear message per presentation',
    zen: 'Embrace whitespace and simplicity'
  },

  carmineGallo: {
    ruleOfThree: 'Three key points maximum',
    pathos: '65% of talk should be emotional/stories',
    jawDroppingMoment: 'One unforgettable moment',
    passionTest: 'Must be able to pass on passion'
  },

  chrisAnderson: {
    throughline: {
      definition: 'Single unifying theme',
      wordLimit: 15,
      test: 'Can you summarize in one sentence?'
    },
    eighteenMinutes: 'Optimal talk length',
    oneIdea: 'One idea worth spreading',
    conceptLimit: '1-3 concepts per talk'
  },

  madeToStick: {
    success: {
      S: 'Simple - core of the message',
      U: 'Unexpected - break patterns',
      C: 'Concrete - specific examples',
      C: 'Credible - verifiable claims',
      E: 'Emotional - make them feel',
      S: 'Stories - narrative structure'
    }
  },

  topTedTalks: {
    simonSinek: {
      talk: 'Start With Why',
      views: '60M+',
      technique: 'Golden Circle (Why → How → What)',
      opening: 'Rhetorical question'
    },
    breneBrown: {
      talk: 'Power of Vulnerability',
      views: '60M+',
      technique: 'Personal story + research',
      opening: 'Self-deprecating humor'
    },
    kenRobinson: {
      talk: 'Schools Kill Creativity',
      views: '70M+',
      technique: 'Humor every 30 seconds',
      opening: 'Witty observation'
    },
    amyCuddy: {
      talk: 'Power Poses',
      views: '65M+',
      technique: 'Interactive + personal story',
      opening: 'Audience participation'
    },
    billGates: {
      talk: 'Next Outbreak',
      views: '40M+',
      technique: 'Prop (barrel) + visualization',
      opening: 'Story hook'
    }
  },

  slideDesign: {
    wordsPerSlide: { min: 6, max: 25, ideal: 10 },
    whitespace: '40%+',
    fonts: { minimum: 42 },
    maxFontFamilies: 2,
    bulletPoints: 'Never (or rarely)'
  },

  timing: {
    speakingPace: { wpm: { min: 125, max: 150 } },
    slideTime: { seconds: { min: 60, max: 90 } },
    paceChange: 'Every 9 minutes (Steve Jobs)',
    rehearsals: 'Minimum 10 times through'
  },

  structure: {
    opening: { duration: '2 minutes', purpose: 'Hook and establish theme' },
    body: { duration: '12-14 minutes', purpose: 'Oscillate What Is/Could Be' },
    starMoment: { placement: '60-70% through' },
    close: { duration: '2-3 minutes', purpose: 'Call to adventure' }
  }
};

// ==============================================================================
// TECHNICAL PRESENTATION EXPERTISE
// ==============================================================================

export const TECHNICAL_PRESENTATION_EXPERTISE = {
  sources: [
    'Edward Tufte (Visual Display of Quantitative Information)',
    'C4 Model (Simon Brown)',
    'Google Design Docs',
    'Amazon 6-Pagers',
    'DORA Research',
    'Netflix Engineering Blog'
  ],

  edwardTufte: {
    dataInkRatio: {
      formula: 'Data-Ink / Total Ink',
      goal: 'Maximize data, minimize decoration',
      actions: ['Remove gridlines', 'Remove borders', 'Remove backgrounds', 'Remove 3D']
    },
    chartjunk: [
      'Heavy grid lines',
      'Decorative backgrounds',
      '3D effects',
      'Unnecessary legends',
      'Ornamental axes'
    ],
    smallMultiples: 'Same chart repeated for easy comparison'
  },

  c4Model: {
    levels: [
      { name: 'Context', description: 'System in environment', audience: 'Everyone' },
      { name: 'Container', description: 'Applications and data stores', audience: 'Tech team' },
      { name: 'Component', description: 'Inside containers', audience: 'Developers' },
      { name: 'Code', description: 'Implementation', audience: 'Developers' }
    ],
    mostUsed: ['Context', 'Container'],
    colors: {
      external: '#999999',
      system: '#1168BD',
      container: '#438DD5',
      database: '#F5A623',
      queue: '#6B9E78'
    }
  },

  doraMetrics: {
    deploymentFrequency: { elite: 'Multiple per day', low: 'Less than monthly' },
    leadTime: { elite: 'Less than 1 hour', low: 'More than 6 months' },
    changeFailure: { elite: '0-15%', low: '46-60%' },
    mttr: { elite: 'Less than 1 hour', low: 'More than 6 months' }
  },

  presentationTypes: {
    systemDesign: { slides: 11, focus: 'Architecture + tradeoffs' },
    adr: { slides: 8, format: 'Context, Decision, Consequences' },
    performanceAnalysis: { slides: 10, focus: 'Data + recommendations' },
    postMortem: { slides: 9, culture: 'Blameless', method: '5 Whys' },
    roadmap: { slides: 8, format: 'Swimlanes + milestones' },
    apiDocs: { slides: 10, format: 'Endpoint tables + examples' },
    migration: { slides: 12, focus: 'Rollback plan critical' },
    securityReview: { slides: 11, model: 'STRIDE threat model' }
  },

  slideStructure: {
    tldr: 'Always first - busy engineers need summary',
    problem: 'Quantified with metrics',
    currentArch: 'C4 Container diagram',
    proposedArch: 'C4 Container diagram (target)',
    dataFlow: 'Sequence diagram',
    tradeoffs: 'Explicit pros/cons table',
    metrics: 'Before/After comparison',
    risks: 'With mitigations',
    nextSteps: 'Clear decision needed'
  },

  codeSnippets: {
    maxLines: 15,
    syntaxHighlighting: true,
    fontSize: { min: 14, max: 18 },
    tools: ['Carbon', 'VS Code', 'Pygments']
  },

  diagrams: {
    architectureTools: ['draw.io', 'Excalidraw', 'Lucidchart', 'C4-PlantUML'],
    sequenceDiagramTools: ['Mermaid', 'PlantUML', 'Sequence Diagram'],
    labelEverything: true,
    showDataFlow: 'With arrows and protocols'
  },

  decisionMatrix: {
    format: 'Options as columns, Criteria as rows',
    weighting: 'Show weights if used',
    scoring: 'Green/Yellow/Red or 1-5',
    recommendation: 'Highlighted row'
  }
};

// ==============================================================================
// CROSS-CUTTING DESIGN PRINCIPLES
// ==============================================================================

export const UNIVERSAL_DESIGN_PRINCIPLES = {
  glanceTest: {
    duration: 3,
    unit: 'seconds',
    test: 'Can viewer understand main point in 3 seconds?'
  },

  wordLimits: {
    keynote: { min: 6, max: 25, ideal: 10 },
    business: { min: 40, max: 80, ideal: 60 },
    technical: { min: 50, max: 100, ideal: 75 }
  },

  whitespace: {
    keynote: '40%+',
    business: '25-30%',
    technical: '20-25%'
  },

  typography: {
    maxFontFamilies: 2,
    minReadableSize: 18,
    headingSize: { min: 24, max: 36 },
    bodySize: { min: 14, max: 18 }
  },

  colors: {
    maxPalette: 5,
    contrastRatio: 4.5,
    accessibilityStandard: 'WCAG 2.1 AA'
  },

  cognitiveLoad: {
    bulletsMax: 5,
    conceptsPerSlide: 1,
    chunking: 'Group related items'
  }
};

// Export all expertise
export const EXPERT_KNOWLEDGE = {
  investmentBanking: INVESTMENT_BANKING_EXPERTISE,
  investorPitch: INVESTOR_PITCH_EXPERTISE,
  salesPresentation: SALES_PRESENTATION_EXPERTISE,
  tedKeynote: TED_KEYNOTE_EXPERTISE,
  technicalPresentation: TECHNICAL_PRESENTATION_EXPERTISE,
  universalDesign: UNIVERSAL_DESIGN_PRINCIPLES
};

export default EXPERT_KNOWLEDGE;
