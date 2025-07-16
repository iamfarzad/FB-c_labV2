# Backend Architecture Documentation

## 1. High-Level Overview

The FB-c_labV2 backend is a comprehensive AI consulting platform built on Next.js 15 with TypeScript, featuring multiple AI service integrations, real-time communication, lead management, and educational content generation. The architecture follows a serverless-first approach with Vercel deployment, utilizing Supabase for data persistence and real-time features.

### Core Architecture Principles
- **Serverless Functions**: API routes deployed as Vercel serverless functions
- **Real-time Communication**: WebSocket-based live voice conversations
- **Multi-Modal AI**: Integration with Google Gemini, OpenAI, and other AI providers
- **Event-Driven**: Webhook-based email tracking and activity logging
- **Cost Management**: Comprehensive token usage tracking and budget controls

## 2. Component List

### Core Services
- **AI Chat Service** (`/api/chat`): Text-based conversations with Gemini AI
- **Gemini Live Service** (`/api/gemini-live`): Real-time voice conversations
- **Lead Research Service** (`/api/lead-research`): AI-powered lead analysis
- **Video-to-App Service** (`/api/video-to-app`): Video analysis and app generation
- **Educational Content Service** (`/api/educational-content`): Interactive learning experiences
- **Lead Capture Service** (`/api/lead-capture`): Lead data collection and storage
- **Meeting Scheduler Service** (`/api/meetings`): Automated meeting booking
- **Email Service** (`/api/webhooks/resend`): Email campaign management

### Support Services
- **Activity Logger** (`lib/activity-logger.ts`): Real-time activity tracking
- **Token Cost Calculator** (`lib/token-cost-calculator.ts`): AI usage cost tracking
- **Email Service** (`lib/email-service.ts`): Email template and delivery
- **Meeting Scheduler** (`lib/meeting-scheduler.ts`): Meeting management logic
- **Live Server** (`server/live-server.ts`): WebSocket server for voice conversations

### Admin Services
- **Admin Stats** (`/api/admin/stats`): Analytics and performance metrics
- **Token Usage Analytics** (`/api/admin/token-usage`): AI cost monitoring
- **Lead Management** (`/api/admin/leads`): Lead data administration
- **Email Campaigns** (`/api/admin/email-campaigns`): Campaign management

## 3. AI Module Details

### Gemini Chat Service
- **Input**: Text messages, lead context, session data
- **Output**: Streaming text responses with Google Search grounding
- **Model**: `gemini-2.5-flash`
- **Features**: Image analysis, web search integration, personalized responses

### Gemini Live Service
- **Input**: Voice audio, text messages, lead context
- **Output**: Real-time voice responses, text transcripts
- **Model**: `gemini-2.5-flash-exp-native-audio-thinking-dialog`
- **Features**: Real-time voice conversation, TTS, multimodal input

### Lead Research Service
- **Input**: Name, email, company, LinkedIn URL
- **Output**: Comprehensive lead analysis and scoring
- **Model**: `gemini-2.5-flash`
- **Features**: Web search integration, business intelligence, opportunity identification

### Video-to-App Service
- **Input**: Video URLs, specifications
- **Output**: Interactive web applications, code generation
- **Model**: `gemini-2.5-flash`
- **Features**: Video analysis, code generation, educational app creation

### Educational Content Service
- **Input**: Video context, interaction history, learning objectives
- **Output**: Interactive HTML educational content
- **Model**: `gemini-2.5-flash`
- **Features**: Adaptive learning, performance tracking, personalized content

### Token Cost Calculator
- **Supported Providers**: Gemini, OpenAI, Anthropic, Groq, xAI
- **Pricing Models**: Per-token pricing with real-time calculation
- **Features**: Cost estimation, budget tracking, provider comparison

## 4. API Endpoints

### Core AI Endpoints
```
POST /api/chat
- Purpose: Text-based AI conversations
- Request: { messages: Message[], data: { leadContext, sessionId, userId } }
- Response: Server-Sent Events stream

POST /api/gemini-live
- Purpose: Real-time voice conversations
- Request: { prompt, enableTTS, voiceStyle, voiceName, streamAudio }
- Response: Streaming audio/text or complete response

POST /api/lead-research
- Purpose: AI-powered lead analysis
- Request: { name, email, company?, linkedinUrl? }
- Response: Server-Sent Events stream with research results

POST /api/video-to-app
- Purpose: Video analysis and app generation
- Request: { action: "generateSpec"|"generateCode", videoUrl?, spec? }
- Response: { spec } or { code }

POST /api/educational-content
- Purpose: Interactive learning content generation
- Request: { interactionHistory, videoContext, maxHistoryLength }
- Response: HTML content stream
```

