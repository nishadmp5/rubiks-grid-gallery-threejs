import { useEffect, useState } from "react";

export const useMinWidthLayout = (minWidth: number) => {
  const [isAboveMinWidth, setIsAboveMinWidth] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    setIsAboveMinWidth(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsAboveMinWidth(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [minWidth]);

  return { isAboveMinWidth };
};
