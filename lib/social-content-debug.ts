/**
 * Social Content Testing & Debugging Utilities
 * Helper functions for development and testing
 */

// ==========================================
// TEST DATA GENERATORS
// ==========================================

export const testProducts = [
  { id: 1, name: 'Premium Wireless Headphones', description: 'Noise-cancelling headphones with 30-hour battery' },
  { id: 2, name: 'Smart Watch Pro', description: 'Advanced fitness tracking and health monitoring' },
  { id: 3, name: 'Portable Charger 20000mAh', description: 'Fast charging portable power bank' },
  { id: 4, name: 'USB-C Hub 7-in-1', description: 'Multi-port connectivity hub for laptops' },
  { id: 5, name: 'Mechanical Keyboard RGB', description: 'Gaming keyboard with RGB lighting' },
];

export const testContentTypes = ['promotional', 'educational', 'engagement', 'announcement'];

export const testPlatforms = ['instagram', 'facebook'];

// ==========================================
// SAMPLE API RESPONSES
// ==========================================

export const sampleGeneratedContent = {
  instagram: {
    contentTitle: 'Exclusive Offer: Premium Wireless Headphones',
    contentBody:
      '🎧 Experience crystal-clear sound with our latest Wireless Headphones! 30-hour battery life means endless music. Active noise cancellation keeps you in your world. Limited time offer - grab yours today! 🎵',
    hashtags: ['#wirelessheadphones', '#noisecancelling', '#audiophile', '#techgear', '#soundquality'],
    callToAction: 'Shop Now - Link in bio',
    characterCount: 287,
    estimatedEngagement: {
      likes: 150,
      comments: 25,
      shares: 12,
    },
  },
  facebook: {
    contentTitle: 'Discover Sound Like Never Before',
    contentBody:
      'Introducing our premium wireless headphones - engineered for audiophiles and casual listeners alike. With 30-hour battery life, active noise cancellation, and crystal-clear sound quality, these headphones redefine portable audio. Whether you\'re commuting, working, or relaxing, enjoy an immersive listening experience. Available now with special launch pricing. Limited stock available!',
    hashtags: ['#audio', '#headphones', '#tech', '#soundquality', '#wireless'],
    callToAction: 'Buy Now',
    characterCount: 512,
    estimatedEngagement: {
      likes: 320,
      comments: 48,
      shares: 25,
    },
  },
};

// ==========================================
// CURL COMMAND GENERATORS
// ==========================================

export function generateContentCurl(
  productId: number = 1,
  platform: 'instagram' | 'facebook' = 'instagram',
  contentType: string = 'promotional'
): string {
  return `
curl -X POST http://localhost:3000/api/social-content \\
  -H "Content-Type: application/json" \\
  -d '{
    "productId": ${productId},
    "platform": "${platform}",
    "contentType": "${contentType}",
    "action": "generate"
  }'
  `.trim();
}

export function createScheduleCurl(
  frequency: 'daily' | 'weekly' = 'daily',
  timeOfDay: string = '09:00'
): string {
  return `
curl -X POST http://localhost:3000/api/social-automation \\
  -H "Content-Type: application/json" \\
  -d '{
    "frequency": "${frequency}",
    "timeOfDay": "${timeOfDay}",
    "generateCount": 3,
    "selectedPlatforms": ["instagram", "facebook"],
    "contentType": "promotional"
  }'
  `.trim();
}

export function triggerAutomationCurl(cronSecret: string): string {
  return `
curl -X POST http://localhost:3000/api/cron/social-content \\
  -H "Authorization: Bearer ${cronSecret}" \\
  -H "Content-Type: application/json"
  `.trim();
}

// ==========================================
// DEBUGGING HELPERS
// ==========================================

