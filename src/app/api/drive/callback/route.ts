import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new NextResponse("No code provided", { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/drive/callback"
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      await prisma.setting.upsert({
        where: { key: "google_refresh_token" },
        update: { value: tokens.refresh_token },
        create: { key: "google_refresh_token", value: tokens.refresh_token },
      });
    }

    return NextResponse.redirect(new URL("/admin?drive=connected", req.url));
  } catch (error) {
    console.error("Error getting tokens", error);
    return NextResponse.redirect(new URL("/admin?drive=error", req.url));
  }
}
