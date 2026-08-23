import React from "react";
import type { BlackboardPost } from "@smol-cafe/db";

interface BlackboardCardProps {
  post: BlackboardPost | null;
}

export const BlackboardCard: React.FC<BlackboardCardProps> = ({ post }) => {
  // Graceful fallback: render nothing if no active post
  if (!post || !post.active) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-stone-800 bg-[#1C1917] p-5 text-[#FDFBF7] shadow-xl dark:border-stone-700">
      {/* Chalkboard Texture Vignette & Frame */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-xs text-amber-300">
            📌
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#F6AD55]">
            Daily Blackboard
          </span>
        </div>

        <span className="rounded-full border border-stone-700 bg-stone-800/80 px-2.5 py-0.5 text-[10px] font-mono text-stone-400">
          Café Chit
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <h2 className="text-lg font-black tracking-tight text-white">{post.title}</h2>
        <p className="text-xs leading-relaxed text-stone-300 whitespace-pre-line font-medium">
          {post.body}
        </p>
      </div>

      {post.image_url && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt={post.title} className="h-36 w-full object-cover" />
        </div>
      )}
    </section>
  );
};
