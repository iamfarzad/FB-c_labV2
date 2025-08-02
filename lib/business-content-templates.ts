import type { BusinessContentTemplate, UserBusinessContext } from '@/types/business-content'

/**
 * F.B/c Business Content Templates
 * Static templates for generating business content with F.B/c design tokens
 */

export const roiCalculatorTemplate: BusinessContentTemplate = {
  id: 'roi_calculator',
  name: 'ROI Calculator',
  description: 'Interactive ROI analysis tool for AI automation projects',
  triggerKeywords: ['roi', 'return on investment', 'calculate', 'savings', 'cost benefit'],
  generateContent: (context: UserBusinessContext) => {
    const industry = context.industry || 'Technology'
    const companySize = context.companySize || 'SMB'
    
    return `
      <div class="fbc-business-card">
        <div class="fbc-flex-between mb-6">
          <h3 class="text-xl font-semibold text-foreground">AI Automation ROI Calculator</h3>
          <div class="fbc-status-indicator active">Interactive Tool</div>
        </div>
        
        <p class="text-muted-foreground mb-6">
          Calculate the potential return on investment for AI automation in your ${industry.toLowerCase()} business.
        </p>

        <form data-interaction-id="roi_calculator_form" data-interaction-type="roi_input" data-business-tool="roi_calculator">
          <div class="fbc-grid-2 mb-6">
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="current_process_time">Current Process Time (hours/week)</label>
              <input 
                type="number" 
                id="current_process_time" 
                name="current_process_time"
                class="fbc-business-input" 
                placeholder="40"
                min="1"
                required
              />
            </div>
            
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="hourly_cost">Average Hourly Cost ($)</label>
              <input 
                type="number" 
                id="hourly_cost" 
                name="hourly_cost"
                class="fbc-business-input" 
                placeholder="50"
                min="1"
                required
              />
            </div>
          </div>

          <div class="fbc-grid-2 mb-6">
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="automation_potential">Automation Potential (%)</label>
              <select id="automation_potential" name="automation_potential" class="fbc-business-select" required>
                <option value="">Select potential</option>
                <option value="25">25% - Basic automation</option>
                <option value="50">50% - Moderate automation</option>
                <option value="75">75% - High automation</option>
                <option value="90">90% - Full automation</option>
              </select>
            </div>
            
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="implementation_cost">Implementation Cost ($)</label>
              <input 
                type="number" 
                id="implementation_cost" 
                name="implementation_cost"
                class="fbc-business-input" 
                placeholder="10000"
                min="0"
                required
              />
            </div>
          </div>

          <div class="fbc-flex-center">
            <button 
              type="submit"
              class="fbc-business-button"
              data-interaction-id="calculate_roi"
              data-interaction-type="roi_input"
            >
              Calculate ROI
            </button>
          </div>
        </form>

        <div class="mt-6 p-4 bg-muted/20 rounded-xl">
          <p class="text-sm text-muted-foreground text-center">
            💡 This calculator provides estimates based on industry standards for ${companySize} companies in ${industry}.
          </p>
        </div>
      </div>
    `
  }
}

