import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Find video in DB
  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) {
    return new NextResponse("Video not found", { status: 404 });
  }

  // Get Google Drive token
  const tokenRecord = await prisma.setting.findUnique({
    where: { key: "google_refresh_token" }
  });

  if (!tokenRecord) {
    return new NextResponse("Google Drive not connected", { status: 403 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  
  oauth2Client.setCredentials({ refresh_token: tokenRecord.value });
  
  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Could not get access token");

    // Forward range header if present
    const rangeHeader = req.headers.get("range");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (rangeHeader) {
      headers["Range"] = rangeHeader;
    }

    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${video.driveFileId}?alt=media`,
      { headers }
    );

    if (!driveRes.ok) {
      console.error(`Google Drive error: ${driveRes.status} ${driveRes.statusText}`);
      return new NextResponse("Error fetching video stream", { status: driveRes.status });
    }

    // Proxy the response directly back to the client
    const responseHeaders = new Headers();
    const headersToForward = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ];
    
    headersToForward.forEach((h) => {
      const val = driveRes.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    return new NextResponse(driveRes.body, {
      status: driveRes.status, // Can be 200 or 206
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream error", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
