# 📁 FB-c_labV2 Project File Tree

## 🏗️ Top-Level Directory Structure

```
FB-c_labV2/
├── 📱 app/                          # Next.js App Router (Main Application)
├── 🧩 components/                   # React Components Library  
├── 📚 lib/                          # Core Libraries & Utilities
├── 🔗 api/                          # External API Integrations
├── 🎨 public/                       # Static Assets
├── ⚙️ hooks/                        # Custom React Hooks
├── 📝 types/                        # TypeScript Type Definitions
├── 🛠️ utils/                        # Utility Functions
├── 🗂️ context/                      # React Context Providers
├── 📊 supabase/                     # Database & Backend Config
├── 🚀 scripts/                      # Build & Test Scripts
├── 📄 document/                     # Page Content Documentation
├── 📦 node_modules/                 # Dependencies
├── 🔨 .next/                        # Next.js Build Output
├── 📋 Configuration Files
└── 📖 Documentation Files
```

## 🏢 App Directory (Next.js Routes)

```
app/
├── api/
│   └── ai/
│       └── route.ts                 # 🔥 UNIFIED AI API ENDPOINT (569 lines)
├── 🏠 page.tsx                      # Homepage (104 lines)
├── 🎨 HomePage.tsx                  # Homepage Component (222 lines)
├── 💬 chat/                         # AI Chat Interface
├── 👥 leads/                        # Lead Management
├── 🎓 workshop/                     # Workshop Pages
├── 💼 consulting/                   # Consulting Services
├── ℹ️ about/                        # About Page
├── 📞 contact/                      # Contact Page
├── ⚙️ settings/                     # User Settings
├── 🧪 test/                         # Testing Pages
├── 📹 video-learning-tool/          # Video Learning App
├── 🧵 threads/                      # Conversation Threads
├── 🚪 logout/                       # Logout Handler
├── 🔗 shared-with-me/               # Shared Content
├── 🎨 background-preview/           # Background Previews
├── 🔔 toast-test/                   # Toast Notifications Test
├── 🌐 demo/                         # Demo Pages
├── 🎨 globals.css                   # Global Styles (659 lines)
├── ⚡ loading.tsx                   # Loading Component (6 lines)
├── 📐 layout.tsx                    # Root Layout (19 lines)
└── 🎭 ClientLayout.tsx              # Client-Side Layout (154 lines)
```

## 🧩 Components Library

```
components/
├── ui/                              # 🎨 UI Components (50+ files)
│   ├── 🟦 button.tsx                # Button Component (63 lines)
│   ├── 💳 card.tsx                  # Card Component (85 lines)
│   ├── 🎪 dialog.tsx                # Dialog Component (123 lines)
│   ├── 📝 input.tsx                 # Input Component (23 lines)
│   ├── 📝 textarea.tsx              # Textarea Component (23 lines)
│   ├── 🖼️ avatar.tsx                # Avatar Component (51 lines)
│   ├── 🔄 skeleton.tsx              # Skeleton Loader (196 lines)
│   ├── 🎯 3d-hover-card.tsx         # 3D Hover Card (106 lines)
│   ├── 📦 3d-box-loader-animation.tsx # 3D Box Loader (186 lines)
│   ├── 🎨 canvas-reveal-effect.tsx  # Canvas Animation (328 lines)
│   ├── 🔍 ai-input.tsx              # AI Input Component (121 lines)
│   ├── 🏠 glass-card.tsx            # Glass Card (95 lines)
│   ├── 🎮 orb-logo.tsx              # Orb Logo Animation (260 lines)
│   ├── ⚡ tech-circuit-animation.tsx # Tech Animation (219 lines)
│   ├── 📊 timeline.tsx              # Timeline Component (151 lines)
│   └── ...more UI components
├── 💬 chat/                         # Chat-Specific Components
│   ├── 📁 index.ts                  # Chat Exports (49 lines)
│   ├── 🗂️ Sidebar/                  # Chat Sidebar Components
│   ├── 📊 activity/                 # Activity Components
│   ├── 🔄 common/                   # Common Chat Components
│   ├── 🪟 modals/                   # Chat Modals
│   ├── 📹 Video2app/                # Video to App Components
│   ├── 💭 messages/                 # Message Components
│   └── 📐 layout/                   # Chat Layout Components
├── 🤖 ai/                           # AI Components (Ready for expansion)
├── 🎨 backgrounds/                  # Background Components
├── 💼 consulting/                   # Consulting Components
├── 🎓 workshop/                     # Workshop Components
├── 🏠 home/                         # Homepage Components
├── 📞 contact/                      # Contact Components
├── ⚖️ legal/                        # Legal Components
├── 🔄 loaders/                      # Loading Components
├── ✨ magicui/                      # Magic UI Components
├── 🧱 blocks/                       # Reusable Blocks
├── 🔧 hooks/                        # Component Hooks
├── 📐 layouts/                      # Layout Components
├── ♿ accessibility/                # Accessibility Components
├── 📊 data-renderers/               # Data Display Components
├── 🎬 video-to-app-generator.tsx    # Video Generator (554 lines)
├── 🎥 video-learning-integrated.tsx # Video Learning (71 lines)
├── 📢 cta-section.tsx               # CTA Section (70 lines)
├── 📦 ContentContainer.tsx          # Content Container (532 lines)
├── 📋 chat-side-panel.tsx           # Chat Side Panel (331 lines)
├── 💬 floating-chat-button.tsx      # Floating Chat Button (31 lines)
├── 📐 layout.tsx                    # Layout Component (33 lines)
├── 🚨 ErrorBoundary.tsx             # Error Boundary (318 lines)
├── 🎨 header.tsx                    # Header Component (183 lines)
├── 🎬 video-learning-card.tsx       # Video Learning Card (118 lines)
├── 🎨 theme-provider.tsx            # Theme Provider (16 lines)
├── 🦶 footer.tsx                    # Footer Component (241 lines)
├── 🖼️ ExampleGallery.tsx            # Example Gallery (40 lines)
└── ⭐ features-section.tsx           # Features Section (103 lines)
```

