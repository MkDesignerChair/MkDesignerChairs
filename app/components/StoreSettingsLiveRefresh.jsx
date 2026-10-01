"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SETTINGS_UPDATE_EVENT = "mk-designer-chairs-settings-updated";

export function publishStoreSettingsUpdate() {
  window.localStorage.setItem(SETTINGS_UPDATE_EVENT, String(Date.now()));
}

export default function StoreSettingsLiveRefresh({ revision }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let currentRevision = revision;

    async function refreshIfChanged() {
      try {
        const response = await fetch("/api/store/settings", { cache: "no-store" });
        const result = response.ok ? await response.json() : null;
        if (active && result?.revision && result.revision !== currentRevision) {
          currentRevision = result.revision;
          router.refresh();
        }
      } catch {
        // A later polling interval will retry the update check.
      }
    }

    function refreshFromAnotherTab(event) {
      if (event.key === SETTINGS_UPDATE_EVENT) refreshIfChanged();
    }

    const interval = window.setInterval(refreshIfChanged, 10000);
    window.addEventListener("storage", refreshFromAnotherTab);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("storage", refreshFromAnotherTab);
    };
  }, [revision, router]);

  return null;
}
