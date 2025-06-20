import type { ConversationState } from '../types';

export function determineNextStage(
    currentState: ConversationState,
    userMessageText: string,
    messageCountInSession: number // This param seems to be from an older version of the call, check usage
): ConversationState {
    let {
        stage = 'greeting',
        messagesInStage = 0,
        name = currentState.name,
        email = currentState.email,
        companyInfo = currentState.companyInfo || {},
        messages = currentState.messages || []
    } = currentState;

    let nextStage = stage;
    let aiGuidance = currentState.aiGuidance || "";
    let newSidebarActivity = currentState.sidebarActivity || "";
    // messagesInStage is incremented based on actual messages in the stage,
    // so we use the value from current state and increment it if the stage doesn't change.
    // If stage changes, transitionTo resets it.
    let currentMessagesInThisStage = currentState.messagesInStage || 0;


    const transitionTo = (targetStage: string, guidance: string, activity?: string) => {
        nextStage = targetStage;
        aiGuidance = guidance;
        if (activity !== undefined) newSidebarActivity = activity;
        currentMessagesInThisStage = 0; // Reset for new stage
    };

    switch (stage) {
        case 'greeting':
            if (userMessageText && userMessageText.trim().length > 1 && !userMessageText.includes('@') && userMessageText.split(' ').length < 5) {
                 name = userMessageText.trim();
                 transitionTo('email_request', "User name is " + name + ". Now, ask for their email address to continue the personalized showcase.");
            } else {
                aiGuidance = "I'm F.B/c's AI assistant, here to show you how AI can transform your business. To start, could you please tell me your name?";
                currentMessagesInThisStage++;
            }
            break;

        case 'email_request':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(userMessageText.trim())) {
                email = userMessageText.trim();
                const domain = email.split('@').pop() || "company.com";
                const currentCompanyInfo = companyInfo || {};
                companyInfo = { ...currentCompanyInfo, domain: domain, name: currentCompanyInfo.name || domain.split('.')[0] };
                newSidebarActivity = "company_analysis_triggered";
                transitionTo('email_collected', `Thanks, ${name}! I've got your email: ${email}. I'll quickly look up your company domain "${companyInfo.domain}" using Google Search to tailor this showcase. Then, I'd love to hear about your main business goals or any specific AI interests you have.`);
            } else {
                aiGuidance = `Thanks, ${name}. For the personalized experience, I'll need a valid email address. Could you please provide it?`;
                currentMessagesInThisStage++;
            }
            break;

        case 'email_collected':
            transitionTo('initial_discovery', `Okay ${name}, based on public information about ${companyInfo?.name || companyInfo?.domain} (or if not found, general business context), what's a key business challenge you're facing, or what specific area of AI are you most curious about today?`);
            newSidebarActivity = "company_analysis_complete";
            break;

        case 'initial_discovery':
            if (currentMessagesInThisStage >= 1) { // Changed from >=2 to >=1 to make it transition after first user substantial message
                transitionTo('capability_introduction', `That's insightful, ${name}. Based on what you've shared, I can demonstrate some relevant AI capabilities. Are you interested in seeing something specific, or would you like a suggestion?`);
            } else {
                aiGuidance = `Interesting, ${name}. Tell me more about that. For example, how does that impact your team or your customers? The more I understand, the better I can tailor this AI showcase.`;
                currentMessagesInThisStage++;
            }
            break;

        case 'capability_introduction':
             transitionTo('capability_selection', `Great! You can ask me to demonstrate a capability (e.g., "show image generation," "analyze a website," "process a document") or pick one from the sidebar options. What would you like to explore first, ${name}?`);
             break;

        case 'capability_selection':
            aiGuidance = `Okay ${name}, I'm ready when you are. Let me know which AI capability you'd like to see in action. You can describe it or use the quick demo buttons.`;
            if (currentMessagesInThisStage >= 1 && !userMessageText.toLowerCase().match(/generate|analyze|show|try|demo|website|image|video|document|code/)) {
                 transitionTo('capability_suggestion', `No problem, ${name}! How about we start with something visual? For instance, I can generate a business concept image based on a prompt. Or, if you have a company website, I can analyze it for AI opportunities. Interested in either of those?`);
            } else {
                currentMessagesInThisStage++;
            }
            break;
        case 'capability_suggestion':
            transitionTo('capability_selection', `So, ${name}, what are your thoughts on that suggestion? Or is there another AI capability you'd prefer to explore?`);
            break;

        case 'post_capability_feedback':
            if (currentMessagesInThisStage >= 0) { // Changed from >=1, transition after any user message post-capability
                transitionTo('solution_discussion', `Thanks for the feedback, ${name}! It's helpful to know what resonates. These AI tools can be powerful. Are you thinking about how such capabilities could be applied in your business, perhaps through custom AI solutions or team training?`);
                newSidebarActivity = "";
            } else {
                aiGuidance = `What did you think of that demonstration, ${name}? Any immediate thoughts or questions about how that AI capability works or its potential uses?`;
                currentMessagesInThisStage++;
            }
            break;

        case 'solution_discussion':
            if (currentMessagesInThisStage >= 1) { // Changed from >=2
                transitionTo('summary_offer', `This has been a good discussion, ${name}. I can prepare a personalized summary of our conversation, highlighting the AI capabilities we touched upon and potential next steps for your business. Would you like that?`);
            } else {
                aiGuidance = `F.B/c specializes in helping businesses like yours integrate AI, ${name}. Whether it's hands-on workshops for your team or developing custom AI-powered tools, the goal is practical application and real results. Do you have any questions about that?`;
                currentMessagesInThisStage++;
            }
            break;

        case 'summary_offer':
            if (userMessageText.toLowerCase().match(/yes|ok|sure|please|generate|summary|do it/)) {
                transitionTo('finalizing', `Excellent, ${name}! I'll prepare that summary for you. It will include key insights from our chat and a special consultant brief for Farzad. This helps him understand your needs if you decide to book a follow-up consultation.`);
                newSidebarActivity = "summary_generation_started";
            } else if (userMessageText.toLowerCase().match(/no|not yet|later|skip/)) {
                transitionTo('solution_discussion', `No problem at all, ${name}. We can skip the summary for now. Is there anything else about AI applications or F.B/c's services you'd like to discuss?`);
                 newSidebarActivity = "";
            } else {
                aiGuidance = `Just to confirm, ${name}, would you like me to generate that personalized AI showcase summary for you now?`;
                currentMessagesInThisStage++;
            }
            break;

        case 'finalizing':
            aiGuidance = `Your summary is being prepared, ${name}. If you choose to book a strategy session, Farzad will use this to hit the ground running. Thank you for experiencing the F.B/c AI Showcase!`;
            currentMessagesInThisStage++; //Though usually this is a terminal state from AI side
            break;

        case 'limit_reached':
            aiGuidance = `We've reached the message limit for this demo session, ${name}. To continue exploring how AI can benefit your business, please consider booking a consultation with Farzad.`;
            break;

        default:
            transitionTo('greeting', "It seems we got off track. Let's start over. What's your name?");
            newSidebarActivity = "";
            break;
    }

    return {
        ...currentState,
        stage: nextStage,
        messages: currentState.messages, // Pass back original messages, actual update happens in handler
        messagesInStage: currentMessagesInThisStage,
        name, email, companyInfo,
        aiGuidance,
        sidebarActivity: newSidebarActivity,
    };
}
