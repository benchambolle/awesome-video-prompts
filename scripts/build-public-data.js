const fs = require('fs');
const path = require('path');

// Source and destination paths
const SOURCE_DATA_DIR = path.join(__dirname, '../apps/web/public/data');
const PUBLIC_DATA_DIR = path.join(__dirname, '../apps/web/public/data');

// Ensure public data directory exists
if (!fs.existsSync(PUBLIC_DATA_DIR)) {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
}

// Helper function to read JSON file safely
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return null;
  }
}

// Helper function to write JSON file with pretty formatting
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// 1. Copy and optimize categories
function buildCategories() {
  console.log('📂 Building categories...');
  
  const categoriesData = readJsonFile(path.join(SOURCE_DATA_DIR, 'categories.json'));
  if (categoriesData) {
    // Add metadata for filtering and search
    const optimizedCategories = {
      ...categoriesData,
      metadata: {
        ...categoriesData.metadata,
        buildTime: new Date().toISOString(),
        totalCategories: categoriesData.categories.length,
        categoryIds: categoriesData.categories.map(cat => cat.id),
        searchIndex: categoriesData.categories.map(cat => ({
          id: cat.id,
          name: cat.name.toLowerCase(),
          description: cat.description?.toLowerCase() || '',
          tags: cat.tags || [],
          searchTerms: [
            cat.name.toLowerCase(),
            ...(cat.tags || []),
            ...(cat.examples || []).map(ex => ex.toLowerCase())
          ].filter(Boolean)
        }))
      }
    };
    
    writeJsonFile(path.join(PUBLIC_DATA_DIR, 'categories.json'), optimizedCategories);
    console.log(`✅ Categories: ${categoriesData.categories.length} items`);
  }
}

// 2. Combine and optimize all models
function buildModels() {
  console.log('📂 Building models...');
  
  const modelsDir = path.join(SOURCE_DATA_DIR, 'models');
  if (!fs.existsSync(modelsDir)) {
    console.warn('Models directory not found');
    return;
  }
  
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.json'));
  const allModels = [];
  
  for (const file of modelFiles) {
    const modelData = readJsonFile(path.join(modelsDir, file));
    if (modelData) {
      // Extract only essential filterable fields
      const optimizedModel = {
        model_id: modelData.model_id,
        display_name: modelData.display_name,
        description: modelData.description,
        category: modelData.category,
        provider: modelData.provider,
        status: modelData.status,
        tags: modelData.features?.tags || [],
        searchTerms: [
          modelData.display_name?.toLowerCase(),
          modelData.model_id?.toLowerCase(),
          modelData.category?.toLowerCase(),
          modelData.provider?.toLowerCase(),
          ...(modelData.features?.tags || []).map(tag => tag.toLowerCase())
        ].filter(Boolean)
      };
      
      allModels.push(optimizedModel);
    }
  }
  
  // Group models by category and provider for easier filtering
  const modelsByCategory = {};
  const modelsByProvider = {};
  
  allModels.forEach(model => {
    const category = model.category || 'other';
    const provider = model.provider || 'unknown';
    
    if (!modelsByCategory[category]) modelsByCategory[category] = [];
    if (!modelsByProvider[provider]) modelsByProvider[provider] = [];
    
    modelsByCategory[category].push(model.model_id);
    modelsByProvider[provider].push(model.model_id);
  });
  
  const optimizedModels = {
    models: allModels,
    metadata: {
      buildTime: new Date().toISOString(),
      totalModels: allModels.length,
      categories: Object.keys(modelsByCategory),
      providers: Object.keys(modelsByProvider),
      modelsByCategory,
      modelsByProvider,
      searchIndex: allModels.map(model => ({
        id: model.model_id,
        name: model.display_name?.toLowerCase() || '',
        category: model.category?.toLowerCase() || '',
        provider: model.provider?.toLowerCase() || '',
        searchTerms: model.searchTerms
      }))
    }
  };
  
  writeJsonFile(path.join(PUBLIC_DATA_DIR, 'models.json'), optimizedModels);
  console.log(`✅ Models: ${allModels.length} items`);
}

