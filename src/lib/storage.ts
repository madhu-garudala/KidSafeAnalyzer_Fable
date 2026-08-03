"use client";

import { useSyncExternalStore, useCallback } from "react";

/** localStorage-backed string-array store (favorites, shopping list, compare picks). */

const listeners = new Set<() => void>();
const cache = new Map<string, string[]>();

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  const cached = cache.get(key);
  if (cached) return cached;
  let value: string[] = [];
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) value = parsed.filter((x) => typeof x === "string");
    }
  } catch {
    // corrupted entry — treat as empty
  }
  cache.set(key, value);
  return value;
}

function write(key: string, value: string[]) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — in-memory cache still works this session
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: string[] = [];

export function useIdList(key: string) {
  const ids = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );

  const toggle = useCallback(
    (id: string) => {
      const current = read(key);
      write(key, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => write(key, read(key).filter((x) => x !== id)),
    [key],
  );

  const clear = useCallback(() => write(key, []), [key]);

  return { ids, toggle, remove, clear };
}

export const FAVORITES_KEY = "kidsafe.favorites";
export const SHOPPING_KEY = "kidsafe.shopping";
export const COMPARE_KEY = "kidsafe.compare";
