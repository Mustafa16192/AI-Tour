const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const reportOnly = process.argv.includes('--report-only');
const root = path.resolve(__dirname, '..');

function parseFile(relativePath) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  return parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx'],
  });
}

function calleeName(node) {
  if (!node || node.type !== 'CallExpression') return '';
  if (node.callee.type === 'Identifier') return node.callee.name;
  if (node.callee.type === 'MemberExpression' && !node.callee.computed) {
    return node.callee.property.name || '';
  }
  return '';
}

function callsIn(ast, name) {
  let found = false;
  traverse(ast, {
    CallExpression(nodePath) {
      if (calleeName(nodePath.node) === name) found = true;
    },
  });
  return found;
}

function hasIdentifier(ast, name) {
  let found = false;
  traverse(ast, {
    Identifier(nodePath) {
      if (nodePath.node.name === name) found = true;
    },
  });
  return found;
}

function hasProcessEnvProperties(ast, properties) {
  const found = new Set();
  traverse(ast, {
    MemberExpression(nodePath) {
      const node = nodePath.node;
      if (
        node.object.type === 'MemberExpression'
        && node.object.object.type === 'Identifier'
        && node.object.object.name === 'process'
        && node.object.property.name === 'env'
      ) {
        found.add(node.property.name);
      }
    },
  });
  return properties.every(property => found.has(property));
}

function hasJSXAttribute(ast, name, value) {
  let found = false;
  traverse(ast, {
    JSXAttribute(nodePath) {
      const node = nodePath.node;
      if (node.name.name === name && node.value?.value === value) found = true;
    },
  });
  return found;
}

function functionHasCall(ast, functionName, callName) {
  let found = false;
  traverse(ast, {
    FunctionDeclaration(functionPath) {
      if (functionPath.node.id?.name !== functionName) return;
      functionPath.traverse({
        CallExpression(callPath) {
          if (calleeName(callPath.node) === callName) found = true;
        },
      });
    },
  });
  return found;
}

function functionHasTryFinally(ast, functionName) {
  let found = false;
  traverse(ast, {
    FunctionDeclaration(functionPath) {
      if (functionPath.node.id?.name !== functionName) return;
      functionPath.traverse({
        TryStatement(tryPath) {
          if (tryPath.node.handler && tryPath.node.finalizer) found = true;
        },
      });
    },
  });
  return found;
}

function inspectProgress() {
  const config = parseFile('ai/config.js');
  const client = parseFile('ai/client.js');
  const service = parseFile('ai/planService.js');
  const app = parseFile('App.js');

  return [
    {
      title: 'PART 1: AI settings are loaded from local environment values',
      complete: hasProcessEnvProperties(config, [
        'EXPO_PUBLIC_AI_API_KEY',
        'EXPO_PUBLIC_AI_BASE_URL',
        'EXPO_PUBLIC_AI_MODEL',
      ]) && functionHasCall(config, 'getAIConfig', 'entries'),
      guidance: 'In ai/config.js, keep the three EXPO_PUBLIC_AI_* settings and the missing-setting validation active.',
    },
    {
      title: 'PART 2: OpenAI chat request uses app context and compatible token limits',
      complete: callsIn(client, 'createOpenAI')
        && callsIn(service, 'generateText')
        && functionHasCall(service, 'generateFocusPlan', 'getPlanPrompt')
        && functionHasCall(service, 'generateFocusPlan', 'chat')
        && hasIdentifier(service, 'maxCompletionTokens'),
      guidance: 'In ai/client.js, enable createOpenAI() with the endpoint and key; in ai/planService.js, select provider.chat(model) and set openai.maxCompletionTokens.',
    },
    {
      title: 'PART 3: Model output is parsed and validated before rendering',
      complete: callsIn(service, 'parse')
        && hasIdentifier(service, 'availableMinutes')
        && hasIdentifier(service, 'steps')
        && functionHasCall(service, 'parseFocusPlan', 'reduce')
        && functionHasCall(service, 'generateFocusPlan', 'parseFocusPlan'),
      guidance: 'In ai/planService.js, enable parseFocusPlan() and reject malformed fields or steps that exceed the available time.',
    },
    {
      title: 'PART 4: The learner can complete generated plan steps',
      complete: hasJSXAttribute(app, 'accessibilityRole', 'checkbox')
        && functionHasCall(app, 'toggleStep', 'setCompletedSteps')
        && hasIdentifier(app, 'completedCount'),
      guidance: 'In App.js, enable the checklist Pressable, toggleStep() state update, and completion count.',
    },
    {
      title: 'PART 5: Requests show loading and recoverable errors',
      complete: functionHasTryFinally(app, 'createPlan')
        && functionHasCall(app, 'createPlan', 'setIsGenerating')
        && functionHasCall(app, 'createPlan', 'setError')
        && hasIdentifier(app, 'isGenerating'),
      guidance: 'In App.js, replace the starter createPlan() body with its try/catch/finally request block and disable duplicate submits while loading.',
    },
  ];
}

try {
  const checks = inspectProgress();
  const completeCount = checks.filter(check => check.complete).length;
  console.log('Pocket Plan Tour Progress\n');
  checks.forEach(check => {
    console.log(`${check.complete ? '✓' : '✗'} ${check.title}`);
    if (!check.complete) console.log(`  Next: ${check.guidance}`);
  });
  console.log(`\n${completeCount} of ${checks.length} parts complete`);
  if (reportOnly && completeCount !== checks.length) console.log('Report-only mode: incomplete lessons do not fail this command.');
  else if (completeCount !== checks.length) process.exitCode = 1;
} catch (error) {
  console.error('Progress checker could not parse the JavaScript lesson files.');
  console.error(error.stack || error.message);
  process.exitCode = 2;
}
