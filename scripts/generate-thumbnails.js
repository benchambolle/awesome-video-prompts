#!/usr/bin/env node

/**
 * Standalone script to generate missing thumbnails from video files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

const CONFIG = {
  basePromptsDir: './apps/web/public/data/base-prompts',
  thumbnailsDir: './apps/web/public/thumbnails',
  tempDir: './temp'
};

function ensureDirectories() {
  [CONFIG.thumbnailsDir, CONFIG.tempDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function extractThumbnail(videoUrl, outputPath) {
  try {
    console.log(`🎬 Processing: ${path.basename(outputPath)}`);
    
    const tempVideoPath = path.join(CONFIG.tempDir, `temp_${Date.now()}.mp4`);
    await downloadFile(videoUrl, tempVideoPath);
    
    const ffmpegCommand = `ffmpeg -i "${tempVideoPath}" -vf "select=eq(n\\,0)" -q:v 3 -frames:v 1 "${outputPath}" -y -loglevel quiet`;
    execSync(ffmpegCommand);
    
    fs.unlinkSync(tempVideoPath);
    console.log(`✅ Created: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

function generateSafeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateThumbnails() {
  console.log('🖼️  Generating missing thumbnails...\n');
  
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    console.log('✅ FFmpeg available\n');
  } catch (error) {
    console.log('❌ FFmpeg not available');
    process.exit(1);
  }
  
  ensureDirectories();
  
  const files = fs.readdirSync(CONFIG.basePromptsDir).filter(f => f.endsWith('.json'));
  let generated = 0;
  
  for (const filename of files) {
    const filePath = path.join(CONFIG.basePromptsDir, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.example && 
        data.example.type === 'video' && 
        data.example.url && 
        (!data.thumbnail || !data.thumbnail.url || data.thumbnail.url.includes('example.com'))) {
      
      const safeFilename = generateSafeFilename(data.value);
      const thumbnailFilename = `${safeFilename}.jpg`;
      const thumbnailPath = path.join(CONFIG.thumbnailsDir, thumbnailFilename);
      
      const success = await extractThumbnail(data.example.url, thumbnailPath);
      
      if (success) {
        data.thumbnail = {
          type: "image",
          url: `/thumbnails/${thumbnailFilename}`
        };
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        generated++;
      }
    }
  }
  
  if (fs.existsSync(CONFIG.tempDir)) {
    fs.rmSync(CONFIG.tempDir, { recursive: true, force: true });
  }
  
  console.log(`\n🎉 Generated ${generated} thumbnails`);
}

if (require.main === module) {
  generateThumbnails().catch(console.error);
}

module.exports = { generateThumbnails };
