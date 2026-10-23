"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Cari } from "@/components/ikon";

type HasilSemantik = {
  id: number;
  judul: string;
  slug: string;
  ringkasan: string;
  url: string;
  relevansi: number;
  kategori?: string;
  gambar?: string;
};

const MAX_QUERY = 500;
const DEBOUNCE_MS = 300;

async function cariSemantik(query: string, signal: AbortSignal): Promise<HasilSemantik[]> {
  const response = await fetch("/api/artikel/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  const data = await response.json() as { artikel?: HasilSemantik[]; error?: string };
  if (!response.ok) {
    if (response.status === 503) throw new Error("Pencarian semantik sedang belum tersedia. Silakan coba lagi nanti.");
    throw new Error(data.error || "Pencarian gagal. Silakan coba lagi.");
  }
  return Array.isArray(data.artikel) ? data.artikel : [];
}

async function cariKeyword(query: string, signal: AbortSignal): Promise<HasilSemantik[]> {
  const params = new URLSearchParams({ limit: "5", depth: "1", draft: "false", sort: "-tanggalTerbit" });
  params.set("where[or][0][judul][like]", query);
  params.set("where[or][1][ringkasan][like]", query);
  const response = await fetch(`/api/artikel?${params.toString()}`, { signal });
  if (!response.ok) throw new Error("Pencarian artikel belum tersedia. Silakan coba lagi.");
  const data = await response.json() as {
      docs?: Array<{ id: number; judul: string; slug: string; ringkasan?: string; sampul?: { url?: string | null } | number | null; kategori?: { nama?: string } | number | null }>;
  };
  return (data.docs ?? []).slice(0, 5).map((item) => ({
    id: item.id,
    judul: item.judul,
    slug: item.slug,
    ringkasan: item.ringkasan ?? "",
    gambar: typeof item.sampul === "object" && item.sampul?.url ? item.sampul.url : undefined,
    kategori: typeof item.kategori === "object" ? item.kategori?.nama : undefined,
    url: `/tulisan-pajak/${encodeURIComponent(item.slug)}`,
    relevansi: 0,
  }));
}

async function cariDenganFallback(
  query: string,
  signal: AbortSignal,
  onMode: (mode: "semantic" | "keyword") => void,
): Promise<HasilSemantik[]> {
  try {
    const results = await cariSemantik(query, signal);
    onMode("semantic");
    return results;
  } catch {
    if (signal.aborted) throw new DOMException("Pencarian dibatalkan", "AbortError");
    const results = await cariKeyword(query, signal);
    onMode("keyword");
    return results;
  }
}

export function ArtikelSearchControl({
  initialQuery,
  kategoriAktif,
  onResults,
  onLoading,
  onError,
  onCategoryNote,
  onSearchSubmitted,
  onSearchMode,
}: {
  initialQuery: string;
  kategoriAktif?: string;
  onResults: (results: HasilSemantik[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onCategoryNote: (visible: boolean) => void;
  onSearchSubmitted: (submitted: boolean) => void;
  onSearchMode: (mode: "semantic" | "keyword") => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<HasilSemantik[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [refreshKey, setRefreshKey] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const liveControllerRef = useRef<AbortController | null>(null);
  const explicitControllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const listboxId = "artikel-live-search-listbox";

  useEffect(() => {
    const trimmed = query.trim();
    const generation = ++generationRef.current;
    liveControllerRef.current?.abort();
    if (!trimmed) {
      setSuggestions([]);
      setLiveError(null);
      setLiveLoading(false);
      setDropdownOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (document.activeElement !== searchRef.current?.querySelector("input")) return;

    const controller = new AbortController();
    liveControllerRef.current = controller;
    setLiveLoading(true);
    const timer = window.setTimeout(async () => {
      setLiveError(null);
      try {
        const results = await cariDenganFallback(trimmed, controller.signal, onSearchMode);
        if (generation !== generationRef.current) return;
        setSuggestions(results.slice(0, 5));
        setDropdownOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (controller.signal.aborted || generation !== generationRef.current) return;
        setSuggestions([]);
        setDropdownOpen(true);
        setLiveError(error instanceof Error ? error.message : "Pencarian gagal. Silakan coba lagi.");
      } finally {
        if (generation === generationRef.current) setLiveLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, refreshKey]);

  useEffect(() => {
    setQuery(initialQuery);
    onResults([]);
    onError(null);
    onSearchSubmitted(false);
    onSearchMode("semantic");
  }, [initialQuery]);

  useEffect(() => () => {
    liveControllerRef.current?.abort();
    explicitControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function openResult(item: HasilSemantik) {
    /* Hasil pencarian selalu berupa path internal. Pakai router agar
       transisi tetap client-side dan tidak memuat ulang seluruh halaman. */
    router.push(item.url);
  }

  async function runExplicitSearch() {
    const normalized = query.trim();
    if (!normalized) return;
    generationRef.current += 1;
    liveControllerRef.current?.abort();
    explicitControllerRef.current?.abort();
    const controller = new AbortController();
    explicitControllerRef.current = controller;
    setDropdownOpen(false);
    onLoading(true);
    onError(null);
    onResults([]);
    onSearchSubmitted(true);
    onCategoryNote(Boolean(kategoriAktif));
    try {
      onResults(await cariDenganFallback(normalized, controller.signal, onSearchMode));
    } catch (error) {
      if (!controller.signal.aborted) onError(error instanceof Error ? error.message : "Pencarian gagal. Silakan coba lagi.");
    } finally {
      if (!controller.signal.aborted) onLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runExplicitSearch();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setDropdownOpen(false);
      setActiveIndex(-1);
      event.preventDefault();
    } else if (event.key === "ArrowDown" && dropdownOpen && suggestions.length) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && dropdownOpen && suggestions.length) {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1);
    } else if (event.key === "Enter" && activeIndex >= 0 && dropdownOpen && suggestions[activeIndex]) {
      event.preventDefault();
      openResult(suggestions[activeIndex]);
    }
  }

  function clear() {
    generationRef.current += 1;
    liveControllerRef.current?.abort();
    explicitControllerRef.current?.abort();
    setQuery("");
    setSuggestions([]);
    setDropdownOpen(false);
    setActiveIndex(-1);
    onResults([]);
    onError(null);
    onSearchSubmitted(false);
    onLoading(false);
    onCategoryNote(false);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex flex-wrap items-center gap-3">
      <div ref={searchRef} className="relative z-30 min-w-0 flex-1">
        <Cari aria-hidden="true" className="pointer-events-none absolute top-1/2 left-[18px] h-4 w-4 -translate-y-1/2 text-teks-redup" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const value = event.target.value.slice(0, MAX_QUERY);
            setQuery(value);
            explicitControllerRef.current?.abort();
            onLoading(false);
            onResults([]);
            onError(null);
            onSearchSubmitted(false);
          }}
          onFocus={() => {
            if (!query.trim()) return;
            setDropdownOpen(true);
            // Fokus ulang dengan kata kunci yang sama tidak mengubah `query`,
            // jadi efek live-search tidak berjalan. Minta efek baru hanya
            // bila belum ada hasil/error, agar spinner tidak menggantung.
            if (!suggestions.length || liveError) {
              setRefreshKey((key) => key + 1);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Cari artikel perpajakan, akuntansi, atau keuangan bisnis..."
          maxLength={MAX_QUERY}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={dropdownOpen}
          aria-controls={listboxId}
          aria-describedby="artikel-search-help"
          aria-activedescendant={activeIndex >= 0 ? `artikel-search-option-${activeIndex}` : undefined}
          className="artikel-search-input h-[52px] w-full rounded-full border-[1.5px] border-garis bg-white pr-12 pl-11 text-[0.95rem] text-navy-900 outline-none transition-colors duration-150 placeholder:text-teks-redup focus:border-garis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900/40"
        />
        {query && <button type="button" onClick={clear} aria-label="Hapus pencarian" className="absolute top-1/2 right-4 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-lg leading-none text-teks-redup transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy-900/50">×</button>}
        <span id="artikel-search-help" className="sr-only">Ketik untuk rekomendasi; gunakan panah atas/bawah lalu Enter untuk membuka hasil, atau Enter tanpa pilihan untuk mencari.</span>
        {dropdownOpen && query.trim() && (
          <div className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 max-h-[min(70vh,420px)] overflow-y-auto rounded-[14px] border border-garis bg-white py-1 shadow-[0_8px_24px_rgba(13,31,60,0.12)]">
            {liveLoading ? <p className="pointer-events-none px-4 py-3 text-sm text-teks-sekunder" role="status">Mencari artikel…</p> : liveError ? <p className="pointer-events-none px-4 py-3 text-sm text-teks-sekunder" role="status">{liveError}</p> : suggestions.length ? (
              <ul id={listboxId} role="listbox" aria-label="Artikel terkait">
                {suggestions.map((item, index) => <li key={item.id} className={index ? "border-t border-garis/70" : ""}>
                  <button id={`artikel-search-option-${index}`} role="option" aria-selected={activeIndex === index} type="button" onMouseEnter={() => setActiveIndex(index)} onClick={() => openResult(item)} className={`block w-full px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-navy-900/40 ${activeIndex === index ? "bg-netral-lat" : "bg-white hover:bg-netral-lat/70"}`}>
                    <span className="block line-clamp-1 text-sm font-bold text-navy-900">{item.judul}</span>
                    {item.kategori && <span className="mt-0.5 block text-xs font-semibold text-teks-redup">{item.kategori}</span>}
                    {item.ringkasan && <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-teks-sekunder">{item.ringkasan}</span>}
                  </button>
                </li>)}
              </ul>
            ) : <p className="pointer-events-none px-4 py-3 text-sm text-teks-sekunder" role="status">Tidak ada artikel yang cocok. Coba kata kunci lain.</p>}
          </div>
        )}
      </div>
      <button type="submit" disabled={!query.trim()} className="h-[52px] shrink-0 cursor-pointer rounded-full bg-yellow-500 px-5 text-[0.95rem] font-bold text-navy-900 shadow-kuning transition-[var(--transition-base)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-65 sm:px-7">Cari Artikel</button>
    </form>
  );
}
