// utils/pdfGenerator.ts
import jsPDF from 'jspdf'

export const generateFBCReport = async (summaryData: {
  name: string
  email: string
  companyName?: string
  summary: string
  leadScore: number
  capabilitiesShown: string[]
}): Promise<string> => {
  const pdf = new jsPDF()

  // F.B/c Header
  pdf.setFontSize(24)
  pdf.setTextColor(44, 90, 160) // F.B/c blue
  pdf.text('F.B/c AI Consulting', 20, 30)

  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  pdf.text('AI Transformation Report', 20, 45)

  // Client Information
  pdf.setFontSize(12)
  pdf.text(`Prepared for: ${summaryData.name}`, 20, 65)
  pdf.text(`Company: ${summaryData.companyName || 'N/A'}`, 20, 75)
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 85)
  pdf.text(`AI Readiness Score: ${summaryData.leadScore}/100`, 20, 95)

  // Capabilities Demonstrated
  let startY = 115; // Initial Y position for capabilities
  pdf.setFontSize(14)
  pdf.text('AI Capabilities Demonstrated:', 20, startY)
  startY += 15; // Increment Y after title

  pdf.setFontSize(10)
  summaryData.capabilitiesShown.forEach((capability, index) => {
    if (startY > 270) { // Check if new page is needed
        pdf.addPage();
        startY = 30; // Reset Y for new page
        pdf.setFontSize(14); // Reset title font for new page context if needed
        pdf.text('AI Capabilities Demonstrated (Continued):', 20, startY);
        startY +=15;
        pdf.setFontSize(10); // Reset item font
    }
    pdf.text(`✓ ${capability}`, 25, startY)
    startY += 8; // Increment Y for next capability
  })

  // Adjust startY for summary based on where capabilities list ended
  startY += 10; // Add some padding before summary

  if (startY > 250) { // Check if summary needs to start on a new page
      pdf.addPage();
      startY = 30;
  }

  // Executive Summary
  pdf.setFontSize(14)
  pdf.text('Executive Summary:', 20, startY)
  startY += 15;

  pdf.setFontSize(10)
  const summaryLines = pdf.splitTextToSize(summaryData.summary, 170) // 170 is width of text block

  summaryLines.forEach((line: string) => { // Iterate over lines
    if (startY > 270) { // Check for page break
        pdf.addPage();
        startY = 30; // Reset Y for new page
        // Optionally add a continued title for summary if it spans pages
        pdf.setFontSize(14);
        pdf.text('Executive Summary (Continued):', 20, startY);
        startY +=15;
        pdf.setFontSize(10);
    }
    pdf.text(line, 20, startY);
    startY += 7; // Increment Y for next line (adjust 7 based on font size and line spacing)
  });

  // Next Steps
  if (startY > 200) { // Check if next steps section needs a new page
      pdf.addPage();
      startY = 30;
  } else {
      startY += 20; // Add padding
  }

  pdf.setFontSize(16)
  pdf.setTextColor(44, 90, 160)
  pdf.text('Next Steps', 20, startY)
  startY += 20; // Increment Y

  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  const nextSteps = [
    '1. Schedule your free 15-minute strategy session',
    '2. Receive custom AI implementation roadmap',
    '3. Choose between training or consulting engagement',
    '4. Begin AI transformation journey'
  ]

  nextSteps.forEach((step) => {
    if (startY > 270) {
        pdf.addPage();
        startY = 30;
    }
    pdf.text(step, 20, startY)
    startY += 15; // Increment Y for next step
  })

  // Contact Information
  if (startY > 220) { // Check if contact info needs a new page
      pdf.addPage();
      startY = 30;
  } else {
      startY += 10; // Add padding
  }
  pdf.setFontSize(14)
  pdf.text('Contact F.B/c AI Consulting:', 20, startY)
  startY += 15;

  pdf.setFontSize(10)
  const contactInfo = [
    'Farzad Bayat, Founder',
    'Email: bayatfarzad@gmail.com',
    'Website: [Your Website]', // Placeholder
    'Book Consultation: [Calendar Link]' // Placeholder
  ];

  contactInfo.forEach((info) => {
    if (startY > 270) {
        pdf.addPage();
        startY = 30;
    }
    pdf.text(info, 20, startY);
    startY += 10; // Increment for next line of contact info
  });

  // Footer - ensure it's at the bottom
  // If current page is too full, add a new one for the footer or try to fit it.
  // For simplicity, this adds it at a fixed position on the last page.
  // A more robust solution would calculate remaining space.
  if (startY > 275) { // If content is too close to bottom, force footer to new page
      pdf.addPage();
      startY = 280; // Position footer at the bottom of new page
  } else {
      startY = 280; // Position footer at the bottom of current page
  }

  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text('This report was generated using AI technology that F.B/c can implement for your business.', 20, startY, { align: 'left', maxWidth: 170 }) // Added maxWidth for wrapping

  return pdf.output('datauristring')
}
