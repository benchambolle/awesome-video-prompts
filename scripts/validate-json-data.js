#!/usr/bin/env node

/**
 * Comprehensive data validation script for DengeAI JSON files
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CONFIG = {
    basePromptsDir: './apps/web/public/data/base-prompts',
    baseCategoriesDir: './apps/web/public/data/base-prompt-categories',
    promptCategoriesDir: './apps/web/public/data/prompt-categories',
    customPromptsDir: './apps/web/public/data/prompts/custom',
    categoriesFile: './apps/web/public/data/categories.json',
    promptsFile: './apps/web/public/data/prompts.json'
};

let errors = [];
let warnings = [];

function validateJsonSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return true;
    } catch (error) {
        errors.push(`❌ JSON Syntax Error in ${filePath}: ${error.message}`);
        return false;
    }
}

function validateUrl(url) {
    try {
        // Allow relative URLs starting with /
        if (url.startsWith('/')) {
            return true;
        }
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

async function checkUrlExists(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https:') ? https : http;
        const request = protocol.request(url, { method: 'HEAD' }, (response) => {
            resolve(response.statusCode >= 200 && response.statusCode < 400);
        });

        request.on('error', () => resolve(false));
        request.setTimeout(5000, () => {
            request.destroy();
            resolve(false);
        });
        request.end();
    });
}

function validateBasePrompt(data, filename) {
    const required = ['value', 'category', 'example'];

    for (const field of required) {
        if (!data[field]) {
            errors.push(`❌ Missing required field '${field}' in ${filename}`);
        }
    }

    if (data.example) {
        if (!data.example.type || !data.example.url) {
            errors.push(`❌ Invalid example structure in ${filename}`);
        } else if (!validateUrl(data.example.url)) {
            errors.push(`❌ Invalid example URL in ${filename}: ${data.example.url}`);
        }
    }

    if (data.thumbnail && data.thumbnail.url && !validateUrl(data.thumbnail.url)) {
        errors.push(`❌ Invalid thumbnail URL in ${filename}: ${data.thumbnail.url}`);
    }
}

function validateBaseCategory(data, filename) {
    const required = ['category'];

    for (const field of required) {
        if (!data[field]) {
            errors.push(`❌ Missing required field '${field}' in ${filename}`);
        }
    }

    if (data.examples && Array.isArray(data.examples)) {
        data.examples.forEach((example, index) => {
            if (!example.value || !example.example || !example.example.url) {
                errors.push(`❌ Invalid example structure at index ${index} in ${filename}`);
            } else if (!validateUrl(example.example.url)) {
                errors.push(`❌ Invalid example URL at index ${index} in ${filename}: ${example.example.url}`);
            }
        });
    }
}

function validatePromptCategory(data, filename) {
    const required = ['name', 'description', 'icon', 'color'];

    for (const field of required) {
        if (!data[field]) {
            errors.push(`❌ Missing required field '${field}' in ${filename}`);
        }
    }

    if (data.examples && !Array.isArray(data.examples)) {
        errors.push(`❌ Examples must be an array in ${filename}`);
    }

    if (data.tags && !Array.isArray(data.tags)) {
        errors.push(`❌ Tags must be an array in ${filename}`);
    }
}

function validateCustomPrompt(data, filename) {
    const required = ['id', 'title', 'description', 'category'];

    for (const field of required) {
        if (!data[field]) {
            errors.push(`❌ Missing required field '${field}' in ${filename}`);
        }
    }

    if (data.video && data.video.url && !validateUrl(data.video.url)) {
        errors.push(`❌ Invalid video URL in ${filename}: ${data.video.url}`);
    }

    if (data.thumbnailUrl && !validateUrl(data.thumbnailUrl)) {
        errors.push(`❌ Invalid thumbnail URL in ${filename}: ${data.thumbnailUrl}`);
    }
}

async function validateDirectory(dirPath, validator, description) {
    if (!fs.existsSync(dirPath)) {
        warnings.push(`⚠️  Directory not found: ${dirPath}`);
        return;
    }

    console.log(`📁 Validating ${description}...`);

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    for (const filename of files) {
        const filePath = path.join(dirPath, filename);

        if (validateJsonSyntax(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            validator(data, filename);
        }
    }

    console.log(`✅ Validated ${files.length} files in ${description}`);
}

async function validateSingleFile(filePath, validator, description) {
    if (!fs.existsSync(filePath)) {
        warnings.push(`⚠️  File not found: ${filePath}`);
        return;
    }

    console.log(`📄 Validating ${description}...`);

    if (validateJsonSyntax(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        validator(data, path.basename(filePath));
    }

    console.log(`✅ Validated ${description}`);
}

function validateCategories(data, filename) {
    // Handle both array format and object with categories array
    const categories = Array.isArray(data) ? data : data.categories;

    if (!Array.isArray(categories)) {
        errors.push(`❌ Categories.json must contain a categories array`);
        return;
    }

    categories.forEach((category, index) => {
        if (!category.name || !category.description) {
            errors.push(`❌ Invalid category at index ${index} in ${filename}`);
        }
    });
}

function validatePrompts(data, filename) {
    if (!data.categories || !Array.isArray(data.categories)) {
        errors.push(`❌ Prompts.json must have categories array`);
        return;
    }

    data.categories.forEach((category, catIndex) => {
        if (!category.category || !category.prompts) {
            errors.push(`❌ Invalid category structure at index ${catIndex} in ${filename}`);
            return;
        }

        if (!Array.isArray(category.prompts)) {
            errors.push(`❌ Prompts must be an array in category ${category.category}`);
            return;
        }

        category.prompts.forEach((prompt, promptIndex) => {
            if (!prompt.value || !prompt.example || !prompt.example.url) {
                errors.push(`❌ Invalid prompt at index ${promptIndex} in category ${category.category}`);
            }
        });
    });
}

async function validateData() {
    console.log('🔍 Starting comprehensive data validation...\n');

    // Validate base prompts
    await validateDirectory(
        CONFIG.basePromptsDir,
        validateBasePrompt,
        'Base Prompts'
    );

    // Validate base categories
    await validateDirectory(
        CONFIG.baseCategoriesDir,
        validateBaseCategory,
        'Base Prompt Categories'
    );

    // Validate prompt categories
    await validateDirectory(
        CONFIG.promptCategoriesDir,
        validatePromptCategory,
        'Prompt Categories'
    );

    // Validate custom prompts
    await validateDirectory(
        CONFIG.customPromptsDir,
        validateCustomPrompt,
        'Custom Prompts'
    );

    // Validate categories.json
    await validateSingleFile(
        CONFIG.categoriesFile,
        validateCategories,
        'Categories JSON'
    );

    // Validate prompts.json
    await validateSingleFile(
        CONFIG.promptsFile,
        validatePrompts,
        'Prompts JSON'
    );

    // Report results
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}\n`);

    if (errors.length > 0) {
        console.log('❌ ERRORS:');
        errors.forEach(error => console.log(error));
        console.log('');
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        warnings.forEach(warning => console.log(warning));
        console.log('');
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('🎉 All data files are valid!');
    }

    return errors.length === 0;
}

if (require.main === module) {
    validateData().then(isValid => {
        process.exit(isValid ? 0 : 1);
    }).catch(console.error);
}

module.exports = { validateData };
