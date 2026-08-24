import React from "react";
import type { BlackboardPost } from "@smol-cafe/db";

interface BlackboardCardProps {
  post: BlackboardPost | null;
}

export const BlackboardCard: React.FC<BlackboardCardProps> = ({ post }) => {
  const displayBody = post?.body || "Jaggery Sea-Salt Latte\nis our new crush. ♡";


  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#C9AE8B]/40 bg-[#241F1C] p-5 text-[#F3E7D3] shadow-lg shadow-black/10">
      {/* Blackboard Title */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#F2C84B]">
          Today&apos;s Special
        </h3>
        <span className="font-mono text-[10px] text-[#C9AE8B]">DAILY BOARD</span>
      </div>

      {/* Thin Editorial Rule */}
      <div className="my-3 border-t border-[#C9AE8B]/30" />

      {/* Editorial Chalk Message */}
      <div className="py-2 text-center">
        <p className="font-serif italic text-xl sm:text-2xl text-[#F3E7D3] leading-snug tracking-normal whitespace-pre-line">
          {displayBody}
        </p>
      </div>
    </section>
  );
};