export const leadCaptureTemplate: BusinessContentTemplate = {
  id: 'lead_capture',
  name: 'Lead Capture Form',
  description: 'Dynamic lead capture form for consultation requests',
  triggerKeywords: ['consultation', 'contact', 'meeting', 'discuss', 'help', 'schedule'],
  generateContent: (context: UserBusinessContext) => {
    const stage = context.conversationStage || 'discovery'
    const challenges = context.businessChallenges || []
    
    return `
      <div class="fbc-lead-form">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-foreground mb-2">Ready to Transform Your Business?</h3>
          <p class="text-muted-foreground">
            Let's discuss how AI automation can solve your specific challenges and boost productivity.
          </p>
        </div>

        <form data-interaction-id="lead_capture_form" data-interaction-type="lead_submit" data-business-tool="lead_capture">
          <div class="fbc-grid-2 mb-4">
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="lead_name">Full Name *</label>
              <input 
                type="text" 
                id="lead_name" 
                name="name"
                class="fbc-business-input" 
                placeholder="Your full name"
                required
              />
            </div>
            
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="lead_email">Email Address *</label>
              <input 
                type="email" 
                id="lead_email" 
                name="email"
                class="fbc-business-input" 
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div class="fbc-grid-2 mb-4">
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="lead_company">Company Name</label>
              <input 
                type="text" 
                id="lead_company" 
                name="company"
                class="fbc-business-input" 
                placeholder="Your company"
              />
            </div>
            
            <div class="fbc-input-group">
              <label class="fbc-input-label" for="lead_role">Your Role</label>
              <select id="lead_role" name="role" class="fbc-business-select">
                <option value="">Select your role</option>
                <option value="ceo">CEO/Founder</option>
                <option value="cto">CTO/Tech Lead</option>
                <option value="operations">Operations Manager</option>
                <option value="marketing">Marketing Manager</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="fbc-input-group mb-4">
            <label class="fbc-input-label" for="lead_challenges">Primary Business Challenge</label>
            <textarea 
              id="lead_challenges" 
              name="challenges"
              class="fbc-business-textarea" 
              placeholder="Describe your main business challenge or what you'd like to automate..."
            ></textarea>
          </div>

          <div class="fbc-input-group mb-6">
            <label class="fbc-input-label" for="lead_timeline">Project Timeline</label>
            <select id="lead_timeline" name="timeline" class="fbc-business-select">
              <option value="">Select timeline</option>
              <option value="immediate">Immediate (within 1 month)</option>
              <option value="short">Short-term (1-3 months)</option>
              <option value="medium">Medium-term (3-6 months)</option>
              <option value="long">Long-term (6+ months)</option>
            </select>
          </div>

          <div class="fbc-flex-center">
            <button 
              type="submit"
              class="fbc-business-button w-full"
              data-interaction-id="submit_lead_form"
              data-interaction-type="lead_submit"
            >
              Schedule Free Consultation
            </button>
          </div>
        </form>

        <div class="mt-4 text-center">
          <p class="text-xs text-muted-foreground">
            🔒 Your information is secure and will only be used to contact you about your consultation.
          </p>
        </div>
      </div>
    `
  }
}

export const consultationPlannerTemplate: BusinessContentTemplate = {
  id: 'consultation_planner',
  name: 'Consultation Planner',
  description: 'Step-by-step consultation planning workflow',
  triggerKeywords: ['plan', 'strategy', 'roadmap', 'implementation', 'steps', 'process'],
  generateContent: (context: UserBusinessContext) => {
    const industry = context.industry || 'your industry'
    const goals = context.currentGoals || ['Improve efficiency', 'Reduce costs']
    
    return `
      <div class="fbc-business-card">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-foreground mb-2">AI Implementation Roadmap</h3>
          <p class="text-muted-foreground">
            Customized implementation plan for ${industry} businesses
          </p>
        </div>

        <div class="space-y-4">
          <div class="fbc-consultation-step active" data-interaction-id="step_discovery" data-interaction-type="consultation_step">
            <div class="fbc-flex-between mb-2">
              <h4 class="font-semibold text-foreground">1. Discovery & Analysis</h4>
              <div class="fbc-status-indicator active">Current Step</div>
            </div>
            <p class="text-sm text-muted-foreground mb-3">
              Analyze your current processes and identify automation opportunities.
            </p>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>• Process mapping and documentation</li>
              <li>• Pain point identification</li>
              <li>• ROI potential assessment</li>
            </ul>
          </div>

          <div class="fbc-consultation-step" data-interaction-id="step_strategy" data-interaction-type="consultation_step">
            <div class="fbc-flex-between mb-2">
              <h4 class="font-semibold text-foreground">2. Strategy Development</h4>
              <div class="fbc-status-indicator pending">Upcoming</div>
            </div>
            <p class="text-sm text-muted-foreground mb-3">
              Create a tailored AI automation strategy for your business goals.
            </p>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>• Technology selection</li>
              <li>• Implementation timeline</li>
              <li>• Resource allocation</li>
            </ul>
          </div>

          <div class="fbc-consultation-step" data-interaction-id="step_prototype" data-interaction-type="consultation_step">
            <div class="fbc-flex-between mb-2">
              <h4 class="font-semibold text-foreground">3. Rapid Prototyping</h4>
              <div class="fbc-status-indicator pending">Upcoming</div>
            </div>
            <p class="text-sm text-muted-foreground mb-3">
              Build and test proof-of-concept solutions.
            </p>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>• MVP development</li>
              <li>• User testing</li>
              <li>• Performance validation</li>
            </ul>
          </div>

          <div class="fbc-consultation-step" data-interaction-id="step_implementation" data-interaction-type="consultation_step">
            <div class="fbc-flex-between mb-2">
              <h4 class="font-semibold text-foreground">4. Full Implementation</h4>
              <div class="fbc-status-indicator pending">Future</div>
            </div>
            <p class="text-sm text-muted-foreground mb-3">
              Deploy and integrate AI solutions into your workflow.
            </p>
            <ul class="text-sm text-muted-foreground space-y-1">
              <li>• System integration</li>
              <li>• Team training</li>
              <li>• Performance monitoring</li>
            </ul>
          </div>
        </div>

        <div class="mt-6 fbc-flex-center">
          <button 
            class="fbc-business-button"
            data-interaction-id="start_consultation"
            data-interaction-type="consultation_step"
          >
            Start Your AI Journey
          </button>
        </div>

        <div class="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <p class="text-sm text-foreground font-medium mb-1">Your Goals:</p>
          <ul class="text-sm text-muted-foreground">
            ${goals.map(goal => `<li>• ${goal}</li>`).join('')}
          </ul>
        </div>
      </div>
    `
  }
}

