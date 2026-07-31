import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PlayerClient from "./player-client";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) {
    redirect("/");
  }

  // Increment views in background — fire and forget, don't block render
  void prisma.video.update({
    where: { id: video.id },
    data: { views: { increment: 1 } },
  });

  return <PlayerClient video={video} />;
}