// 3. Build model prompts (general prompt categories)
function buildModelPrompts() {
  console.log('📂 Building model prompts...');
  
  const modelPromptsFile = path.join(SOURCE_DATA_DIR, 'model-prompts/prompts.json');
  const modelPromptsData = readJsonFile(modelPromptsFile);
  
  if (modelPromptsData && modelPromptsData.prompt_details) {
    // Add search and filtering metadata
    const categories = Object.keys(modelPromptsData.prompt_details);
    const allValues = [];
    
    Object.entries(modelPromptsData.prompt_details).forEach(([category, data]) => {
      data.values.forEach(value => {
        allValues.push({
          category,
          value: value.value,
          prompt: value.prompt,
          videoPrompt: value['video-generation-prompt'],
          searchTerms: [
            value.value?.toLowerCase(),
            category.toLowerCase(),
            value.prompt?.toLowerCase()
          ].filter(Boolean)
        });
      });
    });
    
    const optimizedModelPrompts = {
      ...modelPromptsData,
      metadata: {
        buildTime: new Date().toISOString(),
        totalCategories: categories.length,
        totalValues: allValues.length,
        categories,
        searchIndex: allValues
      }
    };
    
    writeJsonFile(path.join(PUBLIC_DATA_DIR, 'model-prompts.json'), optimizedModelPrompts);
    console.log(`✅ Model Prompts: ${categories.length} categories, ${allValues.length} values`);
  }
}

// 4. Combine and optimize all custom prompts
function buildCustomPrompts() {
  console.log('📂 Building custom prompts...');
  
  const promptsDir = path.join(SOURCE_DATA_DIR, 'prompts');
  if (!fs.existsSync(promptsDir)) {
    console.warn('Prompts directory not found');
    return;
  }
  
  const allPrompts = [];
  const categories = new Set();
  const sources = new Set();
  const models = new Set();
  
  // Read main prompts directory
  const mainPromptFiles = fs.readdirSync(promptsDir).filter(file => file.endsWith('.json'));
  
  for (const file of mainPromptFiles) {
    const promptData = readJsonFile(path.join(promptsDir, file));
    if (promptData) {
      // Extract only essential filterable fields
      const optimizedPrompt = {
        id: promptData.id,
        title: promptData.title,
        description: promptData.description,
        category: promptData.category,
        tags: promptData.tags || [],
        source: promptData.source || 'main',
        modelName: promptData.modelName || promptData.supportedModels?.[0] || '',
        status: promptData.status || 'active',
        featured: promptData.featured || false,
        thumbnailUrl: promptData.thumbnailUrl,
        video: promptData.video || promptData.exampleOutputUrl,
        prompt: promptData.prompt || promptData.plainTextPrompt?.content,
        searchTerms: [
          promptData.title?.toLowerCase(),
          promptData.description?.toLowerCase(),
          promptData.category?.toLowerCase(),
          promptData.plainTextPrompt?.content?.toLowerCase(),
          ...(promptData.tags || []).map(tag => 
            typeof tag === 'string' ? tag.toLowerCase() : tag.name?.toLowerCase()
          )
        ].filter(Boolean)
      };
      
      allPrompts.push(optimizedPrompt);
      
      if (optimizedPrompt.category) categories.add(optimizedPrompt.category);
      if (optimizedPrompt.source) sources.add(optimizedPrompt.source);
      if (optimizedPrompt.modelName) models.add(optimizedPrompt.modelName);
    }
  }
  
  // Read custom subdirectory (skip model prompt files)
  const customDir = path.join(promptsDir, 'custom');
  if (fs.existsSync(customDir)) {
    const customFiles = fs.readdirSync(customDir).filter(file => file.endsWith('.json'));
    
    for (const file of customFiles) {
      const promptData = readJsonFile(path.join(customDir, file));
      if (promptData) { // Include all custom prompt files
        const promptId = promptData.id || path.basename(file, '.json');
        const title = promptData.title || 
          promptId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        const optimizedPrompt = {
          id: promptId,
          title,
          description: promptData.description,
          category: promptData.category || 'general',
          tags: promptData.tags || [],
          source: promptData.source || 'custom',
          modelName: promptData.modelName || promptData.supportedModels?.[0] || '',
          status: promptData.status || 'active',
          featured: promptData.featured || false,
          thumbnailUrl: promptData.thumbnailUrl || promptData.thumbnail?.url,
          video: promptData.video || promptData.example_output_url,
          generationType: promptData.generationType || 'text_to_video',
          prompt: promptData.prompt || promptData.plainTextPrompt?.content,
          searchTerms: [
            title.toLowerCase(),
            promptData.description?.toLowerCase(),
            (promptData.category || 'general').toLowerCase(),
            promptData.plainTextPrompt?.content?.toLowerCase() || promptData.prompt?.toLowerCase(),
            ...(promptData.tags || []).map(tag => 
              typeof tag === 'string' ? tag.toLowerCase() : tag.name?.toLowerCase()
            )
          ].filter(Boolean)
        };
        
        allPrompts.push(optimizedPrompt);
        
        if (optimizedPrompt.category) categories.add(optimizedPrompt.category);
        if (optimizedPrompt.source) {
          const sourceName = typeof optimizedPrompt.source === 'object' && optimizedPrompt.source.type 
            ? optimizedPrompt.source.type 
            : typeof optimizedPrompt.source === 'object' && optimizedPrompt.source.name 
            ? optimizedPrompt.source.name 
            : optimizedPrompt.source;
          sources.add(sourceName);
        }
        if (optimizedPrompt.modelName) models.add(optimizedPrompt.modelName);
      }
    }
  }
  
  // Group prompts for easier filtering
  const promptsByCategory = {};
  const promptsBySource = {};
  const promptsByModel = {};
  
  allPrompts.forEach(prompt => {
    const category = prompt.category || 'general';
    const source = typeof prompt.source === 'object' && prompt.source.type 
      ? prompt.source.type 
      : typeof prompt.source === 'object' && prompt.source.name 
      ? prompt.source.name 
      : (prompt.source || 'unknown');
    
    if (!promptsByCategory[category]) promptsByCategory[category] = [];
    if (!promptsBySource[source]) promptsBySource[source] = [];
    
    promptsByCategory[category].push(prompt.id);
    promptsBySource[source].push(prompt.id);
    
    if (prompt.modelName) {
      if (!promptsByModel[prompt.modelName]) promptsByModel[prompt.modelName] = [];
      promptsByModel[prompt.modelName].push(prompt.id);
    }
  });
  
  const optimizedPrompts = {
    prompts: allPrompts,
    metadata: {
      buildTime: new Date().toISOString(),
      totalPrompts: allPrompts.length,
      categories: Array.from(categories),
      sources: Array.from(sources),
      supportedModels: Array.from(models),
      promptsByCategory,
      promptsBySource,
      promptsByModel,
      searchIndex: allPrompts.map(prompt => ({
        id: prompt.id,
        title: prompt.title?.toLowerCase() || '',
        category: prompt.category?.toLowerCase() || '',
        source: (typeof prompt.source === 'object' && prompt.source.type 
          ? prompt.source.type 
          : typeof prompt.source === 'object' && prompt.source.name 
          ? prompt.source.name 
          : prompt.source)?.toLowerCase() || '',
        searchTerms: prompt.searchTerms
      }))
    }
  };
  
  writeJsonFile(path.join(PUBLIC_DATA_DIR, 'custom-prompts.json'), optimizedPrompts);
  console.log(`✅ Custom Prompts: ${allPrompts.length} items`);
}