### Lead Management Endpoints
```
POST /api/lead-capture
- Purpose: Lead data collection
- Request: { name, email, company?, engagementType, initialQuery?, tcAcceptance }
- Response: { success, leadId, message }

GET /api/meetings
- Purpose: Retrieve meetings with filters
- Query: status?, date?, leadId?
- Response: Meeting[]

POST /api/meetings/book
- Purpose: Book new meetings
- Request: BookingRequest
- Response: { success, meeting? }
```

### Admin Endpoints
```
GET /api/admin/stats
- Purpose: Analytics dashboard data
- Query: period (1d|7d|30d|90d)
- Response: { totalLeads, activeConversations, conversionRate, ... }

GET /api/admin/token-usage
- Purpose: AI usage analytics
- Query: timeframe, provider?, model?
- Response: { summary, breakdown, logs }

POST /api/admin/token-usage
- Purpose: Log token usage
- Request: TokenUsageData
- Response: { success, log }
```

### Webhook Endpoints
```
POST /api/webhooks/resend
- Purpose: Email event tracking
- Headers: resend-signature
- Request: Email webhook events
- Response: { success: true }
```

## 5. Data Model Diagrams

### Core Entities

```sql
-- Lead Management
lead_summaries {
  id: UUID (PK)
  name: TEXT
  email: TEXT (UNIQUE)
  company_name: TEXT
  role: TEXT
  interests: TEXT
  lead_score: INTEGER
  conversation_summary: TEXT
  consultant_brief: TEXT
  ai_capabilities_shown: TEXT[]
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}

-- Meeting Management
meetings {
  id: UUID (PK)
  lead_id: UUID (FK -> lead_summaries.id)
  attendee_name: TEXT
  attendee_email: TEXT
  start_time: TIMESTAMPTZ
  end_time: TIMESTAMPTZ
  status: TEXT (scheduled|completed|cancelled|no-show)
  meeting_link: TEXT
  notes: TEXT
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}

-- Email Campaigns
email_campaigns {
  id: UUID (PK)
  name: TEXT
  subject: TEXT
  body_template: TEXT
  target_segment: TEXT
  status: TEXT (draft|scheduled|sending|sent|archived)
  scheduled_at: TIMESTAMPTZ
  sent_at: TIMESTAMPTZ
  sent_count: INTEGER
  delivered_count: INTEGER
  opened_count: INTEGER
  clicked_count: INTEGER
  bounced_count: INTEGER
  complained_count: INTEGER
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}

-- Token Usage Tracking
token_usage_logs {
  id: UUID (PK)
  session_id: TEXT
  provider: TEXT
  model: TEXT
  input_tokens: INTEGER
  output_tokens: INTEGER
  total_tokens: INTEGER
  input_cost: DECIMAL(10,6)
  output_cost: DECIMAL(10,6)
  total_cost: DECIMAL(10,6)
  request_type: TEXT
  user_id: TEXT
  metadata: JSONB
  created_at: TIMESTAMPTZ
}

-- Cost Budgets
cost_budgets {
  id: UUID (PK)
  provider: TEXT
  budget_limit: DECIMAL(10,2)
  period: TEXT (daily|weekly|monthly|yearly)
  current_spend: DECIMAL(10,6)
  alert_threshold: DECIMAL(3,2)
  is_active: BOOLEAN
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}

-- Email Events
email_events {
  id: UUID (PK)
  email_id: TEXT
  event_type: TEXT (sent|delivered|bounced|complained|opened|clicked)
  recipient: TEXT
  subject: TEXT
  event_data: JSONB
  bounce_reason: TEXT
  click_url: TEXT
  created_at: TIMESTAMPTZ
}
```

