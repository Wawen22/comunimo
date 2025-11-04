'use client';

import { type ReactNode, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
  queries: {
    // Keep data fresh for 5 minutes by default
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  },
  mutations: {
    retry: 1,
  },
};

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
