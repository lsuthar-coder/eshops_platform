import { useEffect } from "react";

/**
 * Applies the tenant's chosen colors on top of the base liquid-glass
 * token set, and swaps the favicon — this is what makes each store
 * feel visually distinct while keeping the same structural design
 * system (glass panels, aurora background, type pairing).
 */
export function useApplyTheme(config) {
  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    const { primaryColor, secondaryColor, tertiaryColor } = config.theme || {};

    if (primaryColor) root.style.setProperty("--color-aurora-violet", primaryColor);
    if (secondaryColor) root.style.setProperty("--color-aurora-cyan", secondaryColor);
    if (tertiaryColor) root.style.setProperty("--color-aurora-amber", tertiaryColor);

    if (config.favicon) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = config.favicon;
    }

    if (config.storeName) {
      document.title = config.storeName;
    }
  }, [config]);
}
