import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A hashed link (e.g. /papers#2408.13687, /glossary#code-distance) means the
    // navigation is targeting an anchor — scroll that element into view rather
    // than forcing the viewport to the top and clobbering the deep link.
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
