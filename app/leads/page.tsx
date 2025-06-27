'use client';

import { useEffect, useState } from 'react';
import { leadSubscriptionService } from '@/supabase/lead-subscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';

interface LeadSummary {
  id: string;
  name: string;
  email: string;
  company_name?: string | null;
  conversation_summary: string;
  consultant_brief: string;
  lead_score: number;
  ai_capabilities_shown: string[];
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company_name: '',
    conversation_summary: 'Initial conversation summary',
    consultant_brief: 'Initial consultant brief',
    lead_score: 1,
    ai_capabilities_shown: ['initial_capability']
  });
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('Not connected');
  const { toast } = useToast();

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Load initial leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('lead_summaries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leads',
          type: 'destructive',
        });
      }
    };

    fetchLeads();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Handle new leads
    const handleNewLead = (payload: any) => {
      const lead = payload as LeadSummary;
      setLeads(prev => [lead, ...prev]);
      toast({
        title: 'New Lead Added',
        description: `${lead.name} (${lead.email})`,
        type: 'success'
      });
    };

    // Handle lead updates
    const handleUpdateLead = (payload: any) => {
      const updatedLead = payload as LeadSummary;
      setLeads(prev => 
        prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
      );
      toast({
        title: 'Lead Updated',
        description: `${updatedLead.name}'s information was updated`,
        type: 'success'
      });
    };

    // Handle lead deletions
    const handleDeleteLead = (payload: any) => {
      const deletedLead = payload as LeadSummary;
      setLeads(prev => prev.filter(lead => lead.id !== deletedLead.id));
      toast({
        title: 'Lead Deleted',
        description: `${deletedLead.name} was removed`,
        type: 'destructive'
      });
    };

    // Subscribe to changes
    leadSubscriptionService.subscribeToLeadSummaries({
      onInsert: handleNewLead,
      onUpdate: handleUpdateLead,
      onDelete: handleDeleteLead,
    });

    setSubscriptionStatus('Connected');

    // Cleanup on unmount
    return () => {
      leadSubscriptionService.unsubscribe();
      setSubscriptionStatus('Disconnected');
    };
  }, []);

  // Add a new lead
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_summaries')
        .insert([{
          name: newLead.name,
          email: newLead.email,
          company_name: newLead.company_name || null,
          conversation_summary: newLead.conversation_summary,
          consultant_brief: newLead.consultant_brief,
          lead_score: newLead.lead_score,
          ai_capabilities_shown: newLead.ai_capabilities_shown,
          created_at: new Date().toISOString()
        }] as const)
        .select()
        .single();

      if (error) throw error;
      
      // Reset form
      setNewLead({
        name: '',
        email: '',
        company_name: '',
        conversation_summary: 'Initial conversation summary',
        consultant_brief: 'Initial consultant brief',
        lead_score: 1,
        ai_capabilities_shown: ['initial_capability']
      });
      toast({
        title: 'Success',
        description: 'Lead added successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to add lead',
        type: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a lead
  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const { error } = await supabase
        .from('lead_summaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // The deletion will be handled by the subscription
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        type: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leads Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Lead Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company (Optional)
                </label>
                <Input
                  id="company"
                  value={newLead.company_name || ''}
                  onChange={(e) => setNewLead({...newLead, company_name: e.target.value})}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label htmlFor="score" className="block text-sm font-medium mb-1">
                  Lead Score (1-10)
                </label>
                <Input
                  id="score"
                  type="number"
                  min="1"
                  max="10"
                  value={newLead.lead_score}
                  onChange={(e) => setNewLead({...newLead, lead_score: parseInt(e.target.value) || 1})}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Lead'}
              </Button>
            </form>
            <div className="mt-4 text-sm text-muted-foreground">
              Status: <span className="font-medium">{subscriptionStatus}</span>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Leads ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leads found. Add one to get started!
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="space-y-1">
                            <h3 className="font-medium">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                            {lead.company_name && (
                              <p className="text-sm text-muted-foreground">{lead.company_name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Score: {lead.lead_score}/10
                              </span>
                              {lead.ai_capabilities_shown?.length > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {lead.ai_capabilities_shown.length} AI Capabilities
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              <span className="font-medium">Summary:</span> {lead.conversation_summary}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Added: {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
