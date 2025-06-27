import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface LeadSummary {
  id: string;
  created_at: string;
  updated_at: string;
  // Add other lead summary fields as needed
  [key: string]: any;
}

class LeadSubscriptionService {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private isSubscribed = false;
  
  /**
   * Start listening to lead summary changes
   */
  public subscribeToLeadSummaries({
    onInsert,
    onUpdate,
    onDelete,
  }: {
    onInsert?: (payload: LeadSummary) => void;
    onUpdate?: (payload: LeadSummary) => void;
    onDelete?: (payload: LeadSummary) => void;
  }) {
    if (this.isSubscribed) {
      console.warn('Already subscribed to lead summaries');
      return;
    }

    console.log('🔔 Subscribing to lead_summaries changes...');
    
    this.channel = supabase
      .channel('lead_summaries_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_summaries'
        },
        (payload) => {
          console.log('✅ New lead added:', payload.new);
          onInsert?.(payload.new as LeadSummary);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lead_summaries'
        },
        (payload) => {
          console.log('🔄 Lead updated:', payload.new);
          onUpdate?.(payload.new as LeadSummary);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lead_summaries'
        },
        (payload) => {
          console.log('🗑️ Lead deleted:', payload.old);
          onDelete?.(payload.old as LeadSummary);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
          console.log('✅ Successfully subscribed to lead_summaries changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to lead_summaries changes');
          this.isSubscribed = false;
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Subscription to lead_summaries timed out');
          this.isSubscribed = false;
        }
      });
  }

  /**
   * Unsubscribe from lead summary changes
   */
  public unsubscribe() {
    if (this.channel) {
      console.log('🔕 Unsubscribing from lead_summaries changes...');
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isSubscribed = false;
    }
  }

  /**
   * Check if currently subscribed
   */
  public get isActive(): boolean {
    return this.isSubscribed;
  }
}

// Singleton instance
export const leadSubscriptionService = new LeadSubscriptionService();

// Example usage:
/*
// In your component or page:
import { leadSubscriptionService } from '@/supabase/lead-subscriptions';

// Subscribe to changes
useEffect(() => {
  const handleNewLead = (lead: LeadSummary) => {
    console.log('New lead received:', lead);
    // Update your UI here
  };

  leadSubscriptionService.subscribeToLeadSummaries({
    onInsert: handleNewLead,
    onUpdate: (lead) => console.log('Lead updated:', lead),
    onDelete: (lead) => console.log('Lead deleted:', lead)
  });

  // Cleanup on unmount
  return () => {
    leadSubscriptionService.unsubscribe();
  };
}, []);
*/
