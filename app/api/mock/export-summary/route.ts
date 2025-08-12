import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Minimal but viewable one-page PDF with proper xref table length
    const pdf = [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj',
      '4 0 obj<</Length 56>>stream',
      'BT /F1 18 Tf 60 200 Td (FB-c Mock PDF Summary) Tj ET',
      'endstream endobj',
      '5 0 obj<</Type/Font/Subtype/Type1/Name/F1/BaseFont/Helvetica>>endobj',
      'xref',
      '0 6',
      '0000000000 65535 f ',
      '0000000010 00000 n ',
      '0000000057 00000 n ',
      '0000000112 00000 n ',
      '0000000259 00000 n ',
      '0000000360 00000 n ',
      'trailer<</Size 6/Root 1 0 R>>',
      'startxref',
      '430',
      '%%EOF'
    ].join('\n')
    const pdfBytes = Buffer.from(pdf)
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