## 📚 Library & Core Logic

```
lib/
├── ai/                              # 🤖 AI Core Services
│   ├── unified-ai-service.ts        # 🔥 MAIN AI SERVICE (882 lines)
│   ├── types.ts                     # AI Type Definitions (77 lines)
│   ├── gemini-live-client.ts        # Gemini Live Integration (363 lines)
│   ├── unified-ai-service.test.ts   # Unit Tests (326 lines)
│   └── unified-ai-service.integration.test.ts # Integration Tests (93 lines)
├── 🎬 video-analysis.ts             # Video Processing (259 lines)
├── 📹 video-to-app.ts               # Video to App Generator (165 lines)
├── 📺 youtube-utils.ts              # YouTube Integration (264 lines)
├── ⚡ performance.ts                # Performance Monitoring (498 lines)
├── 🎯 prompts.ts                    # AI Prompts (24 lines)
├── 📝 text-generation.ts            # Text Generation (114 lines)
├── 🎨 syntax-highlighter.ts         # Code Highlighting (104 lines)
├── 📊 data-parser.ts                # Data Processing (152 lines)
├── 📈 data-types.ts                 # Data Types (102 lines)
├── 🔧 parse.ts                      # Parse Utilities (46 lines)
├── 📋 types.ts                      # General Types (48 lines)
├── 🔧 constants.ts                  # App Constants (4 lines)
└── 🛠️ utils.ts                      # General Utilities (7 lines)
```

## 🎨 Public Assets

```
public/
├── 👤 Profile Images
│   ├── farzad-bayat_profile_2AI.JPG  # AI Profile (102KB)
│   ├── farzad-bayat-profile.jpg      # Original Profile (121KB)
│   ├── user-avatar.png               # User Avatar (1.6KB)
│   ├── bot-avatar.png                # Bot Avatar (1.6KB)
│   └── ai-avatar.png                 # AI Avatar (1.6KB)
├── 🏢 logos/                          # Brand Logos Directory
├── 📊 data/                           # Static Data Files
├── 🎮 3d/                             # 3D Assets Directory
├── 🎬 download (1).mp4                # Demo Video (2.7MB)
├── 🧪 test-ai-showcase.html           # AI Demo Page (677 lines)
├── 🖼️ Placeholder Images
│   ├── placeholder-logo.png          # Logo Placeholder (568B)
│   ├── placeholder-logo.svg          # SVG Logo (3.1KB)
│   ├── placeholder-user.jpg          # User Placeholder (1.6KB)
│   ├── placeholder.jpg               # General Placeholder (1.0KB)
│   └── placeholder.svg               # SVG Placeholder (3.2KB)
└── 📁 .DS_Store                       # macOS System File (6.0KB)
```

## ⚙️ Configuration & Tooling

```
Configuration Files:
├── 📦 package.json                  # Dependencies & Scripts (111 lines)
├── 🔒 pnpm-lock.yaml               # Package Lock (9548 lines)
├── ⚙️ next.config.mjs               # Next.js Config (113 lines)
├── 🎨 tailwind.config.ts            # Tailwind CSS Config (152 lines)
├── 📘 tsconfig.json                 # TypeScript Config (30 lines)
├── 📋 .eslintrc.json                # ESLint Config (7 lines)
├── 📝 postcss.config.mjs            # PostCSS Config (9 lines)
├── 🧪 vitest.config.ts              # Vitest Config (1 line)
├── 🧩 components.json               # UI Components Config (22 lines)
├── 🚫 .gitignore                    # Git Ignore Rules (31 lines)
├── 🔧 next-env.d.ts                 # Next.js Types (6 lines)
├── 📊 tsconfig.tsbuildinfo          # TypeScript Build Info (926KB)
└── 🧹 check-console.js              # Console Check Script (31 lines)
```

## 🗂️ Support Directories

