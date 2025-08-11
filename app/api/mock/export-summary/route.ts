import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Minimal mock PDF: return small valid PDF bytes
    const pdfBytes = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 50 150 Td (FB-c Mock PDF) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/Name/F1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000115 00000 n \n0000000210 00000 n \n0000000323 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n403\n%%EOF'
    )
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="FB-c_Mock_Summary.pdf"'
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'mock failed' }, { status: 500 })
  }
}


