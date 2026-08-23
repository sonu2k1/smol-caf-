"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchJukeboxQueueAction,
  submitSongRequestAction,
  castSongVoteAction,
  type CustomerJukeboxData,
} from "@/app/music/actions";

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
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Top Bar */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="rounded-full border border-stone-200 bg-stone-50 p-2 text-stone-600 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
            >
              ← Menu
            </Link>
            <div>
              <span className="text-base font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
                Smol Jukebox 🎵
              </span>
              {data.tableLabel && (
                <p className="text-[10px] text-stone-500 font-mono">{data.tableLabel}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            disabled={!data.isJukeboxOpen}
            className="rounded-full bg-[#9B2C2C] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-[#822424] active:scale-95 disabled:opacity-50 dark:bg-[#C53030]"
          >
            + Request Song
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6 space-y-6">
        {feedback && (
          <div
            className={`rounded-2xl p-3 text-xs font-bold ${
              feedback.type === "error"
                ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                : "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Currently Playing Vinyl Card */}
        <section className="relative overflow-hidden rounded-3xl border-2 border-stone-800 bg-[#1C1917] p-6 text-[#FDFBF7] shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-4">
            <span className="flex items-center gap-1.5 text-[#F6AD55]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Now Playing
            </span>
            <span className="font-mono text-stone-500">Café Sound System</span>
          </div>

          {data.playingTrack ? (
            <div className="flex items-center gap-4">
              {/* Spinning Vinyl Record Visual */}
              <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 border-4 border-stone-800 shadow-inner animate-[spin_6s_linear_infinite]">
                <div className="h-7 w-7 rounded-full bg-[#9B2C2C] flex items-center justify-center text-[10px]">
                  ☕
                </div>
              </div>

              <div className="overflow-hidden space-y-1">
                <h2 className="text-base font-black tracking-tight text-white truncate">
                  {data.playingTrack.track_name}
                </h2>
                <p className="text-xs font-medium text-stone-300 truncate">
                  {data.playingTrack.artist}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="rounded-md bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                    🔥 {data.playingTrack.vote_count} Upvotes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-1 text-stone-400">
              <span className="text-2xl">📻</span>
              <p className="text-xs font-medium">Barista Chill Mix Playing</p>
              <p className="text-[10px] text-stone-500">Request a track below to start voting!</p>
            </div>
          )}
        </section>

        {/* Up Next & Voting Queue */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Up Next Queue ({data.queue.length})
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">
              Live Polling (3s) • 1 vote / table
            </span>
          </div>

          {data.queue.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 p-8 text-center dark:border-stone-800 dark:bg-stone-900/50">
              <span className="text-3xl">🎶</span>
              <h4 className="mt-2 text-sm font-bold text-stone-800 dark:text-stone-200">
                Queue is Empty
              </h4>
              <p className="mt-1 text-xs text-stone-500">
                Be the first to request your favorite vibe!
              </p>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="mt-3 rounded-2xl bg-[#9B2C2C] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#822424] dark:bg-[#C53030]"
              >
                + Request a Track
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900 divide-y divide-stone-100 dark:divide-stone-800">
              {data.queue.map((track, idx) => (
                <div
                  key={track.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-xs font-black text-stone-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {track.track_name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        {track.artist}
                        {track.isMyRequest && (
                          <span className="ml-1.5 text-[10px] font-mono text-[#9B2C2C] dark:text-[#F6AD55]">
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
                    className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition font-mono ${
                      track.hasVoted
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
                        : "border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎶</span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Request Song
                </h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Your song will be reviewed by the café DJ and queued for everyone to upvote. Max 3
              requests per 15 mins.
            </p>

            <form onSubmit={handleRequestSong} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Track Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasoor"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-[#9B2C2C] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Artist / Band
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prateek Kuhad"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-[#9B2C2C] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !trackName.trim()}
                  className="flex-1 rounded-2xl bg-[#9B2C2C] py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#822424] active:scale-95 disabled:opacity-50 dark:bg-[#C53030]"
                >
                  {isSubmitting ? "Submitting..." : "Submit to DJ"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="rounded-2xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
