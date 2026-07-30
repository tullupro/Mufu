import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Update watch progress
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { videoId, timestamp, completed } = await req.json();

  if (!videoId || timestamp === undefined) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const entry = await prisma.watchHistory.upsert({
    where: {
      userId_videoId: {
        userId: session.user.id,
        videoId,
      },
    },
    update: {
      timestamp: timestamp,
      completed: completed ?? false,
      lastWatched: new Date(),
    },
    create: {
      userId: session.user.id,
      videoId,
      timestamp,
      completed: completed ?? false,
    },
  });

  return NextResponse.json({ success: true, entry });
}
