#!/usr/bin/env node

/**
 * Claude Presentation Master CLI
 *
 * Generate world-class presentations from the command line.
 *
 * Usage:
 *   cpm generate input.md -o output/ --mode keynote --format html,pptx
 *   cpm validate presentation.html --mode business
 *   cpm --help
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

// Parse command line arguments
const args = process.argv.slice(2);

// Help text
const helpText = `
Claude Presentation Master v1.0.0
Generate world-class presentations using expert methodologies

USAGE:
  cpm <command> [options]
  claude-presentation-master <command> [options]

COMMANDS:
  generate <input>    Generate presentation from input file
  validate <file>     Validate an existing HTML presentation
  info                Show package information

OPTIONS:
  -o, --output <dir>  Output directory (default: ./output)
  -m, --mode <mode>   Presentation mode: keynote or business (default: keynote)
  -f, --format <fmt>  Output formats: html, pptx, or both (default: html)
  -t, --theme <name>  Theme: default, light-corporate, modern-tech, minimal, warm, creative
  --title <title>     Presentation title (default: filename)
  --author <name>     Author name
  --threshold <num>   QA score threshold 0-100 (default: 95)
  --skip-qa           Skip QA validation (NOT recommended)
  -h, --help          Show this help message
  -v, --version       Show version number

EXAMPLES:
  # Generate keynote presentation as HTML
  cpm generate presentation.md -m keynote

  # Generate business presentation as both HTML and PPTX
  cpm generate deck.md -m business -f html,pptx -o ./slides

  # Validate an existing presentation
  cpm validate output/presentation.html -m keynote

  # Generate with custom theme
  cpm generate content.md --theme modern-tech --title "Product Launch"

SUPPORTED INPUT FORMATS:
  - Markdown (.md)
  - JSON (.json)
  - YAML (.yaml, .yml)
  - Plain text (.txt)

For more information, visit: https://github.com/isovision/claude-presentation-master
`;

// Version
const version = '1.0.0';

// Parse arguments
function parseArgs(args) {
  const options = {
    command: null,
    input: null,
    output: './output',
    mode: 'keynote',
    format: ['html'],
    theme: 'default',
    title: null,
    author: null,
    threshold: 95,
    skipQA: false,
    help: false,
    version: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;

      case '-v':
      case '--version':
        options.version = true;
        break;

      case '-o':
      case '--output':
        options.output = args[++i];
        break;

      case '-m':
      case '--mode':
        options.mode = args[++i];
        break;

      case '-f':
      case '--format':
        options.format = args[++i].split(',').map(f => f.trim());
        break;

      case '-t':
      case '--theme':
        options.theme = args[++i];
        break;

      case '--title':
        options.title = args[++i];
        break;

      case '--author':
        options.author = args[++i];
        break;

      case '--threshold':
        options.threshold = parseInt(args[++i], 10);
        break;

      case '--skip-qa':
        options.skipQA = true;
        break;

      case 'generate':
      case 'validate':
      case 'info':
        options.command = arg;
        break;

      default:
        if (!arg.startsWith('-') && !options.input) {
          options.input = arg;
        }
        break;
    }
    i++;
  }

  return options;
}

// Determine content type from file extension
function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  switch (ext) {
    case '.md':
    case '.markdown':
      return 'markdown';
    case '.json':
      return 'json';
    case '.yaml':
    case '.yml':
      return 'yaml';
    default:
      return 'text';
  }
}

// Main function
async function main() {
  const options = parseArgs(args);

  // Handle help
  if (options.help || args.length === 0) {
    console.log(helpText);
    process.exit(0);
  }

  // Handle version
  if (options.version) {
    console.log(`Claude Presentation Master v${version}`);
    process.exit(0);
  }

  // Handle info command
  if (options.command === 'info') {
    console.log(`
Claude Presentation Master v${version}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Author: Stuart Kerr <stuart@isovision.ai>
License: MIT

Features:
  ✓ Expert methodologies (Duarte, Reynolds, Gallo, Anderson)
  ✓ Two modes: Keynote (6-25 words) & Business (40-80 words)
  ✓ HTML (Reveal.js) + PowerPoint output
  ✓ Real visual QA with Playwright
  ✓ 95/100 minimum score enforcement
  ✓ No API keys required (optional enhancements available)

Media Providers (all work without API keys):
  Images:  Placeholder, Unsplash Source, Local files
  Charts:  Chart.js (HTML), QuickChart (PPTX)
  Diagrams: Mermaid.js

Expert Knowledge Base:
  • 6,300+ lines of expert principles
  • 40+ presentation experts
  • SCQA, Sparkline, STAR Moment frameworks
  • Automated framework selection
`);
    process.exit(0);
  }

  // Validate command
  if (!options.command) {
    console.error('Error: No command specified. Use "generate" or "validate".');
    console.error('Run "cpm --help" for usage information.');
    process.exit(1);
  }

  // Validate input
  if (!options.input) {
    console.error(`Error: No input file specified for "${options.command}" command.`);
    process.exit(1);
  }

  // Resolve input path
  const inputPath = resolve(process.cwd(), options.input);
  if (!existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Dynamic import of the library
  console.log('📦 Loading Claude Presentation Master...');

  try {
    const { generate, validate } = await import('../dist/index.js');

    if (options.command === 'generate') {
      await runGenerate(inputPath, options, generate);
    } else if (options.command === 'validate') {
      await runValidate(inputPath, options, validate);
    }
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Error: Package not built. Run "npm run build" first.');
      process.exit(1);
    }
    throw error;
  }
}

// Generate command
async function runGenerate(inputPath, options, generate) {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          Claude Presentation Master                    ║
║          Generating World-Class Presentation           ║
╚════════════════════════════════════════════════════════╝
`);

  // Read input file
  console.log(`📄 Reading: ${inputPath}`);
  const content = readFileSync(inputPath, 'utf-8');

  // Determine title
  const title = options.title || basename(inputPath, extname(inputPath));

  // Build config
  const config = {
    content,
    contentType: getContentType(inputPath),
    mode: options.mode,
    format: options.format,
    theme: options.theme,
    title,
    author: options.author,
    qaThreshold: options.threshold,
    skipQA: options.skipQA
  };

  console.log(`
📋 Configuration:
   Mode:      ${options.mode}
   Format:    ${options.format.join(', ')}
   Theme:     ${options.theme}
   Title:     ${title}
   Threshold: ${options.threshold}/100
   Skip QA:   ${options.skipQA ? 'Yes (NOT RECOMMENDED)' : 'No'}
`);

  try {
    // Generate presentation
    const result = await generate(config);

    // Create output directory
    const outputDir = resolve(process.cwd(), options.output);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write outputs
    const baseFilename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (result.outputs.html) {
      const htmlPath = resolve(outputDir, `${baseFilename}.html`);
      writeFileSync(htmlPath, result.outputs.html);
      console.log(`✅ HTML saved: ${htmlPath}`);
    }

    if (result.outputs.pptx) {
      const pptxPath = resolve(outputDir, `${baseFilename}.pptx`);
      writeFileSync(pptxPath, result.outputs.pptx);
      console.log(`✅ PPTX saved: ${pptxPath}`);
    }

    // Show results
    console.log(`
╔════════════════════════════════════════════════════════╗
║                    QA RESULTS                          ║
╚════════════════════════════════════════════════════════╝

📊 Score: ${result.score}/100 ${result.score >= options.threshold ? '✅ PASSED' : '❌ FAILED'}

📈 Metadata:
   Slides:    ${result.metadata.slideCount}
   Words:     ${result.metadata.wordCount}
   Avg/Slide: ${result.metadata.avgWordsPerSlide}
   Duration:  ~${result.metadata.estimatedDuration} minutes

🎓 Frameworks Applied:
${result.metadata.frameworks.map(f => `   • ${f}`).join('\n') || '   (none detected)'}
`);

    // Show issues if any
    const errors = result.qaResults.issues.filter(i => i.severity === 'error');
    const warnings = result.qaResults.issues.filter(i => i.severity === 'warning');

    if (errors.length > 0 || warnings.length > 0) {
      console.log('⚠️  Issues:');
      errors.forEach(e => console.log(`   ❌ ${e.message}`));
      warnings.forEach(w => console.log(`   ⚠️  ${w.message}`));
    }

    console.log('\n✨ Generation complete!');

  } catch (error) {
    if (error.name === 'QAFailureError') {
      console.error(`
❌ QA VALIDATION FAILED

Score: ${error.score}/100 (threshold: ${error.threshold})

Issues that must be fixed:
${error.getIssues().slice(0, 10).map(i => `  • ${i}`).join('\n')}

The presentation did not meet quality standards.
Fix the issues above or lower the threshold with --threshold.
`);
      process.exit(1);
    }

    if (error.name === 'ValidationError') {
      console.error(`
❌ VALIDATION ERROR

${error.errors.map(e => `  • ${e}`).join('\n')}
`);
      process.exit(1);
    }

    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Validate command
async function runValidate(inputPath, options, validate) {
  console.log(`
╔════════════════════════════════════════════════════════╗
║          Claude Presentation Master                    ║
║          Validating Presentation                       ║
╚════════════════════════════════════════════════════════╝
`);

  console.log(`📄 Validating: ${inputPath}`);
  console.log(`📋 Mode: ${options.mode}`);

  try {
    const content = readFileSync(inputPath, 'utf-8');

    const result = await validate(content, {
      mode: options.mode,
      threshold: options.threshold,
      strictMode: true
    });

    console.log(`
╔════════════════════════════════════════════════════════╗
║                    QA RESULTS                          ║
╚════════════════════════════════════════════════════════╝

📊 Score: ${result.score}/100 ${result.passed ? '✅ PASSED' : '❌ FAILED'}

Category Breakdown:
   Visual:        ${Math.round(result.visual?.whitespacePercentage ?? 0)}% whitespace
   Content:       ${result.content?.perSlide?.length ?? 0} slides analyzed
   Accessibility: WCAG ${result.accessibility?.wcagLevel ?? 'N/A'}
`);

    const errors = result.issues.filter(i => i.severity === 'error');
    const warnings = result.issues.filter(i => i.severity === 'warning');

    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach(e => console.log(`   • ${e.message}`));
    }

    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(w => console.log(`   • ${w.message}`));
    }

    process.exit(result.passed ? 0 : 1);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