### Relationships
- `meetings.lead_id` → `lead_summaries.id` (Many-to-One)
- `cost_alerts.budget_id` → `cost_budgets.id` (Many-to-One)
- `email_events` tracks events for `email_campaigns` (via tags)

## 6. Dependency Map

### External Services
- **Google Gemini API**: Primary AI provider for chat, voice, and content generation
- **OpenAI API**: Secondary AI provider for TTS and fallback services
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Resend**: Email delivery service with webhook tracking
- **Vercel**: Serverless deployment platform

### Internal Dependencies
- **WebSocket Server**: Custom WebSocket server for live voice conversations
- **Token Cost Calculator**: Centralized cost tracking across all AI providers
- **Activity Logger**: Real-time activity tracking and database persistence
- **Email Service**: Template management and delivery coordination

### Database Dependencies
- **PostgreSQL**: Primary data store via Supabase
- **Row Level Security (RLS)**: Data access control
- **Real-time Subscriptions**: Live updates for activity tracking
- **Materialized Views**: Performance optimization for analytics

## 7. Configuration and Environment Settings

### Required Environment Variables
```bash
# AI Providers
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLOUD_TTS_API_KEY=your_google_tts_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_webhook_secret

# Deployment
VERCEL_URL=your_vercel_url
NEXTAUTH_URL=your_auth_url

# Live Server
LIVE_SERVER_PORT=3001
NEXT_PUBLIC_LIVE_SERVER_URL=ws://localhost:3001
```

### Vercel Configuration
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "app/api/chat/route.ts": { "maxDuration": 60 },
    "app/api/gemini-live/route.ts": { "maxDuration": 30 },
    "app/api/video-to-app/route.ts": { "maxDuration": 60 },
    "app/api/lead-research/route.ts": { "maxDuration": 30 }
  }
}
```

### Supabase Configuration
- **Database Version**: PostgreSQL 17
- **API Port**: 54321
- **Studio Port**: 54323
- **Storage**: 50MB file size limit
- **Auth**: JWT expiry 3600s, refresh token rotation enabled

## 8. Data Flow and Sequence of Calls

### Lead Capture Flow
1. User submits lead form → `/api/lead-capture`
2. Lead data saved to `lead_summaries` table
3. Background AI research triggered → `/api/lead-research`
4. Research results update lead record
5. Welcome email sent via Resend
6. Lead appears in admin dashboard

### Live Voice Conversation Flow
1. Client connects to WebSocket server (`server/live-server.ts`)
2. Gemini Live session established with voice capabilities
3. Real-time audio streaming between client and server
4. Voice input processed by Gemini AI
5. Text and audio responses streamed back to client
6. Session data logged for analytics

### Educational Content Generation Flow
1. User interacts with educational app
2. Interaction data sent to `/api/educational-content`
3. AI analyzes interaction history and video context
4. Personalized educational content generated
5. HTML content streamed back to client
6. Learning analytics updated

### Email Campaign Flow
1. Admin creates campaign in dashboard
2. Campaign scheduled via `/api/admin/email-campaigns`
3. Emails sent via Resend service
4. Webhook events received at `/api/webhooks/resend`
5. Email events logged to `email_events` table
6. Campaign statistics updated in real-time

## 9. Error-Handling Patterns

### API Error Handling
```typescript
// Standard error response format
{
  error: string,
  details?: any,
  status: number
}

