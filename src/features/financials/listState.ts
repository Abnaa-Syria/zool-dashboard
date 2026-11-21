import * as React from 'react';

export const selectClass = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm';

/** Reset `page` to 1 whenever `key` changes (render-time adjustment, no effect). */
export function usePageReset(key: string): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [page, setPage] = React.useState(1);
  const [prevKey, setPrevKey] = React.useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setPage(1);
  }
  return [page, setPage];
}
