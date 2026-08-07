import { useEffect } from 'react';

/** Custom hook to set document.title per page route */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | Lattice Atlas`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
