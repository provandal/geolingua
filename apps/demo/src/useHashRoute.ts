import { useState, useCallback, useEffect } from 'react';

type Page = 'landing' | 'guide';

function getPage(): Page {
  return window.location.hash === '#/guide' ? 'guide' : 'landing';
}

export function useHashRoute() {
  const [page, setPage] = useState<Page>(getPage);

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  return { page, navigate };
}
