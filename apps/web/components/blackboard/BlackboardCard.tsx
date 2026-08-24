import React from "react";
import type { BlackboardPost } from "@smol-cafe/db";

interface BlackboardCardProps {
  post: BlackboardPost | null;
}

export const BlackboardCard: React.FC<BlackboardCardProps> = ({ post }) => {
  const displayBody = post?.body || "Jaggery Sea-Salt Latte\nis our new crush. ♡";


  return (
    <section className="relative overflow-hidden rounded-3xl border-4 border-[#2A211B] bg-[#18191B] p-5 text-[#FAF5EE] shadow-xl shadow-stone-900/10">
      {/* Blackboard Title */}
      <div className="text-center sm:text-left">
        <h3 className="font-serif text-lg font-medium text-[#FAF5EE] tracking-tight">
          Today&apos;s Blackboard
        </h3>
      </div>

      {/* Dashed Separator */}
      <div className="my-3 border-t border-dashed border-stone-600/60" />

      {/* Chalk Handwriting Message */}
      <div className="py-2 text-center">
        <p className="font-chalk text-2xl sm:text-3xl text-white/95 leading-snug tracking-wide whitespace-pre-line drop-shadow-[0_1px_2px_rgba(255,255,255,0.15)]">
          {displayBody}
        </p>
      </div>
    </section>
  );
};

