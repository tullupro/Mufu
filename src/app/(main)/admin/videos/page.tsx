import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideosClient } from "./videos-client";

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/");

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  // Serialize dates for client component
  const serialized = videos.map((v) => ({
    id: v.id,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    views: v.views,
    createdAt: v.createdAt.toISOString(),
    category: v.category ? { name: v.category.name } : null,
  }));

  return <VideosClient videos={serialized} />;
}