```
scripts/                             # 🚀 Development Scripts
├── test-unified-ai-service.ts       # Unified AI Tests (181 lines)
├── test-all-ai-functions.ts         # Complete AI Tests (484 lines)
├── test-advanced-gemini.ts          # Advanced Gemini Tests (64 lines)
├── test-chat-api.ts                 # Chat API Tests (57 lines)
└── test-gemini-proxy.ts             # Gemini Proxy Tests (62 lines)

supabase/                            # 📊 Database & Backend
├── cleanup-scheduler.ts             # Cleanup Scheduler (44 lines)
├── lead-subscriptions.ts            # Lead Subscriptions (143 lines)
├── storage-cleanup.ts               # Storage Cleanup (94 lines)
└── migrations/                      # Database Migrations

document/                            # 📄 Page Content
├── 1_home.md                        # Home Page Content (79 lines)
├── 2_consulting.md                  # Consulting Content (102 lines)
├── 3_about.md                       # About Page Content (110 lines)
├── 4_workshop.md                    # Workshop Content (60 lines)
└── 5_contact.md                     # Contact Page Content (49 lines)

hooks/                               # ⚡ React Hooks
├── use-analysis-history.ts          # Analysis History Hook (15 lines)
└── use-media-query.ts               # Media Query Hook (86 lines)

types/                               # 📝 Global Types
└── global.d.ts                      # Global Type Definitions (64 lines)

utils/                               # 🛠️ Utilities
└── pdfGenerator.ts                  # PDF Generation (156 lines)

context/                             # 🗂️ React Context
└── data-context.tsx                 # Data Context Provider (30 lines)

api/                                 # 🔗 External APIs
└── ai-service/
    └── types/                       # API Type Definitions
```

## 📖 Documentation Files

```
Documentation:
├── 📋 README.md                     # Main Documentation (93 lines)
├── 📱 README-AI-CHAT.md             # Chat Implementation (42 lines)
├── 🌐 README-WEBAPP.md              # Web App Guide (33 lines)
├── 🔄 CHANGELOG.md                  # Version History (38 lines)
├── 🤖 AI_Functions_APIs_Documentation.md # AI API Docs (226 lines)
├── 📊 AI_UNIFICATION_SUMMARY.md     # AI Unification (126 lines)
├── 🎤 GEMINI_LIVE_API_STATUS.md     # Gemini Live Status (113 lines)
├── 📘 GEMINI_LIVE_API_IMPLEMENTATION_GUIDE.md # Implementation Guide (431 lines)
├── 🧹 DUPLICATE_CLEANUP_STATUS.md   # Cleanup Status (123 lines)
├── 📋 DUPLICATE_CLEANUP_PLAN.md     # Cleanup Plan (843 lines)
├── 🧩 COMPONENT_CLEANUP_PLAN.md     # Component Cleanup (45 lines)
├── 🔧 CODEBASE_REVIEW_FIXES.md      # Code Review Fixes (196 lines)
├── 📚 __Complete AI chat Implementation Guide for fbc.md # Complete Guide (1860 lines)
└── 🖼️ image_0.jpeg                  # Documentation Image (385KB)
```

## 🎯 Key Architecture Insights

### 🔥 Core Features
- **Unified AI API**: Single endpoint (`/api/ai`) handling all AI functions
- **Modular Components**: 50+ reusable UI components with consistent design
- **Advanced AI Integration**: Gemini 2.5 Flash with voice, vision, and real-time capabilities
- **Full-Stack TypeScript**: End-to-end type safety with comprehensive type definitions
- **Modern UI**: Glassmorphism design with 3D animations and smooth transitions

### 📊 Code Statistics
- **Total Lines of Code**: ~15,000+ lines
- **UI Components**: 50+ reusable components
- **Main AI Service**: 882 lines (unified-ai-service.ts)
- **API Endpoint**: 569 lines (unified route.ts)
- **Documentation**: 15+ comprehensive guides
- **Test Scripts**: 5 testing utilities covering all AI functions
- **Configuration Files**: 10+ properly configured tools

### 🚀 Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5.x, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **AI Services**: Google Gemini 2.5 Flash, ElevenLabs Voice AI
- **Build Tools**: PNPM, ESLint, Vitest, PostCSS
- **UI Framework**: Shadcn/ui, MagicUI, Custom 3D components
- **Development**: Hot reload, TypeScript strict mode, ESLint rules

## 📈 Project Status

✅ **Fully Operational**
- All APIs working correctly
- Frontend rendering properly
- AI integrations functional
- Database connections active
- Build process optimized

❌ **Recent Cleanup** 
- Removed duplicate API routes (`/api/gemini`, `/api/gemini-advanced`)
- Consolidated into unified `/api/ai` endpoint
- Updated all models to latest `gemini-2.5-flash`
- Cleaned up webpack cache warnings

🚀 **Production Ready**
- Comprehensive error handling
- Proper environment configuration
- Scalable architecture
- Extensive documentation
- Performance optimized

---

*This file tree represents a sophisticated AI consulting platform with production-ready architecture, comprehensive documentation, and modern development practices.* 