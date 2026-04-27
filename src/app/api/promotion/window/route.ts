import { NextResponse, type NextRequest } from "next/server";
import { getClientIpFromHeaders, openPromotionWindowForIp } from "@/lib/ip-promotion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIpFromHeaders(request.headers);
    const promotion = await openPromotionWindowForIp(ipAddress);

    return NextResponse.json(promotion, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to initialize promotion window.",
      },
      { status: 500 },
    );
  }
}