export function logApiRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): void {
  console.log(`
📤 API REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Method:   ${method}
Endpoint: ${endpoint}
${body ? `Payload:  ${JSON.stringify(body, null, 2)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

export function logApiResponse(status: number, data: unknown, duration: number): void {
  const statusColor = status >= 200 && status < 300 ? '✅' : '❌';
  console.log(`
📥 API RESPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:   ${statusColor} ${status}
Duration: ${duration}ms
Data:     ${JSON.stringify(data, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

export function logAutomationRun(
  scheduleId: string,
  status: 'started' | 'completed' | 'failed',
  details?: Record<string, unknown>
): void {
  const icon = status === 'started' ? '🚀' : status === 'completed' ? '✅' : '❌';
  console.log(`
${icon} AUTOMATION RUN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Schedule ID: ${scheduleId}
Status:      ${status}
Time:        ${new Date().toISOString()}
${details ? `Details:     ${JSON.stringify(details, null, 2)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

export function logAiGeneration(
  productName: string,
  platform: string,
  success: boolean,
  tokensUsed?: number
): void {
  const icon = success ? '🤖' : '⚠️';
  console.log(`
${icon} AI GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product:  ${productName}
Platform: ${platform}
Status:   ${success ? 'Success' : 'Failed'}
${tokensUsed ? `Tokens:   ${tokensUsed}` : ''}
Time:     ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// ==========================================
// TEST ASSERTIONS
// ==========================================

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

export function assertContentGenerated(content: unknown): TestResult {
  try {
    const c = content as any;
    const passed = !!(c.contentTitle && c.contentBody && Array.isArray(c.hashtags));
    return {
      name: 'Content Generated',
      passed,
      message: passed ? 'Content structure valid' : 'Content structure invalid',
      details: content,
    };
  } catch (error) {
    return {
      name: 'Content Generated',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function assertScheduleCreated(schedule: unknown): TestResult {
  try {
    const s = schedule as any;
    const passed = !!(
      s.id &&
      s.frequency &&
      s.next_run_at &&
      Array.isArray(s.selectedPlatforms)
    );
    return {
      name: 'Schedule Created',
      passed,
      message: passed ? 'Schedule structure valid' : 'Schedule structure invalid',
      details: schedule,
    };
  } catch (error) {
    return {
      name: 'Schedule Created',
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function assertApiResponse(response: any, expectedStatus: number): TestResult {
  const passed = response?.status === expectedStatus;
  return {
    name: `API Response Status ${expectedStatus}`,
    passed,
    message: passed ? `Status ${expectedStatus} received` : `Expected ${expectedStatus}, got ${response?.status}`,
    details: response,
  };
}

export function printTestResults(results: TestResult[]): void {
  console.log(`
📋 TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  const passCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ${passCount}/${totalCount} passed
  `);
}

// ==========================================
// CHECKLIST BUILDERS
// ==========================================

export const setupChecklist = [
  { task: 'Create .env.local file', completed: false },
  { task: 'Add OPENAI_API_KEY', completed: false },
  { task: 'Add FACEBOOK_APP_ID', completed: false },
  { task: 'Add DATABASE_URL', completed: false },
  { task: 'Add CRON_SECRET', completed: false },
  { task: 'Install dependencies', completed: false },
  { task: 'Run database migration', completed: false },
  { task: 'Verify tables created', completed: false },
  { task: 'Start dev server', completed: false },
  { task: 'Access admin panel', completed: false },
];

export const testingChecklist = [
  { task: 'Test AI content generation', completed: false },
  { task: 'Test Instagram content format', completed: false },
  { task: 'Test Facebook content format', completed: false },
  { task: 'Test content editor UI', completed: false },
  { task: 'Test automation schedule creation', completed: false },
  { task: 'Test social account connection', completed: false },
  { task: 'Test content posting API', completed: false },
  { task: 'Test analytics dashboard', completed: false },
  { task: 'Test cron job trigger', completed: false },
  { task: 'Test error handling', completed: false },
];

export const deploymentChecklist = [
  { task: 'Push code to GitHub', completed: false },
  { task: 'Configure Vercel project', completed: false },
  { task: 'Set environment variables', completed: false },
  { task: 'Deploy to production', completed: false },
  { task: 'Verify cron job running', completed: false },
  { task: 'Monitor logs', completed: false },
  { task: 'Test content generation in production', completed: false },
  { task: 'Set up monitoring/alerts', completed: false },
  { task: 'Document access procedures', completed: false },
  { task: 'Create user guide', completed: false },
];

export function printChecklist(checklist: Array<{ task: string; completed: boolean }>): void {
  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  console.log(`
📝 CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  checklist.forEach((item, index) => {
    const icon = item.completed ? '✅' : '⬜';
    console.log(`${icon} ${index + 1}. ${item.task}`);
  });

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: ${completedCount}/${totalCount} (${percentage}%)
  `);
}

// ==========================================
// QUICK START COMMANDS
// ==========================================

export const quickStartCommands = {
  setup: 'npm install && npm run db:init',
  dev: 'npm run dev',
  test: 'npm test',
  deploy: 'git push && vercel deploy',
  logs: 'vercel logs --tail',
  generateContent: `curl -X POST http://localhost:3000/api/social-content -H "Content-Type: application/json" -d '{"productId": 1, "platform": "instagram", "contentType": "promotional", "action": "generate"}'`,
  createSchedule: `curl -X POST http://localhost:3000/api/social-automation -H "Content-Type: application/json" -d '{"frequency": "daily", "timeOfDay": "09:00", "generateCount": 3, "selectedPlatforms": ["instagram", "facebook"], "contentType": "promotional"}'`,
  triggerCron: 'curl -X POST http://localhost:3000/api/cron/social-content -H "Authorization: Bearer YOUR_CRON_SECRET"',
};

export function printQuickStart(): void {
  console.log(`
🚀 QUICK START COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Setup & Install
   ${quickStartCommands.setup}

2. Start Development Server
   ${quickStartCommands.dev}

3. Test Content Generation
   ${quickStartCommands.generateContent}

4. Create Automation Schedule
   ${quickStartCommands.createSchedule}

5. Trigger Automation
   ${quickStartCommands.triggerCron}

6. Check Logs
   ${quickStartCommands.logs}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

export function validateEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET',
    'CRON_SECRET',
  ];

  const optional = [
    'ANTHROPIC_API_KEY',
    'REDIS_URL',
    'LOG_LEVEL',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  optional.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(`Optional: ${key} not set`);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function printEnvironmentValidation(): void {
  const validation = validateEnvironment();
  console.log(`
🔍 ENVIRONMENT VALIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${validation.valid ? '✅ Valid' : '❌ Missing Variables'}
  `);

  if (validation.missing.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    validation.missing.forEach((key) => {
      console.log(`   - ${key}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach((warning) => {
      console.log(`   - ${warning}`);
    });
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

export default {
  testProducts,
  testContentTypes,
  testPlatforms,
  sampleGeneratedContent,
  generateContentCurl,
  createScheduleCurl,
  triggerAutomationCurl,
  logApiRequest,
  logApiResponse,
  logAutomationRun,
  logAiGeneration,
  assertContentGenerated,
  assertScheduleCreated,
  assertApiResponse,
  printTestResults,
  setupChecklist,
  testingChecklist,
  deploymentChecklist,
  printChecklist,
  quickStartCommands,
  printQuickStart,
  validateEnvironment,
  printEnvironmentValidation,
};