export const businessAnalysisTemplate: BusinessContentTemplate = {
  id: 'business_analysis',
  name: 'Business Analysis Dashboard',
  description: 'Interactive business metrics and analysis display',
  triggerKeywords: ['analysis', 'metrics', 'dashboard', 'performance', 'data', 'insights'],
  generateContent: (context: UserBusinessContext) => {
    const industry = context.industry || 'Technology'
    const companySize = context.companySize || 'SMB'
    
    return `
      <div class="fbc-business-card">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-foreground mb-2">Business Analysis Dashboard</h3>
          <p class="text-muted-foreground">
            Key metrics and insights for ${companySize} ${industry.toLowerCase()} companies
          </p>
        </div>

        <div class="fbc-grid-3 mb-6">
          <div class="fbc-metric-display">
            <div class="fbc-metric-value">73%</div>
            <div class="fbc-metric-label">Automation Potential</div>
          </div>
          
          <div class="fbc-metric-display">
            <div class="fbc-metric-value">$2.4M</div>
            <div class="fbc-metric-label">Annual Savings Potential</div>
          </div>
          
          <div class="fbc-metric-display">
            <div class="fbc-metric-value">8.2x</div>
            <div class="fbc-metric-label">Expected ROI</div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="fbc-chart-container">
            <h4 class="font-semibold text-foreground mb-3">Process Efficiency Analysis</h4>
            <div class="space-y-3">
              <div>
                <div class="fbc-flex-between mb-1">
                  <span class="text-sm text-foreground">Data Processing</span>
                  <span class="text-sm text-accent font-medium">85% improvement potential</span>
                </div>
                <div class="fbc-progress-bar">
                  <div class="fbc-progress-fill" style="width: 85%"></div>
                </div>
              </div>
              
              <div>
                <div class="fbc-flex-between mb-1">
                  <span class="text-sm text-foreground">Customer Support</span>
                  <span class="text-sm text-accent font-medium">67% improvement potential</span>
                </div>
                <div class="fbc-progress-bar">
                  <div class="fbc-progress-fill" style="width: 67%"></div>
                </div>
              </div>
              
              <div>
                <div class="fbc-flex-between mb-1">
                  <span class="text-sm text-foreground">Report Generation</span>
                  <span class="text-sm text-accent font-medium">92% improvement potential</span>
                </div>
                <div class="fbc-progress-bar">
                  <div class="fbc-progress-fill" style="width: 92%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="fbc-roi-summary">
            <h4 class="font-semibold text-foreground mb-3">ROI Projection Summary</h4>
            <div class="fbc-grid-2">
              <div>
                <p class="text-sm text-muted-foreground">Implementation Cost</p>
                <p class="text-lg font-semibold text-foreground">$45,000</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Payback Period</p>
                <p class="text-lg font-semibold text-green-600">4.2 months</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 fbc-flex-center space-x-3">
          <button 
            class="fbc-business-button"
            data-interaction-id="detailed_analysis"
            data-interaction-type="analysis_request"
          >
            Get Detailed Analysis
          </button>
          <button 
            class="fbc-secondary-button"
            data-interaction-id="schedule_review"
            data-interaction-type="consultation_step"
          >
            Schedule Review
          </button>
        </div>
      </div>
    `
  }
}

// Export all templates
export const businessContentTemplates: BusinessContentTemplate[] = [
  roiCalculatorTemplate,
  leadCaptureTemplate,
  consultationPlannerTemplate,
  businessAnalysisTemplate
]

// Helper function to find template by keywords
export function findTemplateByKeywords(message: string): BusinessContentTemplate | null {
  const lowerMessage = message.toLowerCase()
  
  for (const template of businessContentTemplates) {
    const hasKeyword = template.triggerKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    )
    if (hasKeyword) {
      return template
    }
  }
  
  return null
}

// Helper function to generate content from template
export function generateBusinessContent(
  template: BusinessContentTemplate,
  context: UserBusinessContext = {}
): string {
  return template.generateContent(context)
}
