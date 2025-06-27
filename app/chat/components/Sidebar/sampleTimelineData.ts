import { ActivityItem } from '../../types/chat';

export const sampleTimelineActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'search',
    title: 'Searching LinkedIn',
    description: 'Finding relevant profiles and information',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    details: [
      'Found 3 relevant profiles matching search criteria',
      'Extracted professional experience and career history',
      'Identified key skills, endorsements, and connections',
      'Retrieved contact information and recent activity'
    ]
  },
  {
    id: '2',
    type: 'link',
    title: 'Finding Online Presence',
    description: 'Discovering additional online profiles and content',
    timestamp: Date.now() - 1000 * 60 * 4, // 4 minutes ago
    details: [
      'Scanned Google search results for additional profiles',
      'Located professional portfolio and personal website',
      'Found recent publications, articles, and blog posts',
      'Identified social media presence and digital footprint'
    ]
  },
  {
    id: '3',
    type: 'analyze',
    title: 'Analyzing Profile Data',
    description: 'Processing and understanding the collected information',
    timestamp: Date.now() - 1000 * 60 * 3, // 3 minutes ago
    details: [
      'Processing career trajectory and professional growth',
      'Identifying expertise patterns and skill development',
      'Extracting key achievements and notable projects',
      'Analyzing communication style and professional brand'
    ]
  },
  {
    id: '4',
    type: 'generate',
    title: 'Generating Insights',
    description: 'Creating valuable findings from the analysis',
    timestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    details: [
      'Creating comprehensive professional summary',
      'Highlighting unique value propositions and strengths',
      'Structuring personalized recommendations',
      'Developing strategic career advancement suggestions'
    ]
  },
  {
    id: '5',
    type: 'complete',
    title: 'Creating Summary',
    description: 'Finalizing the analysis report',
    timestamp: Date.now() - 1000 * 60 * 1, // 1 minute ago
    details: [
      'Formatting final document with proper structure',
      'Adding visual elements and professional styling',
      'Preparing multiple export formats (PDF, MD, TXT)',
      'Finalizing summary with actionable insights'
    ]
  }
];

export default sampleTimelineActivities;
