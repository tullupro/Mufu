import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const videoId = url.searchParams.get("id");

  if (!videoId) {
    return new NextResponse("Missing video id", { status: 400 });
  }

  try {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    
    if (!video) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Try to delete from Google Drive if possible
    const tokenRecord = await prisma.setting.findUnique({
      where: { key: "google_refresh_token" }
    });

    if (tokenRecord) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL + "/api/drive/callback"
      );
      
      oauth2Client.setCredentials({ refresh_token: tokenRecord.value });
      
      try {
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        await drive.files.delete({ fileId: video.driveFileId });
      } catch (e) {
        console.error("Failed to delete from Google Drive, skipping...", e);
      }
    }

    // Delete from database
    await prisma.video.delete({ where: { id: videoId } });

    // Redirect back to admin videos page
    return NextResponse.redirect(new URL("/admin/videos", req.url), { status: 303 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
