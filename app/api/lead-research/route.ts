import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase/server';
import { logServerActivity } from '@/lib/server-activity-logger';
import GoogleSearchService from '@/lib/services/google-search-service';
import { LeadManager } from '@/lib/lead-manager';
import { validateRequest, sanitizeString, leadResearchSchema } from '@/lib/validation';

interface CompanyResearchData {
  companyInfo?: {
    name: string;
    summary: string;
    industry: string;
    size: string;
    website: string;
  };
  industryAnalysis?: {
    techAdoption: number;
    digitalTransformation: number;
    processAutomation: number;
  };
  searchResults: Array<{
    title: string;
    snippet: string;
    url: string;
    source: string;
  }>;
}

async function performCompanyResearch(email: string, name?: string, company?: string): Promise<CompanyResearchData> {
  const researchData: CompanyResearchData = {
    searchResults: []
  };

  if (!GoogleSearchService.isConfigured()) {
    console.log('Google Search API not configured, returning empty research data');
    return researchData;
  }

  try {
    // Extract domain from email for company research
    const emailDomain = email.split('@')[1];
    const companyName = company || emailDomain.split('.')[0];

    console.log(`🔍 Performing company research for: ${companyName} (${emailDomain})`);

    // Search for company information
    const companySearch = await GoogleSearchService.searchCompany(
      companyName,
      ['about', 'company', 'business', 'services', 'products']
    );

    if (companySearch.items && companySearch.items.length > 0) {
      // Process company search results
      companySearch.items.slice(0, 5).forEach((item) => {
        researchData.searchResults.push({
          title: item.title,
          snippet: item.snippet || 'No description available',
          url: item.link,
          source: 'company_search'
        });
      });

      // Extract company information from first result
      const firstResult = companySearch.items[0];
      researchData.companyInfo = {
        name: companyName,
        summary: firstResult.snippet || 'No description available',
        industry: 'Technology', // Default, could be enhanced with AI analysis
        size: 'Unknown',
        website: emailDomain
      };
    }

    // Search for person information if name is provided
    if (name) {
      console.log(`🔍 Performing person research for: ${name}`);
      
      const personSearch = await GoogleSearchService.searchPerson(
        name,
        companyName,
        ['LinkedIn', 'profile', 'biography', 'about']
      );

      if (personSearch.items && personSearch.items.length > 0) {
        personSearch.items.slice(0, 3).forEach((item) => {
          researchData.searchResults.push({
            title: item.title,
            snippet: item.snippet || 'No description available',
            url: item.link,
            source: 'person_search'
          });
        });
      }
    }

    // Analyze industry for AI readiness (simplified analysis)
    researchData.industryAnalysis = {
      techAdoption: 0.7, // Default values, could be enhanced with AI analysis
      digitalTransformation: 0.6,
      processAutomation: 0.5
    };

    console.log(`✅ Company research completed: ${researchData.searchResults.length} results found`);
    return researchData;

  } catch (error) {
    console.error('Company research error:', error);
    return researchData;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`🔍 Lead research request started - ${correlationId}`);

    // Parse and validate request
    const rawData = await req.json();
    const validation = validateRequest(leadResearchSchema, rawData);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), { status: 400 });
    }

    const { email, sessionId, name, company } = validation.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email);
    const sanitizedName = name ? sanitizeString(name) : undefined;
    const sanitizedCompany = company ? sanitizeString(company) : undefined;

    // Log research start activity
    await logServerActivity({
      type: 'lead_research',
      title: 'Company Research Started',
      description: `Starting research for ${sanitizedEmail}`,
      status: 'in_progress',
      metadata: {
        correlationId,
        sessionId,
        email: sanitizedEmail,
        name: sanitizedName,
        company: sanitizedCompany
      }
    });

    // Perform company research
    const researchData = await performCompanyResearch(
      sanitizedEmail,
      sanitizedName,
      sanitizedCompany
    );

    // Store research results in database
    try {
      const supabase = getSupabase();
      
      // Check if lead already exists
      const { data: existingLead, error: findError } = await supabase
        .from('lead_summaries')
        .select('id')
        .eq('email', sanitizedEmail)
        .single();

      let leadId: string;

      if (existingLead) {
        // Update existing lead
        leadId = existingLead.id;
        
        const { error: updateError } = await supabase
          .from('lead_summaries')
          .update({
            research_data: researchData,
            research_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Failed to update lead research data:', updateError);
        }
      } else {
        // Create new lead
        const { data: newLead, error: createError } = await supabase
          .from('lead_summaries')
          .insert({
            email: sanitizedEmail,
            name: sanitizedName || 'Unknown',
            company: sanitizedCompany || researchData.companyInfo?.name || 'Unknown',
            research_data: researchData,
            research_completed_at: new Date().toISOString(),
            session_id: sessionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Failed to create lead with research data:', createError);
          leadId = 'temp-' + Date.now();
        } else {
          leadId = newLead.id;
        }
      }

      // Store individual search results
      if (researchData.searchResults.length > 0) {
        const searchResultsToInsert = researchData.searchResults.map(result => ({
          lead_id: leadId,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          source: result.source,
          created_at: new Date().toISOString()
        }));

        const { error: searchError } = await supabase
          .from('lead_search_results')
          .upsert(searchResultsToInsert, { onConflict: 'lead_id,url' });

        if (searchError) {
          console.error('Failed to store search results:', searchError);
        }
      }

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue without database storage
    }

    // Log successful completion
    await logServerActivity({
      type: 'lead_research',
      title: 'Company Research Completed',
      description: `Research completed for ${sanitizedEmail} - ${researchData.searchResults.length} results found`,
      status: 'completed',
      metadata: {
        correlationId,
        sessionId,
        email: sanitizedEmail,
        resultsCount: researchData.searchResults.length,
        processingTime: Date.now() - startTime
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: researchData,
      metadata: {
        correlationId,
        processingTime: Date.now() - startTime,
        resultsCount: researchData.searchResults.length
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId
      }
    });

  } catch (error: any) {
    console.error('Lead research request failed:', error);

    // Log error
    await logServerActivity({
      type: 'error',
      title: 'Lead Research Failed',
      description: error.message || 'Unknown error during lead research',
      status: 'failed',
      metadata: {
        correlationId,
        error: error.message || 'Unknown error',
        processingTime: Date.now() - startTime
      }
    });

    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred during research'
    }), { status: 500 });
  }
}
