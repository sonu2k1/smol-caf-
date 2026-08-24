"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchJukeboxQueueAction,
  submitSongRequestAction,
  castSongVoteAction,
  type CustomerJukeboxData,
} from "@/app/music/actions";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";

interface JukeboxClientViewProps {
  initialData: CustomerJukeboxData;
}

export const JukeboxClientView: React.FC<JukeboxClientViewProps> = ({ initialData }) => {
  const [data, setData] = useState<CustomerJukeboxData>(initialData);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [artist, setArtist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [votingId, setVotingId] = useState<string | null>(null);

  // 3-second live polling for queue and playing track
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await fetchJukeboxQueueAction();
        if (fresh.success) {
          setData(fresh);
        }
      } catch (err) {
        console.error("Failed to poll jukebox:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleVote = async (requestId: string) => {
    setVotingId(requestId);
    try {
      const res = await castSongVoteAction(requestId);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          queue: prev.queue
            .map((t) =>
              t.id === requestId
                ? { ...t, vote_count: res.voteCount || t.vote_count + 1, hasVoted: true }
                : t
            )
            .sort((a, b) => b.vote_count - a.vote_count),
        }));
      } else {
        setFeedback({ type: "error", text: res.message || "Could not vote." });
      }
    } catch {
      setFeedback({ type: "error", text: "Voting failed." });
    } finally {
      setVotingId(null);
    }
  };

  const handleRequestSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!trackName.trim() || !artist.trim()) {
      setFeedback({ type: "error", text: "Please enter song title and artist." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSongRequestAction(trackName.trim(), artist.trim());
      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Song requested!" });
        setTrackName("");
        setArtist("");
        setIsRequestModalOpen(false);
        // Refresh queue immediately
        const fresh = await fetchJukeboxQueueAction();
        if (fresh.success) setData(fresh);
      } else {
        setFeedback({ type: "error", text: res.message || "Could not request song." });
      }
    } catch {
      setFeedback({ type: "error", text: "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1C1917] pb-28 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E8DFD3]/80 bg-[#F5EFEB]/90 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#1C1917] transition hover:bg-black/5 active:scale-95"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <h1 className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
            Café Jukebox 🎵
          </h1>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            disabled={!data.isJukeboxOpen}
            className="rounded-full bg-[#A62B34] px-3.5 py-1 font-serif text-xs font-bold text-white shadow-xs hover:bg-[#91242C] active:scale-95 disabled:opacity-50"
          >
            + Request
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {feedback && (
          <div
            className={`rounded-2xl p-3 text-xs font-serif ${
              feedback.type === "error"
                ? "bg-rose-100 text-rose-900 border border-rose-200"
                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Currently Playing Vinyl Card */}
        <section className="relative overflow-hidden rounded-3xl border-2 border-[#2A211B] bg-[#18191B] p-5 text-[#FAF5EE] shadow-xl animate-scale-in">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 mb-3">
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              NOW PLAYING
            </span>
            <span>Rishikesh Soundsystem</span>
          </div>

          {data.playingTrack ? (
            <div className="flex items-center gap-4">
              {/* Spinning Vinyl Record Visual */}
              <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-stone-900 border-4 border-stone-800 shadow-inner animate-spin-vinyl">
                <div className="h-6 w-6 rounded-full bg-[#A62B34] flex items-center justify-center text-[9px] text-white">
                  ☕
                </div>
              </div>

              <div className="overflow-hidden space-y-0.5">
                <h2 className="font-serif text-base font-bold text-white truncate">
                  {data.playingTrack.track_name}
                </h2>
                <p className="font-serif italic text-xs text-stone-300 truncate">
                  {data.playingTrack.artist}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="rounded-md bg-stone-800 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    🔥 {data.playingTrack.vote_count} Upvotes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-1 text-stone-400 font-serif">
              <span className="text-2xl">📻</span>
              <p className="text-xs font-bold text-stone-200">Barista Chill Lo-Fi Mix Playing</p>
              <p className="italic text-[11px] text-stone-400">Request a track below to start table voting!</p>
            </div>
          )}
        </section>

        {/* Up Next & Voting Queue */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              Up Next Queue ({data.queue.length})
            </h3>
            <span className="font-mono text-[10px] text-[#786F66]">
              Live 3s polling
            </span>
          </div>

          {data.queue.length === 0 ? (
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF5ED] p-6 text-center shadow-xs animate-fade-in-up">
              <span className="text-3xl">🎶</span>
              <h4 className="font-serif text-sm font-bold text-[#1C1917] mt-2">
                No songs in the queue yet
              </h4>
              <p className="font-serif italic text-xs text-[#786F66] mt-0.5">
                Be the first to request your favorite vibe!
              </p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-3 rounded-full bg-[#A62B34] px-5 py-2 font-serif text-xs font-bold text-white shadow-xs hover:bg-[#91242C] hover-lift"
              >
                + Request a Track
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FAF5ED] p-2 divide-y divide-[#EADFCF] shadow-xs">
              {data.queue.map((track, idx) => (
                <div
                  key={track.id}
                  className="py-2.5 px-2 flex items-center justify-between gap-3 first:pt-1 last:pb-1 animate-fade-in-up hover-lift"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-xs font-bold text-[#8C7E72] w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <h4 className="font-serif text-xs font-bold text-[#1C1917] truncate">
                        {track.track_name}
                      </h4>
                      <p className="font-serif italic text-[11px] text-[#786F66] truncate">
                        {track.artist}
                        {track.isMyRequest && (
                          <span className="ml-1.5 font-mono text-[10px] text-[#A62B34] font-bold">
                            (Your Table)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleVote(track.id)}
                    disabled={track.hasVoted || votingId === track.id}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 font-mono text-xs font-bold transition-all active:scale-90 ${
                      track.hasVoted
                        ? "bg-amber-200 text-amber-900 animate-pop"
                        : "border border-[#D8CEBF] bg-[#FCF8F2] text-[#1C1917] hover:bg-[#EFE7DC]"
                    }`}
                  >
                    <span>{track.hasVoted ? "✓" : "▲"}</span>
                    <span>{track.vote_count}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Song Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsRequestModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">
                Request Song to DJ
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-[#786F66] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSong} className="space-y-3">
              <div>
                <label className="block font-serif text-xs font-bold text-[#1C1917] mb-1">
                  Track Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasoor"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#D8CEBF] bg-[#FCF8F2] px-3 py-2 text-xs text-[#1C1917] focus:outline-hidden focus:ring-1 focus:ring-[#A62B34]"
                />
              </div>

              <div>
                <label className="block font-serif text-xs font-bold text-[#1C1917] mb-1">
                  Artist / Band
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prateek Kuhad"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#D8CEBF] bg-[#FCF8F2] px-3 py-2 text-xs text-[#1C1917] focus:outline-hidden focus:ring-1 focus:ring-[#A62B34]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 rounded-full border border-[#D8CEBF] bg-[#FAF5ED] py-2 text-xs font-serif font-bold text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !trackName.trim()}
                  className="flex-1 rounded-full bg-[#A62B34] py-2 text-xs font-serif font-bold text-white shadow-xs hover:bg-[#91242C] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation */}
      <BottomNavBar />
    </div>
  );
};

