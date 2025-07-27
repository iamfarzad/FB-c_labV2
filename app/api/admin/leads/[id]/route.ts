import { supabaseService } from "@/lib/supabase/client"
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate input
    if (!status || !['new', 'contacted', 'qualified', 'converted'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: new, contacted, qualified, converted" },
        { status: 400 }
      );
    }

    // Update lead status
    const { data, error } = await supabaseService
      .from("lead_summaries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Lead update error:", error);
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error) {
    console.error("Admin lead update error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }

  try {
    const { id } = params;

    // Get lead details
    const { data, error } = await supabaseService
      .from("lead_summaries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Lead fetch error:", error);
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error("Admin lead fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
} 