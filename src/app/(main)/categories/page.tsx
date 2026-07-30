import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Compass, Plus } from "lucide-react";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { videos: true } } },
    orderBy: { name: "asc" },
  });

  const isAdmin = session.user?.role === "ADMIN";

  const defaultColors = [
    "from-accent/30 to-accent/5",
    "from-secondary/30 to-secondary/5",
    "from-success/30 to-success/5",
    "from-yellow-500/30 to-yellow-500/5",
    "from-cyan-500/30 to-cyan-500/5",
    "from-pink-500/30 to-pink-500/5",
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Categories</h1>
      </header>

      {categories.length === 0 ? (
        <div className="glass p-8 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center">
          <Compass size={48} className="text-white/20 mb-4" />
          <p className="text-white/50 text-lg mb-2">No categories yet</p>
          <p className="text-white/30 text-sm">Categories will appear here once the admin creates them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="glass rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/5 hover:border-white/15 block"
            >
              <div className={`h-32 md:h-40 bg-gradient-to-br ${defaultColors[i % defaultColors.length]} flex items-center justify-center`}>
                <span className="text-4xl md:text-5xl">{cat.icon || "📁"}</span>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="font-semibold text-white text-lg group-hover:text-accent transition-colors">{cat.name}</h3>
                <p className="text-sm text-white/50 mt-1">{cat._count.videos} video{cat._count.videos !== 1 ? "s" : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