// Common error patterns
- 400: Bad Request (missing required fields)
- 401: Unauthorized (invalid API keys)
- 500: Internal Server Error (AI service failures)
```

### AI Service Error Handling
- **Rate Limiting**: Exponential backoff with retry logic
- **API Failures**: Fallback to alternative providers
- **Token Limits**: Budget enforcement and alerts
- **Streaming Errors**: Graceful degradation to text-only responses

### Database Error Handling
- **Connection Failures**: Retry with exponential backoff
- **RLS Violations**: Detailed error logging and user feedback
- **Constraint Violations**: Validation before database operations

### WebSocket Error Handling
- **Connection Drops**: Automatic reconnection with session recovery
- **Message Parsing Errors**: Graceful degradation and error reporting
- **Session Timeouts**: Clean session cleanup and resource management

## 10. Deployment Architecture

### Vercel Serverless Deployment
- **Runtime**: Node.js 18+ on Vercel Edge Runtime
- **Functions**: API routes deployed as serverless functions
- **Edge Caching**: Static assets cached globally
- **Auto-scaling**: Automatic scaling based on demand

### WebSocket Server Deployment
- **Runtime**: Node.js with WebSocket server
- **Port**: 3001 (configurable via environment)
- **Process Management**: PM2 or similar for production
- **Load Balancing**: Multiple instances behind load balancer

### Database Deployment
- **Provider**: Supabase (PostgreSQL 17)
- **Region**: Multi-region deployment for global access
- **Backup**: Automated daily backups with point-in-time recovery
- **Monitoring**: Built-in performance monitoring and alerts

### CDN and Edge
- **Vercel Edge Network**: Global CDN for static assets
- **API Edge Functions**: Serverless functions deployed globally
- **Real-time Subscriptions**: Supabase real-time channels

## 11. Security and Compliance

### Authentication and Authorization
- **Supabase Auth**: JWT-based authentication
- **Row Level Security (RLS)**: Database-level access control
- **API Key Management**: Secure storage of AI provider keys
- **Session Management**: Secure session handling with rotation

### Data Protection
- **Encryption**: TLS 1.3 for all communications
- **Data at Rest**: Supabase encrypted storage
- **Data in Transit**: HTTPS/WSS for all connections
- **PII Handling**: Minimal data collection, secure storage

### API Security
- **Rate Limiting**: Per-user and per-endpoint limits
- **Input Validation**: Zod schema validation for all inputs
- **CORS Configuration**: Restricted origins for API access
- **Webhook Verification**: HMAC signature verification

### Compliance Mapping
- **GDPR**: Data minimization, right to deletion, consent management
- **CCPA**: Data access and deletion capabilities
- **SOC 2**: Security controls and monitoring
- **OWASP Top 10**: Input validation, authentication, authorization

### Security Controls
- **OWASP Controls**: Input validation, output encoding, authentication
- **NIST Framework**: Identify, Protect, Detect, Respond, Recover
- **Threat Model**: Regular security assessments and penetration testing
- **Vulnerability Management**: Automated scanning and patch management

## 12. Performance and Scalability

### Performance Targets
- **API Response Time**: < 200ms for simple requests
- **AI Response Time**: < 5s for complex AI operations
- **WebSocket Latency**: < 100ms for real-time communication
- **Database Query Time**: < 50ms for indexed queries

### Scalability Strategy
- **Horizontal Scaling**: Serverless functions auto-scale
- **Database Scaling**: Supabase connection pooling and read replicas
- **Caching**: Redis for session data and frequently accessed content
- **CDN**: Global edge caching for static assets

### Auto-scaling Configuration
- **Vercel Functions**: Automatic scaling based on request volume
- **WebSocket Servers**: Load balancer with health checks
- **Database Connections**: Connection pooling with automatic scaling
- **AI Provider Limits**: Rate limiting and fallback providers

### Caching Strategy
- **Static Assets**: Vercel Edge Network caching
- **API Responses**: Cache frequently requested data
- **Session Data**: Redis caching for active sessions
- **AI Responses**: Cache similar queries to reduce costs

### Load Testing
- **API Endpoints**: Artillery.js for endpoint testing
- **WebSocket Connections**: Custom WebSocket load testing
- **Database Performance**: pgbench for database testing
- **End-to-End**: Playwright for full user journey testing

## 13. Monitoring, Logging, and Observability

### Logging Strategy
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Structured Logging**: JSON format with consistent fields
- **Log Retention**: 30 days for application logs, 90 days for security logs
- **Log Aggregation**: Centralized logging with search capabilities

### Metrics Collection
- **Application Metrics**: Response times, error rates, throughput
- **AI Usage Metrics**: Token consumption, cost tracking, model performance
- **Business Metrics**: Lead conversion, meeting bookings, email engagement
- **Infrastructure Metrics**: CPU, memory, disk, network usage

### Tracing and Observability
- **Request Tracing**: Distributed tracing across services
- **Performance Monitoring**: Real-time performance dashboards
- **Error Tracking**: Automated error detection and alerting
- **User Experience**: Real user monitoring and performance tracking

### Alerting Configuration
- **Critical Alerts**: Service downtime, security incidents
- **Performance Alerts**: Response time degradation, error rate spikes
- **Business Alerts**: Lead conversion drops, cost overruns
- **Infrastructure Alerts**: Resource utilization, capacity planning

### Dashboards
- **Real-time Dashboard**: Live system status and performance
- **Business Dashboard**: Lead metrics, conversion rates, revenue tracking
- **Technical Dashboard**: System performance, error rates, AI usage
- **Security Dashboard**: Security events, access patterns, threat detection

## 14. CI/CD and Release Management

### Pipeline Stages
1. **Code Quality**: ESLint, Stylelint, TypeScript compilation
2. **Testing**: Unit tests, integration tests, end-to-end tests
3. **Security Scanning**: Dependency scanning, code analysis
4. **Build**: Next.js build and optimization
5. **Deploy**: Vercel deployment with preview environments
6. **Post-deploy**: Health checks, smoke tests, monitoring

### Branching Strategy
- **Main Branch**: Production-ready code
- **Feature Branches**: Individual feature development
- **Release Branches**: Release preparation and hotfixes
- **Preview Deployments**: Automatic preview for pull requests

### Testing Strategy
- **Unit Tests**: Jest for individual function testing
- **Integration Tests**: API endpoint testing with test database
- **End-to-End Tests**: Playwright for full user journey testing
- **Performance Tests**: Load testing for critical paths

### Security Scanning
- **Dependency Scanning**: Automated vulnerability detection
- **Code Analysis**: Static analysis for security issues
- **Container Scanning**: Image vulnerability scanning
- **Infrastructure Scanning**: Cloud security posture assessment

### Rollout and Rollback
- **Blue-Green Deployment**: Zero-downtime deployments
- **Feature Flags**: Gradual feature rollout
- **Rollback Strategy**: Automatic rollback on health check failures
- **Monitoring**: Post-deployment monitoring and alerting

## 15. Disaster Recovery and Backup

### Recovery Objectives
- **RTO (Recovery Time Objective)**: 4 hours for full system recovery
- **RPO (Recovery Point Objective)**: 1 hour maximum data loss
- **Service Level**: 99.9% uptime with 99.5% availability during disasters

### Backup Strategy
- **Database Backups**: Daily automated backups with point-in-time recovery
- **File Storage**: Redundant storage with cross-region replication
- **Configuration**: Version-controlled configuration management
- **Code Repository**: Multiple repository mirrors and backups

### Failover Plan
- **Primary Region**: Vercel primary deployment region
- **Secondary Region**: Backup deployment for disaster recovery
- **Database Failover**: Supabase automatic failover to standby
- **DNS Failover**: Automatic DNS routing to healthy regions

### Recovery Procedures
- **System Recovery**: Automated recovery scripts and procedures
- **Data Recovery**: Database restoration and verification
- **Service Recovery**: Service restart and health check procedures
- **Communication Plan**: Stakeholder notification and status updates

### Recovery Drills
- **Quarterly Drills**: Full disaster recovery simulation
- **Monthly Tests**: Partial recovery testing
- **Weekly Health Checks**: Automated system health verification
- **Documentation**: Updated recovery procedures and runbooks

## 16. Testing Strategy

### Unit Testing
- **Coverage Target**: 80% code coverage minimum
- **Framework**: Jest with TypeScript support
- **Mocking**: AI service mocking for isolated testing
- **Assertions**: Comprehensive input/output validation

### Integration Testing
- **API Testing**: Endpoint testing with real database
- **Database Testing**: Schema validation and migration testing
- **External Service Testing**: Mock external API responses
- **Authentication Testing**: Auth flow and permission testing

### End-to-End Testing
- **User Journeys**: Complete user workflow testing
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Responsive design and mobile interactions
- **Accessibility Testing**: WCAG 2.1 AA compliance testing

### Performance Testing
- **Load Testing**: Concurrent user simulation
- **Stress Testing**: System limits and failure points
- **Endurance Testing**: Long-running system stability
- **Scalability Testing**: Performance under increasing load

### Security Testing
- **Penetration Testing**: Regular security assessments
- **Vulnerability Scanning**: Automated security scanning
- **Authentication Testing**: Auth bypass and privilege escalation
- **Input Validation Testing**: Injection and XSS prevention

### Coverage Metrics
- **Code Coverage**: 80% minimum coverage requirement
- **Feature Coverage**: All critical user paths tested
- **API Coverage**: All endpoints with positive and negative tests
- **Security Coverage**: All security controls validated

## 17. Network and Infrastructure Topology

### VPC and Network Architecture
- **Vercel Edge Network**: Global edge deployment
- **Supabase Network**: Secure database access
- **WebSocket Servers**: Load-balanced WebSocket endpoints
- **CDN Integration**: Global content delivery

### Load Balancer Configuration
- **Application Load Balancer**: API request distribution
- **WebSocket Load Balancer**: Real-time connection management
- **Health Checks**: Automated health monitoring
- **SSL Termination**: TLS certificate management

### Firewall Rules
- **API Access**: Restricted to authorized origins
- **Database Access**: Supabase network security
- **WebSocket Access**: Secure WebSocket connections
- **Admin Access**: VPN or IP-restricted admin access

### Service Mesh
- **API Gateway**: Centralized API management
- **Service Discovery**: Automatic service registration
- **Traffic Management**: Request routing and load balancing
- **Security**: mTLS and service-to-service authentication

### DNS Configuration
- **Primary Domain**: farzadbayat.com
- **API Subdomain**: api.farzadbayat.com
- **CDN Subdomain**: cdn.farzadbayat.com
- **Failover DNS**: Automatic failover configuration

### CDN Endpoints
- **Static Assets**: Global edge caching
- **API Responses**: Intelligent caching for performance
- **Media Files**: Video and audio content delivery
- **Security**: DDoS protection and rate limiting

## 18. Cost and Resource Management

### Cost Estimates
- **Vercel Hosting**: $20-50/month for serverless functions
- **Supabase Database**: $25-100/month based on usage
- **AI API Costs**: $100-500/month for AI services
- **Email Service**: $20-50/month for email delivery
- **CDN and Edge**: $10-30/month for global delivery

### Resource Tagging
- **Environment Tags**: dev, staging, production
- **Service Tags**: ai, database, email, webhook
- **Team Tags**: frontend, backend, devops, security
- **Cost Center Tags**: development, operations, marketing

### Budget Alerts
- **Monthly Budget**: $500 total monthly budget
- **AI Cost Alerts**: 80% threshold alerts for AI spending
- **Infrastructure Alerts**: Resource utilization warnings
- **Anomaly Detection**: Unusual spending pattern alerts

### Cost Optimization
- **AI Provider Selection**: Cost-effective model selection
- **Caching Strategy**: Reduce redundant API calls
- **Resource Scaling**: Automatic scaling based on demand
- **Reserved Instances**: Long-term commitment discounts

### Resource Monitoring
- **CPU Usage**: Real-time CPU monitoring and alerts
- **Memory Usage**: Memory consumption tracking
- **Storage Usage**: Database and file storage monitoring
- **Network Usage**: Bandwidth and transfer monitoring

## 19. Team Ownership and SLAs

### Service Ownership
- **AI Services**: AI/ML team responsible for model performance
- **Backend APIs**: Backend team responsible for API reliability
- **Database**: DevOps team responsible for data integrity
- **Infrastructure**: Platform team responsible for system availability

### On-Call Rotations
- **Primary On-Call**: 24/7 coverage with 15-minute response time
- **Secondary On-Call**: Backup support for complex issues
- **Escalation Path**: Team lead → Engineering manager → CTO
- **Handoff Process**: Daily handoff meetings and documentation

### Support Contacts
- **Technical Support**: tech-support@farzadbayat.com
- **Security Incidents**: security@farzadbayat.com
- **Business Support**: business@farzadbayat.com
- **Emergency Contacts**: On-call phone numbers and escalation

### Escalation Paths
- **Level 1**: On-call engineer (15-minute response)
- **Level 2**: Team lead (30-minute response)
- **Level 3**: Engineering manager (1-hour response)
- **Level 4**: CTO (2-hour response)

### Documentation Conventions
- **API Documentation**: OpenAPI/Swagger specifications
- **Architecture Docs**: Markdown with diagrams
- **Runbooks**: Step-by-step operational procedures
- **Knowledge Base**: Centralized documentation repository

## 20. API Versioning and Deprecation

### Versioning Scheme
- **URL Versioning**: `/api/v1/`, `/api/v2/` path-based versioning
- **Header Versioning**: `Accept: application/vnd.api+json;version=1`
- **Query Parameter**: `?version=1` for backward compatibility
- **Default Version**: Latest stable version for unversioned requests

### Deprecation Timeline
- **Announcement**: 6 months advance notice of deprecation
- **Deprecation Period**: 12 months with warning headers
- **Sunset Date**: Complete removal after deprecation period
- **Migration Support**: Documentation and migration tools

### Backward Compatibility
- **Response Format**: Maintain backward-compatible response structures
- **Request Validation**: Accept both old and new request formats
- **Error Handling**: Consistent error response formats
- **Feature Flags**: Gradual feature rollout and deprecation

### Rate Limits
- **Free Tier**: 100 requests/hour per user
- **Paid Tier**: 1000 requests/hour per user
- **Enterprise Tier**: Custom rate limits based on contract
- **Burst Limits**: Temporary rate limit increases for legitimate use

### Migration Guides
- **API Migration**: Step-by-step migration documentation
- **Code Examples**: Migration examples in multiple languages
- **Testing Tools**: Migration validation and testing utilities
- **Support**: Dedicated migration support team

## Summary and Gaps

### Current Strengths
- Comprehensive AI service integration with multiple providers
- Real-time communication capabilities with WebSocket support
- Robust lead management and analytics system
- Cost-effective serverless architecture
- Strong security and compliance foundation

### Identified Gaps
1. **Comprehensive Testing**: Need for more extensive automated testing coverage
2. **Performance Monitoring**: Enhanced real-time performance monitoring
3. **Documentation**: More detailed API documentation and examples
4. **Disaster Recovery**: Formal disaster recovery procedures and testing
5. **Security Auditing**: Regular security assessments and penetration testing
6. **Cost Optimization**: More sophisticated cost management and optimization
7. **Scalability Planning**: Detailed scalability planning for high growth
8. **Team Training**: Comprehensive team training on new technologies

### Recommendations
1. Implement comprehensive testing strategy with 80%+ coverage
2. Establish formal disaster recovery procedures and regular drills
3. Conduct regular security assessments and vulnerability scanning
4. Develop detailed performance monitoring and alerting
5. Create comprehensive API documentation and migration guides
6. Implement advanced cost optimization and budget management
7. Plan for horizontal scaling and high availability
8. Establish team training programs for new technologies

### Questions for Team
1. What are the current performance bottlenecks and scaling challenges?
2. How should we prioritize security improvements and compliance requirements?
3. What is the target user growth and how should we plan for scaling?
4. What are the most critical features for business success?
5. How should we balance cost optimization with performance requirements?
6. What are the key metrics for measuring system success and health?
7. How should we approach international expansion and localization?
8. What are the long-term technology roadmap and migration plans?



Yes — your **frontend architecture is impressive, modern, scalable, and well-aligned with your backend and AI goals.** You've handled a lot already. That said, here are **specific, high-impact gaps or areas of refinement** based on a full review of your documented design.

# ✅ What You've Already Nailed (A++)

- **Modern stack:** Next.js 15 + React 19 + App Router + Tailwind + Gemini AI
- **Component structure:** Well-organized, modular, and intuitive
- **Design system:** Comprehensive and clean use of tokens, spacing, type, naming
- **Multimodal modal logic:** Clear separation of modalities (vision, screen, voice)
- **Reusability:** Props-typed, atomic, scoped styling + `cn()` usage = clean dev UX
- **Dark/light theme**: Implemented at system level ✅
- **Real-time:** Supabase subscriptions for live AI activity panel = ✨ brilliant
- **Deployment-ready:** Vercel production-grade config with attention to edge functions

# ⚠️ Gaps and Opportunities for Enhancement

## 🧪 1. **Testing Infrastructure**
Even with the `scripts/test-*` utilities, you're missing automated test coverage across:

### ❌ Missing
- ✅ **Unit Tests** (e.g. component snapshot + prop assertion via React Testing Library)
- ✅ **E2E Tests** (e.g. chat flow, lead capture with Playwright / Cypress)
- ❌ **CI Test Pipeline** (hooked into Vercel or GitHub Actions)

### ✅ Fix
- Add `jest` + `@testing-library/react` for component/unit logic
- Hook Playwright to validate full AI > voice > analysis flow end-to-end before deploy
- Add these test suites:  
  - `ChatInterface.test.tsx`  
  - `VoiceModal.test.tsx`  
  - `LeadCaptureFlow.test.tsx`  
  - `VideoToAppModal.test.tsx`

## 🌍 2. **Internationalization (i18n)**
Currently **fully hardcoded English** — breaks international consulting or enterprise demo scaling.

### 🧠 Why It’s Important
- Gemini can respond in 24+ languages — your UI should invite that behavior
- International orgs will expect localized terms for voice, "share screen", etc.

### ✅ Fix
- Integrate `next-intl` or `react-i18next`
- Load `en`, `no`, `de`, etc. JSON files in `/locales`
- Translate: lead capture, modals, sidebar activity text

## 🪵 3. **Logging & Monitoring (Client-side)**
Though you use toast + local error display, you **lack error observability** (e.g. Sentry, LogRocket).

### 🔍 Why It Matters
- If PDF generation, TTS, or streaming fails — you’ll want visibility
- Crucial for onboarding new engineers or supporting users at scale

### ✅ Fix
- Add Sentry, track `chat input`, `chat stream`, `modal activation`, and `Supabase socket events`
- Configure per-user or session trace ID (for oncall debugging)

## 📦 4. **Code Splitting Strategy for Modals**
All modals are currently preloaded — which is memory-heavy.

### ✅ Fix
Turn your heaviest modals into async boundaries:
```tsx
const VoiceInputModal = React.lazy(() => import('@/components/chat/modals/VoiceInputModal'))

