# DengeAI - Video Prompt Generator

> **AI Video Prompt Engineering Platform**

A video prompt generator for AI video creation. Generate prompts using categories, enhance them with AI, or use them as-is. Contribute your own prompts through simple forms.

**Important Note**: This is an extracted and refined version of a larger production system, open-sourced for the community. While thoroughly tested, edge cases and improvements are always welcome through contributions.

---

## **Intelligent Architecture**

### **Core Systems**
- **Category-Based Prompt Engine** - Modular prompt construction with 20+ specialized categories
- **AI Enhancement Prompts** - FAL AI integration for semantic prompt optimization
- **Image-to-Prompt Synthesis** - Computer vision-driven prompt generation from visual inputs
- **Dynamic Model Support** - Abstracted model configurations for multiple AI video platforms
- **Real-time Preview System** - Live prompt validation and preview generation

### **Technical Details**
- **Next.js 15 + App Router** - Fully static export, no server required
- **TypeScript Strict Mode** - Complete type safety across the entire codebase 
- **Design System** - Consistent UI components with shadcn/ui and Tailwind CSS and some DengeAI based custom components
- **Monorepo Architecture** - Turborepo for optimized build performance

---


---

## **Contributing to DengeAI**

> **This project thrives on community contributions. Your expertise can help improve prompt quality, fix edge cases, and expand functionality.**

### **How to Contribute**

#### **1. Prompt Contributions**
Easy contribution through built-in forms:

**Custom Prompts** - Complete video generation prompts
- Use `/contribute/custom-prompt` form
- Fill title, description, tags, and model
- Generate JSON and submit via Pull Request

**Base Prompts** - Individual prompt elements
- Use `/contribute/base-prompt` form
- Add high-quality prompt elements that combine into final prompts
- Add options to existing categories (lighting, camera, mood, etc.)

**Categories** - New prompt categories
- Use `/contribute/base-prompt-category` and `/contribute/prompt-categories` forms
- Create new categorization systems

#### **2. Technical Improvements**
Help refine the codebase and fix issues:

- **Bug Fixes**: Report and fix edge cases, UI inconsistencies, or performance issues
- **Feature Enhancements**: Improve existing functionality or add new capabilities
- **Code Quality**: Optimize performance, improve TypeScript coverage, or enhance accessibility
- **Documentation**: Improve code comments, add examples, or clarify usage patterns

#### **3. Model Integration**
Expand platform support:
- Add new AI video generation model configurations for FAL.ai
- Improve existing model parameter handling
- Create model-specific prompt optimization logic

### **Contribution Workflow**

1. **Identify Contribution Type**
   - Browse existing issues or create new ones
   - Use the in-app contribution forms for prompts
   - Check the codebase for TODOs or improvement opportunities

2. **Prepare Your Contribution**
   - For prompts: Use the built-in JSON generators
   - For code: Follow TypeScript strict mode and existing patterns
   - Test your changes thoroughly

3. **Submit Pull Request**
   - Clear, descriptive commit messages
   - Reference related issues
   - Include testing information
   - Follow the established code style

4. **Review Process**
   - Automated checks for code quality and build success
   - Community review for prompt quality and relevance
   - Maintainer approval for technical changes

---

## **Technical Setup**

### **Prerequisites**
- **Node.js** >= 22.17.1
- **pnpm** >= 10.13.1

### **Development Commands**
```bash
pnpm dev          # Start development server
pnpm build        # Production build with optimizations
pnpm lint         # Code quality checks
pnpm type-check   # TypeScript validation
```

### **Build Scripts**
Contributed JSON files are automatically processed during build:
```bash
pnpm build-data           # Combine individual JSON contributions into optimized data files
pnpm build-production     # Production data build with validation
pnpm generate-thumbnails  # Generate thumbnail images for prompts
pnpm validate-data        # Validate all JSON data structure
```

### **Environment Configuration**
Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for development)
- `NEXT_PUBLIC_ANALYTICS_URL` - Analytics script URL for UMAMI (optional)
- `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` - Analytics website ID for UMAMI (optional)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID (optional)

---

## **Connect & Follow**

- **Twitter**: [@ilkerigz](https://x.com/ilkerigz) - Follow for updates and AI insights
- **Hugging Face**: [ilkerzgi](https://huggingface.co/ilkerzgi) - AI models and datasets

---

## **License & Attribution**

MIT License - This project is open source and free to use, modify, and distribute.

**Built with precision by [@ilkerigz](https://x.com/ilkerigz)** - Extracted from a DengeAI platform and refined for the open source community.

---

*This project represents advanced prompt techniques refined through production use. Contributions from the community help push the boundaries of what's possible in AI video generation.*