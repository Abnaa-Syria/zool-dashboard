import * as React from 'react';

/** Page state that snaps back to 1 whenever `filterKey` changes (render-time adjustment, no effect). */
export function usePageReset(filterKey: string): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [page, setPage] = React.useState(1);
  const [prev, setPrev] = React.useState(filterKey);
  if (prev !== filterKey) {
    setPrev(filterKey);
    setPage(1);
  }
  return [page, setPage];
}