return (
  <Suspense fallback={<Fallback />}>
    <VoiceInputModal {...props} />
  </Suspense>
)
```

## 🧠 5. **Global AI Session Context**
While you do have scoped providers, you're missing a **single, observable session context** shared across all modal/modal/chat flows.

### ✅ Fix
Create `SessionProvider` with:
- `sessionId`
- `capabilitiesTriggered[]`
- `leadContext`
- `aiEvents[]`

Access it anywhere with a `useSession()` hook — enables:
- Streamlined analytics
- Faster context propagation to modals
- AI summary + PDF to track full session state

## 🧹 6. **Semantic HTML + ARIA Clean-Up**
You follow ARIA spec well — but some areas that tend to fall through:

### Audit
- Check all `dialog` and `aria-live` logic renders _once_ (voice modals may clash on focus trap)
- Ensure every navigation + card has a tabindex and logical role
- Use `useId()` for dynamic element labels where needed

## 💡 Bonus Enhancements

| Idea | Benefit |
|------|---------|
| Add **command palette (⌘K)** | Quickly test all AI features from a single input |
| Add **per-modal error logging** | Debug which modality fails often in real user sessions |
| **Expose video-to-app specs to feedback form** | Let users rate AI-generated specs/code directly |

# 🧩 Summary: You're 90% Complete

| Category                  | Rating  | Notes |
|---------------------------|---------|-------|
| Architecture & Layout     | ✅ A+    | Clean modular Next.js |
| Design System             | ✅ A     | Great tokens + spacing |
| Real-Time Implementation  | ✅ A     | Supabase well integrated |
| Multimodality Components  | ✅ A+    | Mic, video, screen, webcam handled masterfully |
| Activity Panel UX         | ✅ A     | Real-time UX enhances AI credibility |
| Testing Coverage          | ⚠️ C     | Needs automation |
| i18n Support              | ⚠️ C     | English only |
| Error Monitoring          | ⚠️ C     | No Sentry/log hooks |
| Session Context Linking   | ⚠️ B     | Can be unified/centralized |
| Modal Performance         | ⚠️ B     | Lazy load recommended |
| Accessibility             | ✅ B+    | Minor cleanup needed |

## ✅ Your Next Steps

1. **Test Coverage:** Add Jest + Playwright  
2. **Session Context:** Central 💡 context store across all AI flows  
3. **Realtime AI Transparency:** Log events to panel + log infrastructure  
4. **Modal Optimization & Lazy Loading**  
5. **i18n and Multi-language UI Support**  
6. **Add Sentry or error analytics**  
7. **Document full AI feature list & update activity mapping**




