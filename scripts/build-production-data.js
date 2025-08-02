#!/usr/bin/env node

/**
 * Production-ready script to build all data files for DengeAI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateThumbnails } = require('./generate-thumbnails');
const { validateData } = require('./validate-json-data');

const CONFIG = {
  basePromptsDir: './apps/web/public/data/base-prompts',
  baseCategoriesDir: './apps/web/public/data/base-prompt-categories',
  outputFile: './apps/web/public/data/prompts.json',
  optimizedDir: './apps/web/public/data/optimized'
};

function ensureDirectories() {
  [CONFIG.optimizedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function loadBasePrompts() {
  const prompts = [];

  if (!fs.existsSync(CONFIG.basePromptsDir)) {
    console.log('⚠️  Base prompts directory not found');
    return prompts;
  }

  const files = fs.readdirSync(CONFIG.basePromptsDir).filter(f => f.endsWith('.json'));

  for (const filename of files) {
    try {
      const filePath = path.join(CONFIG.basePromptsDir, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      prompts.push(data);
    } catch (error) {
      console.log(`❌ Error loading ${filename}: ${error.message}`);
    }
  }

  return prompts;
}

function loadBaseCategories() {
  const categories = [];

  if (!fs.existsSync(CONFIG.baseCategoriesDir)) {
    console.log('⚠️  Base categories directory not found');
    return categories;
  }

  const files = fs.readdirSync(CONFIG.baseCategoriesDir).filter(f => f.endsWith('.json'));

  for (const filename of files) {
    try {
      const filePath = path.join(CONFIG.baseCategoriesDir, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      categories.push(data);
    } catch (error) {
      console.log(`❌ Error loading ${filename}: ${error.message}`);
    }
  }

  return categories;
}

function buildPromptsJson() {
  console.log('🔨 Building prompts.json...');

  const basePrompts = loadBasePrompts();
  const baseCategories = loadBaseCategories();

  // Group prompts by category
  const promptsByCategory = {};
  basePrompts.forEach(prompt => {
    if (!promptsByCategory[prompt.category]) {
      promptsByCategory[prompt.category] = [];
    }
    promptsByCategory[prompt.category].push(prompt);
  });

  // Build final structure
  const categories = [];

  // Add categories with prompts
  Object.keys(promptsByCategory).forEach(categoryName => {
    categories.push({
      category: categoryName,
      prompts: promptsByCategory[categoryName]
    });
  });

  // Add categories without prompts (from base categories)
  baseCategories.forEach(baseCat => {
    if (!promptsByCategory[baseCat.category]) {
      categories.push({
        category: baseCat.category,
        prompts: baseCat.examples || []
      });
    }
  });

  const result = { categories };

  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(result, null, 2));
  console.log(`✅ Built prompts.json with ${categories.length} categories and ${basePrompts.length} total prompts`);

  return result;
}

function buildOptimizedData() {
  console.log('⚡ Building optimized data files...');

  try {
    // Run the existing build script if it exists
    const buildScript = './scripts/build-public-data.js';
    if (fs.existsSync(buildScript)) {
      execSync(`node ${buildScript}`, { stdio: 'inherit' });
      console.log('✅ Built optimized data files');
    } else {
      console.log('⚠️  Optimized data build script not found, skipping');
    }
  } catch (error) {
    console.log(`❌ Error building optimized data: ${error.message}`);
  }
}

async function buildAll() {
  console.log('🚀 Starting production data build...\n');

  try {
    // Step 1: Ensure directories exist
    ensureDirectories();

    // Step 2: Generate missing thumbnails
    console.log('📸 Step 1: Generating thumbnails...');
    await generateThumbnails();
    console.log('');

    // Step 3: Build prompts.json
    console.log('📝 Step 2: Building prompts.json...');
    buildPromptsJson();
    console.log('');

    // Step 4: Build optimized data
    console.log('⚡ Step 3: Building optimized data...');
    buildOptimizedData();
    console.log('');

    // Step 5: Validate all data
    console.log('🔍 Step 4: Validating data...');
    const isValid = await validateData();
    console.log('');

    if (isValid) {
      console.log('🎉 Production build completed successfully!');
      console.log('📦 All data files are ready for deployment');
    } else {
      console.log('❌ Production build completed with validation errors');
      console.log('🔧 Please fix the errors above before deploying');
      process.exit(1);
    }

  } catch (error) {
    console.log(`❌ Production build failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  buildAll().catch(console.error);
}

module.exports = { buildAll, buildPromptsJson };
