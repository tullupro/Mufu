import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { filename, mimeType, size } = await req.json();

  if (!filename || !mimeType || !size) {
    return new NextResponse("Missing file metadata", { status: 400 });
  }

  const tokenRecord = await prisma.setting.findUnique({
    where: { key: "google_refresh_token" }
  });

  if (!tokenRecord) {
    return new NextResponse("Google Drive not connected", { status: 403 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/drive/callback"
  );
  
  oauth2Client.setCredentials({
    refresh_token: tokenRecord.value
  });

  try {
    const { token } = await oauth2Client.getAccessToken();
    
    if (!token) throw new Error("Could not get access token");

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType,
          "X-Upload-Content-Length": size.toString(),
          "Origin": (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, ""),
        },
        body: JSON.stringify({
          name: filename,
          parents: ["12mfuBIxr16XeLAxlVocMOD69R9zZHL94"],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.statusText}`);
    }

    const uploadUrl = response.headers.get("location");

    if (!uploadUrl) {
      throw new Error("No location header returned from Google Drive");
    }

    return NextResponse.json({ uploadUrl });
  } catch (error: any) {
    console.error("Error creating resumable upload", error);
    return new NextResponse(error?.message || "Internal error", { status: 500 });
  }
}
