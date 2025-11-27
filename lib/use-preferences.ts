"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, type Preferences } from "@/config";

const PREF_KEY = "udyami-preferences";

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(PREF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPrefs({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const updatePrefs = (patch: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  return { prefs, updatePrefs };
}
