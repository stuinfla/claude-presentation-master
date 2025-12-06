# Examples

Real-world examples of using Claude Presentation Master.

## Table of Contents

- [Basic Examples](#basic-examples)
  - [Simple Keynote](#simple-keynote)
  - [Business Presentation](#business-presentation)
  - [CLI Usage](#cli-usage)
- [Advanced Examples](#advanced-examples)
  - [Custom Themes](#custom-themes)
  - [With Charts](#with-charts)
  - [With Diagrams](#with-diagrams)
  - [Custom Templates](#custom-templates)
- [Real-World Scenarios](#real-world-scenarios)
  - [Investor Pitch Deck](#investor-pitch-deck)
  - [Product Launch](#product-launch)
  - [Quarterly Business Review](#quarterly-business-review)
  - [Training Presentation](#training-presentation)
  - [Sales Proposal](#sales-proposal)
- [Error Handling](#error-handling)
- [Integration Examples](#integration-examples)

---

## Basic Examples

### Simple Keynote

A minimal keynote-style presentation:

```typescript
import { generate } from '@isovision/claude-presentation-master';
import { writeFileSync } from 'fs';

async function createSimpleKeynote() {
  const result = await generate({
    content: `
# The Future of Work

Remote work is not a trend.
It's a fundamental shift in how we collaborate.

## The Old Way
- Commute 2 hours daily
- Fixed 9-5 schedule
- Office politics
- Limited talent pool

## The New Reality
- Work from anywhere
- Flexible schedules
- Results-focused culture
- Global talent access

## The Opportunity
Companies embracing remote work see:
40% higher productivity
25% lower turnover
60% cost savings

## Take Action
Build your remote-first culture today.
    `,
    contentType: 'markdown',
    mode: 'keynote',
    format: ['html'],
    title: 'The Future of Work'
  });

  writeFileSync('future-of-work.html', result.outputs.html!);
  console.log(`Generated ${result.metadata.slideCount} slides with score ${result.score}/100`);
}

createSimpleKeynote();
```

### Business Presentation

A detailed business-mode presentation:

```typescript
import { generate } from '@isovision/claude-presentation-master';
import { writeFileSync } from 'fs';

async function createBusinessPresentation() {
  const result = await generate({
    content: `
# Q4 2024 Marketing Report

## Executive Summary
Q4 exceeded all key performance indicators. Digital campaigns drove 45% of new leads while brand awareness increased by 23% year-over-year. This report details our performance across channels and outlines strategic priorities for 2025.

## Channel Performance

### Digital Marketing
- Website traffic: 2.3M visitors (+34% YoY)
- Conversion rate: 4.2% (+0.8pp)
- Cost per acquisition: $42 (-15%)
- Email open rate: 28% (+5pp)

### Social Media
- Total followers: 125K (+45K)
- Engagement rate: 5.8%
- Top platform: LinkedIn (42% of leads)
- Viral campaigns: 3

### Content Marketing
- Blog posts published: 48
- Average time on page: 4:32
- Organic traffic share: 62%
- Backlinks acquired: 340

## Campaign Highlights

### Black Friday Campaign
Generated $2.4M in attributed revenue with a 12:1 ROAS. Key tactics included early access for email subscribers, influencer partnerships, and retargeting.

### Product Launch: Enterprise Suite
Successful launch with 1,200+ demo requests in first week. Featured coverage in TechCrunch and Forbes.

## Challenges & Learnings
1. iOS privacy changes impacted Facebook attribution
2. Video content outperformed static by 3x
3. B2B LinkedIn investment needs increase
4. Customer testimonials drove highest conversions

## 2025 Strategic Priorities
1. Double down on LinkedIn and YouTube
2. Launch customer advocacy program
3. Implement AI-powered personalization
4. Expand into podcast advertising
5. Build first-party data infrastructure
    `,
    contentType: 'markdown',
    mode: 'business',
    format: ['html', 'pptx'],
    title: 'Q4 2024 Marketing Report',
    author: 'Marketing Team',
    theme: 'light-corporate'
  });

  writeFileSync('q4-marketing-report.html', result.outputs.html!);
  writeFileSync('q4-marketing-report.pptx', result.outputs.pptx!);

  console.log('Generated files:');
  console.log(`- HTML: q4-marketing-report.html`);
  console.log(`- PPTX: q4-marketing-report.pptx`);
  console.log(`- Slides: ${result.metadata.slideCount}`);
  console.log(`- Score: ${result.score}/100`);
}

createBusinessPresentation();
```

### CLI Usage

```bash
# Generate keynote from Markdown
cpm generate presentation.md -m keynote -f html

# Generate business presentation with both formats
cpm generate report.md -m business -f html,pptx -o ./output

# Use a specific theme
cpm generate pitch.md -m keynote --theme modern-tech

# Set custom title and author
cpm generate content.md -m keynote --title "Product Launch 2024" --author "Jane Smith"

# Lower QA threshold for drafts
cpm generate draft.md -m keynote --threshold 80

# Validate existing presentation
cpm validate presentation.html -m keynote

# Get package info
cpm info
```

---

## Advanced Examples

### Custom Themes

Override default colors and styles:

```typescript
import { generate } from '@isovision/claude-presentation-master';

const result = await generate({
  content: myContent,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html'],
  title: 'Custom Themed Presentation',
  theme: 'minimal', // Start with minimal theme
  customCSS: `
    :root {
      --color-primary: #2d3748;
      --color-secondary: #4a5568;
      --color-accent: #805ad5;
      --color-highlight: #d53f8c;
      --color-background: #f7fafc;
      --font-heading: 'Playfair Display', serif;
      --font-body: 'Inter', sans-serif;
    }

    .reveal .slides section {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    }

    .reveal h1, .reveal h2 {
      letter-spacing: -0.03em;
    }

    .reveal .slide-title {
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }

    .reveal .slide-title h1 {
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .reveal .number {
      background: linear-gradient(135deg, #805ad5 0%, #d53f8c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `
});
```

### With Charts

Add data visualizations:

```typescript
import { generate, createDefaultChartProvider } from '@isovision/claude-presentation-master';

async function presentationWithCharts() {
  const chartProvider = createDefaultChartProvider();

  // Generate chart
  const revenueChart = await chartProvider.generateChart({
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: '2023',
          data: [120, 150, 180, 220]
        },
        {
          label: '2024',
          data: [180, 210, 250, 310]
        }
      ]
    },
    title: 'Revenue Growth ($M)',
    palette: 'professional'
  });

  const lineChart = await chartProvider.generateChart({
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Monthly Active Users',
        data: [10000, 15000, 22000, 28000, 35000, 45000]
      }]
    },
    title: 'User Growth'
  });

  // Include charts in content
  const content = `
# Growth Metrics

## Revenue Performance
${revenueChart.html}

Year-over-year revenue grew by 45%, exceeding our targets.

## User Acquisition
${lineChart.html}

Monthly active users increased from 10K to 45K in just 6 months.
  `;

  const result = await generate({
    content,
    contentType: 'text', // Charts are already HTML
    mode: 'business',
    format: ['html'],
    title: 'Growth Metrics Dashboard'
  });

  return result;
}
```

### With Diagrams

Add flowcharts and timelines using Mermaid:

```typescript
import { generate, createDefaultChartProvider } from '@isovision/claude-presentation-master';

async function presentationWithDiagrams() {
  const chartProvider = createDefaultChartProvider();

  // Generate flowchart
  const processFlow = chartProvider.generateFlowchart([
    { id: 'A', label: 'Customer Request', next: ['B'] },
    { id: 'B', label: 'Triage', next: ['C', 'D'] },
    { id: 'C', label: 'Quick Resolution', next: ['E'] },
    { id: 'D', label: 'Escalate', next: ['F'] },
    { id: 'F', label: 'Specialist Review', next: ['E'] },
    { id: 'E', label: 'Resolution' }
  ]);

  const flowchartResult = await chartProvider.generateDiagram(processFlow, 'Support Process');

  // Generate timeline
  const companyTimeline = chartProvider.generateTimeline([
    { date: '2020', title: 'Company Founded' },
    { date: '2021', title: 'Seed Round ($2M)' },
    { date: '2022', title: 'Product Launch' },
    { date: '2023', title: 'Series A ($15M)' },
    { date: '2024', title: '100K Users' }
  ]);

  const timelineResult = await chartProvider.generateDiagram(companyTimeline, 'Our Journey');

  const content = `
# Process & Timeline

## Customer Support Process
${flowchartResult.html}

## Company Timeline
${timelineResult.html}
  `;

  return await generate({
    content,
    contentType: 'text',
    mode: 'business',
    format: ['html'],
    title: 'Process Overview'
  });
}
```

### Custom Templates

Override built-in templates:

```typescript
import { generate } from '@isovision/claude-presentation-master';

const result = await generate({
  content: myContent,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html'],
  title: 'Custom Templates Demo',
  customTemplates: {
    // Custom title slide with logo
    'title': `
      <section class="slide slide-title" data-slide-index="{{slideIndex}}">
        <div class="slide-content">
          <div class="company-logo">
            <img src="https://example.com/logo.svg" alt="Company Logo" />
          </div>
          <h1 class="title animate-fadeIn">{{title}}</h1>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-200">{{subtitle}}</p>
          {{/if}}
          <div class="presenter-info animate-fadeIn delay-400">
            {{#if author}}<span class="author">{{author}}</span>{{/if}}
            <span class="date">{{date}}</span>
          </div>
        </div>
      </section>
    `,

    // Custom big-number with icon
    'big-number': `
      <section class="slide slide-big-number" data-slide-index="{{slideIndex}}">
        <div class="slide-content">
          <div class="number-icon">📈</div>
          <div class="number animate-zoomIn">{{title}}</div>
          {{#if subtitle}}
          <p class="number-context animate-fadeIn delay-300">{{subtitle}}</p>
          {{/if}}
          {{> source}}
        </div>
      </section>
    `,

    // Custom thank-you with contact info
    'thank-you': `
      <section class="slide slide-thank-you" data-slide-index="{{slideIndex}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="contact-grid animate-fadeIn delay-300">
            <div class="contact-item">
              <span class="icon">📧</span>
              <span>contact@example.com</span>
            </div>
            <div class="contact-item">
              <span class="icon">🌐</span>
              <span>www.example.com</span>
            </div>
            <div class="contact-item">
              <span class="icon">📱</span>
              <span>@example</span>
            </div>
          </div>
        </div>
      </section>
    `
  },
  customCSS: `
    .company-logo img {
      height: 60px;
      margin-bottom: 2rem;
    }

    .presenter-info {
      margin-top: 2rem;
      font-size: 0.7em;
      color: var(--color-text-light);
    }

    .number-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .contact-grid {
      display: flex;
      justify-content: center;
      gap: 3rem;
      margin-top: 2rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .contact-item .icon {
      font-size: 1.5rem;
    }
  `
});
```

---

## Real-World Scenarios

### Investor Pitch Deck

```typescript
import { generate } from '@isovision/claude-presentation-master';

async function investorPitch() {
  const result = await generate({
    content: `
# TechStartup - Series A Pitch

## The Problem
Enterprise software is broken.
Companies spend $500B annually on tools their employees hate.
87% of workers say their software makes them less productive.

## The Solution
TechStartup is the AI-powered workspace that adapts to how people actually work.
One platform. Zero friction. 10x productivity.

## How It Works
1. Connect your existing tools
2. AI learns your workflows
3. Automation handles the busywork
4. You focus on what matters

## Traction
- 500+ enterprise customers
- $8M ARR (growing 20% MoM)
- 95% customer retention
- NPS: 72

## Market Opportunity
$50B TAM in enterprise productivity.
We're targeting mid-market first ($2B SAM).
Current market share: 0.4% with clear path to 10%.

## Business Model
- SaaS subscription: $29/user/month
- Enterprise tier: Custom pricing
- Average contract: $180K/year
- Gross margin: 82%

## The Team
- CEO: Former VP Product at Salesforce (15 years)
- CTO: Ex-Google, built Gmail's AI features
- COO: Scaled operations at Stripe from 50 to 500
- 45 employees, 80% technical

## The Ask
Raising $20M Series A to:
- Scale engineering team (20 → 50)
- Expand to European market
- Launch enterprise product
- Accelerate AI capabilities

## Why Now
- AI technology finally ready
- Remote work created demand
- Competitors are slow to adapt
- First-mover advantage window

## Let's Build the Future
Join us in reimagining how the world works.
    `,
    contentType: 'markdown',
    mode: 'keynote',
    format: ['html', 'pptx'],
    title: 'TechStartup Series A',
    author: 'Founder Name',
    theme: 'modern-tech',
    qaThreshold: 95
  });

  console.log('Pitch deck generated!');
  console.log(`Score: ${result.score}/100`);
  console.log(`Frameworks: ${result.metadata.frameworks.join(', ')}`);

  return result;
}
```

### Product Launch

```typescript
import { generate } from '@isovision/claude-presentation-master';

async function productLaunch() {
  const result = await generate({
    content: `
# Introducing ProductX 2.0

## A New Era Begins
After 18 months of development and 10,000 hours of customer feedback,
we're proud to present the most powerful version of ProductX ever.

## What's New

### Lightning Fast
3x faster performance.
Load times under 100ms.
Real-time sync across all devices.

### AI-Powered
Smart suggestions that actually help.
Automated workflows that save hours.
Predictive analytics that drive results.

### Beautiful Design
Completely redesigned interface.
Dark mode that doesn't hurt your eyes.
Accessibility-first approach.

## Customer Stories

### Acme Corp
"ProductX 2.0 saved our team 20 hours per week."
- Sarah Chen, VP Operations

### GlobalTech
"The AI features are game-changing. ROI in 30 days."
- Michael Roberts, CTO

## Pricing

### Starter
$9/month - Perfect for individuals

### Professional
$29/month - Best for teams

### Enterprise
Custom - For large organizations

## Available Today
Download now at productx.com
Free 14-day trial. No credit card required.
    `,
    contentType: 'markdown',
    mode: 'keynote',
    format: ['html'],
    title: 'ProductX 2.0 Launch',
    theme: 'creative'
  });

  return result;
}
```

### Quarterly Business Review

```typescript
import { generate, createDefaultChartProvider } from '@isovision/claude-presentation-master';

async function quarterlyReview() {
  const charts = createDefaultChartProvider();

  // Generate performance charts
  const revenueChart = await charts.generateChart({
    type: 'line',
    data: {
      labels: ['Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Actual', data: [4.2, 4.8, 5.5] },
        { label: 'Target', data: [4.0, 4.5, 5.0] }
      ]
    },
    title: 'Q4 Revenue ($M)'
  });

  const result = await generate({
    content: `
# Q4 2024 Business Review

## Executive Summary
Q4 was our strongest quarter yet. We exceeded revenue targets by 10%,
launched two major product features, and expanded into three new markets.
This report provides a comprehensive analysis of our performance.

## Financial Performance

### Revenue
${revenueChart.html}

Total Q4 Revenue: $14.5M
- Target: $13.5M
- Beat by: $1M (7.4%)
- YoY Growth: 45%

### Profitability
- Gross Margin: 74% (+2pp QoQ)
- Operating Expenses: $9.8M
- EBITDA: $1.2M (first positive quarter)
- Cash Position: $18M

## Key Metrics

### Customer Metrics
| Metric | Q3 | Q4 | Change |
|--------|-----|-----|--------|
| New Customers | 89 | 127 | +43% |
| Churn Rate | 2.5% | 2.1% | -0.4pp |
| NPS | 64 | 72 | +8 |
| ARPU | $1,200 | $1,350 | +12.5% |

### Product Metrics
| Metric | Q3 | Q4 | Change |
|--------|-----|-----|--------|
| MAU | 45K | 62K | +38% |
| DAU/MAU | 45% | 52% | +7pp |
| Feature Adoption | 34% | 48% | +14pp |
| Support Tickets | 1,200 | 890 | -26% |

## Major Accomplishments

### Product Launches
1. AI Assistant v2.0 - 85% adoption in first month
2. Mobile App - 15K downloads in first week
3. API v3 - 200+ integrations enabled

### Market Expansion
1. Opened UK office (12 employees)
2. Launched in Germany and France
3. First enterprise deal in APAC ($500K)

### Team Growth
- Headcount: 78 → 95 (+22%)
- Key hires: VP Sales, Head of AI, CISO
- Employee satisfaction: 4.2/5

## Challenges & Learnings

### Challenges
1. Slower than expected enterprise sales cycle
2. Technical debt slowed feature velocity
3. Hiring senior engineers remains difficult

### Learnings
1. Self-serve drives more efficient growth
2. Customer success investment pays off (3x)
3. International expansion requires local presence

## Q1 2025 Priorities

### Revenue Goals
- Target: $18M (+24% QoQ)
- New enterprise deals: 15
- Expansion revenue: 35% of new ARR

### Product Roadmap
1. Enterprise security features
2. Advanced analytics dashboard
3. Native integrations (Salesforce, HubSpot)

### Operational Initiatives
1. Implement OKR framework
2. Open second engineering hub
3. Achieve SOC 2 Type II
4. Launch customer advisory board

## Appendix: Detailed Metrics
[Additional data available in supplementary materials]
    `,
    contentType: 'markdown',
    mode: 'business',
    format: ['html', 'pptx'],
    title: 'Q4 2024 Business Review',
    author: 'Leadership Team',
    theme: 'light-corporate'
  });

  return result;
}
```

### Training Presentation

```typescript
import { generate } from '@isovision/claude-presentation-master';

async function trainingPresentation() {
  const result = await generate({
    content: `
# New Employee Onboarding
Welcome to the Team!

## About This Training
This session covers everything you need to succeed in your first 90 days.
Duration: 2 hours
Format: Interactive workshop

## Agenda
1. Company Overview (15 min)
2. Our Products (20 min)
3. Team Structure (15 min)
4. Tools & Systems (30 min)
5. Policies & Benefits (20 min)
6. Q&A (20 min)

## Company Overview

### Our Mission
To make enterprise software that people actually love using.

### Our Values
- Customer First: Every decision starts with the customer
- Move Fast: Ship, learn, iterate
- Own It: Take responsibility for outcomes
- Stay Curious: Never stop learning
- Win Together: Collaboration over competition

### Our History
- 2020: Founded by 3 ex-Google engineers
- 2021: First product launch, 100 customers
- 2022: Series A, expanded to 50 employees
- 2023: 1,000 customers, profitability
- 2024: Series B, 100 employees, global expansion

## Our Products

### ProductX Core
Our flagship product for small teams.
Key features: Task management, collaboration, integrations.

### ProductX Enterprise
Advanced features for large organizations.
Key features: SSO, advanced security, dedicated support.

### ProductX API
Developer platform for custom integrations.
Key features: REST & GraphQL, webhooks, SDKs.

## Team Structure

### Engineering
- Frontend Team (12 people)
- Backend Team (15 people)
- Platform Team (8 people)
- QA Team (5 people)

### Go-to-Market
- Sales (20 people)
- Marketing (10 people)
- Customer Success (12 people)

### Operations
- People Ops (5 people)
- Finance (4 people)
- Legal (2 people)

## Tools & Systems

### Communication
- Slack: Daily communication
- Email: External and formal internal
- Zoom: Video meetings

### Development
- GitHub: Code repository
- Jira: Project management
- Figma: Design collaboration

### Operations
- Workday: HR & payroll
- Expensify: Expense reports
- 1Password: Password management

## Policies & Benefits

### Work Schedule
- Core hours: 10am - 4pm
- Flexible start/end times
- Remote-friendly policy

### Time Off
- Unlimited PTO (min 3 weeks encouraged)
- 10 company holidays
- Volunteer days: 2 per year

### Benefits
- Health, dental, vision (100% covered)
- 401k with 4% match
- Learning budget: $1,500/year
- Home office stipend: $500

## Your First 90 Days

### Week 1
- Complete HR paperwork
- Set up all accounts
- Meet your team
- Shadow customer calls

### Month 1
- Complete product training
- Ship your first code/contribution
- 1:1s with key stakeholders
- Attend team social events

### Month 2-3
- Own a small project
- Present at team meeting
- Identify improvement areas
- Set 6-month goals

## Resources

### Documentation
- wiki.company.com - Internal wiki
- docs.productx.com - Product documentation
- learn.company.com - Training courses

### People
- Your Manager: Direct support
- Buddy: Peer mentor
- HR Partner: Benefits & policies
- IT Support: Technical issues

## Questions?
We're here to help you succeed.

Contact: onboarding@company.com
Slack: #new-hires
    `,
    contentType: 'markdown',
    mode: 'business',
    format: ['html', 'pptx'],
    title: 'New Employee Onboarding',
    author: 'People Operations',
    theme: 'default'
  });

  return result;
}
```

### Sales Proposal

```typescript
import { generate } from '@isovision/claude-presentation-master';

async function salesProposal() {
  const result = await generate({
    content: `
# Proposal for Acme Corporation
Transforming Your Customer Experience

## Understanding Your Challenges
Based on our discovery calls, we understand Acme faces:

### Current Pain Points
1. Customer support response time averaging 4 hours
2. Manual processes consuming 60% of agent time
3. No unified view of customer interactions
4. Difficulty scaling during peak periods

### Business Impact
- Customer satisfaction: 65% (industry avg: 78%)
- Agent turnover: 35% annually
- Cost per ticket: $22 (target: $12)
- Lost revenue from churn: ~$2M annually

## The Solution
ProductX Enterprise provides an AI-powered customer experience platform
that addresses each of your challenges.

### Unified Customer View
- 360-degree customer profile
- All channels in one interface
- Complete interaction history
- Real-time updates

### AI-Powered Automation
- Smart routing reduces wait times 70%
- Auto-responses handle 40% of tickets
- Suggested responses for agents
- Predictive escalation

### Scalable Infrastructure
- Handles 10x normal volume
- Auto-scaling during peaks
- 99.99% uptime SLA
- Global CDN

## Expected Outcomes

### Year 1 Projections
| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Response Time | 4 hours | 15 min | 94% |
| CSAT | 65% | 82% | +17pp |
| Cost per Ticket | $22 | $11 | 50% |
| Agent Productivity | Baseline | +45% | 45% |

### ROI Analysis
- Annual savings: $1.2M
- Reduced churn value: $800K
- Total annual benefit: $2M
- Investment: $350K/year
- ROI: 471%
- Payback: 2.1 months

## Why ProductX

### Industry Leadership
- 500+ enterprise customers
- Leader in Gartner Magic Quadrant
- 99.99% uptime track record
- SOC 2 Type II certified

### Customer Success Stories

#### TechCorp (Similar size/industry)
"ProductX reduced our support costs by 55% while improving CSAT by 20 points."
- VP Customer Experience

#### GlobalRetail (Your competitor)
"Implementation was smooth. We saw ROI in 60 days."
- Chief Customer Officer

## Implementation Plan

### Phase 1: Foundation (Weeks 1-4)
- Platform configuration
- Data migration
- Integration setup
- Admin training

### Phase 2: Rollout (Weeks 5-8)
- Agent training
- Pilot team launch
- Feedback collection
- Optimization

### Phase 3: Scale (Weeks 9-12)
- Full team deployment
- Advanced features
- Custom automation
- Success review

## Investment

### ProductX Enterprise
- 100 agent licenses: $250K/year
- Implementation: $50K (one-time)
- Training: $25K (one-time)
- Premium support: $25K/year

### Total Year 1: $350K
### Annual Renewal: $275K

## Next Steps
1. Executive alignment meeting (Week 1)
2. Technical requirements review (Week 2)
3. Contract finalization (Week 3)
4. Kickoff (Week 4)

## Thank You
Let's transform your customer experience together.

Contact: sales@productx.com
Phone: (555) 123-4567
    `,
    contentType: 'markdown',
    mode: 'business',
    format: ['html', 'pptx'],
    title: 'Proposal for Acme Corporation',
    author: 'Sales Team',
    theme: 'light-corporate'
  });

  return result;
}
```

---

## Error Handling

### Handling QA Failures

```typescript
import { generate, QAFailureError } from '@isovision/claude-presentation-master';

async function handleQAFailure() {
  try {
    const result = await generate({
      content: myContent,
      contentType: 'markdown',
      mode: 'keynote',
      format: ['html'],
      title: 'My Presentation',
      qaThreshold: 95
    });

    console.log('Success!', result.score);
  } catch (error) {
    if (error instanceof QAFailureError) {
      console.log(`QA Failed: ${error.score}/${error.threshold}`);
      console.log('\nIssues to fix:');

      // Group issues by category
      const categories = {};
      for (const issue of error.qaResults.issues) {
        if (!categories[issue.category]) {
          categories[issue.category] = [];
        }
        categories[issue.category].push(issue);
      }

      for (const [category, issues] of Object.entries(categories)) {
        console.log(`\n${category.toUpperCase()}:`);
        for (const issue of issues) {
          const icon = issue.severity === 'error' ? '❌' : '⚠️';
          console.log(`  ${icon} ${issue.message}`);
          if (issue.suggestion) {
            console.log(`     → ${issue.suggestion}`);
          }
        }
      }

      // Optionally retry with lower threshold
      console.log('\nRetrying with lower threshold...');
      const result = await generate({
        ...config,
        qaThreshold: 80
      });
      console.log(`Generated with score: ${result.score}/100`);
    } else {
      throw error;
    }
  }
}
```

### Handling Validation Errors

```typescript
import { generate, ValidationError } from '@isovision/claude-presentation-master';

async function handleValidationError() {
  try {
    const result = await generate({
      content: '', // Empty content
      contentType: 'markdown',
      mode: 'invalid', // Invalid mode
      format: [],     // No formats
      title: ''       // Empty title
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('Configuration errors:');
      error.errors.forEach(e => console.log(`  - ${e}`));

      // Example output:
      // Configuration errors:
      //   - Content is required
      //   - Mode must be "keynote" or "business"
      //   - At least one output format is required
      //   - Title is required
    }
  }
}
```

---

## Integration Examples

### Express.js API

```typescript
import express from 'express';
import { generate, QAFailureError, ValidationError } from '@isovision/claude-presentation-master';

const app = express();
app.use(express.json());

app.post('/api/presentations', async (req, res) => {
  try {
    const result = await generate({
      content: req.body.content,
      contentType: req.body.contentType || 'markdown',
      mode: req.body.mode || 'keynote',
      format: req.body.format || ['html'],
      title: req.body.title,
      author: req.body.author,
      theme: req.body.theme,
      qaThreshold: req.body.qaThreshold
    });

    res.json({
      success: true,
      score: result.score,
      metadata: result.metadata,
      html: result.outputs.html,
      // Don't send PPTX in JSON - use separate endpoint
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: 'validation_error',
        errors: error.errors
      });
    } else if (error instanceof QAFailureError) {
      res.status(422).json({
        success: false,
        error: 'qa_failure',
        score: error.score,
        threshold: error.threshold,
        issues: error.getIssues()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'internal_error',
        message: error.message
      });
    }
  }
});

app.listen(3000);
```

### GitHub Action

```yaml
name: Generate Presentation
on:
  push:
    paths:
      - 'presentation.md'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install @isovision/claude-presentation-master

      - name: Install Playwright
        run: npx playwright install chromium

      - name: Generate presentation
        run: |
          npx cpm generate presentation.md \
            --mode keynote \
            --format html,pptx \
            --output ./dist

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: presentation
          path: ./dist/
```

### Serverless Function (AWS Lambda)

```typescript
import { generate } from '@isovision/claude-presentation-master';

export const handler = async (event) => {
  const body = JSON.parse(event.body);

  try {
    const result = await generate({
      content: body.content,
      contentType: 'markdown',
      mode: body.mode || 'keynote',
      format: ['html'], // Only HTML for Lambda
      title: body.title,
      skipQA: true // Skip Playwright for Lambda
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        html: result.outputs.html,
        metadata: result.metadata
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
```
