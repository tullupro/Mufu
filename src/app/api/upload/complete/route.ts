import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { fileId, title, description, duration } = await req.json();

  if (!fileId || !title) {
    return new NextResponse("Missing file metadata", { status: 400 });
  }

  try {
    const video = await prisma.video.create({
      data: {
        title,
        description,
        driveFileId: fileId,
        duration: duration || 0,
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    console.error("Error saving video", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