// 5. Create a combined index file for quick overview
function buildIndex() {
  console.log('📂 Building index...');
  
  const categoriesData = readJsonFile(path.join(PUBLIC_DATA_DIR, 'categories.json'));
  const modelsData = readJsonFile(path.join(PUBLIC_DATA_DIR, 'models.json'));
  const modelPromptsData = readJsonFile(path.join(PUBLIC_DATA_DIR, 'model-prompts.json'));
  const customPromptsData = readJsonFile(path.join(PUBLIC_DATA_DIR, 'custom-prompts.json'));
  
  const indexData = {
    buildTime: new Date().toISOString(),
    version: '1.0.0',
    summary: {
      categories: categoriesData?.metadata?.totalCategories || 0,
      models: modelsData?.metadata?.totalModels || 0,
      modelPrompts: modelPromptsData?.metadata?.totalValues || 0,
      customPrompts: customPromptsData?.metadata?.totalPrompts || 0
    },
    endpoints: {
      categories: '/data/categories.json',
      models: '/data/models.json',
      modelPrompts: '/data/model-prompts.json',
      customPrompts: '/data/custom-prompts.json'
    },
    searchableFields: {
      categories: ['name', 'description', 'tags'],
      models: ['display_name', 'model_id', 'category', 'provider'],
      modelPrompts: ['category', 'value', 'prompt'],
      customPrompts: ['title', 'description', 'category', 'tags']
    }
  };
  
  writeJsonFile(path.join(PUBLIC_DATA_DIR, 'index.json'), indexData);
  console.log('✅ Index created');
}

// Main execution
function main() {
  console.log('🚀 Building optimized public data files...\n');
  
  try {
    buildCategories();
    buildModels();
    buildModelPrompts();
    buildCustomPrompts();
    buildIndex();
    
    console.log('\n✅ All data files built successfully!');
    console.log('📁 Output directory:', PUBLIC_DATA_DIR);
    console.log('\n📊 Files created:');
    console.log('   - categories.json');
    console.log('   - models.json');
    console.log('   - model-prompts.json');
    console.log('   - custom-prompts.json');
    console.log('   - index.json');
    
  } catch (error) {
    console.error('❌ Error building data files:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
