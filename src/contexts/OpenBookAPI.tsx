import { useQuery } from "@tanstack/react-query";

export interface OpenBookAPIBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: string;
  first_publish_year?: number;
  publisher?: string[];
}

interface SearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenBookAPIBook[];
}

export const useOpenBookAPI = (query: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["books", query],
    queryFn: async () => {
      if (!query)
        return {
          numFound: 0,
          start: 0,
          numFoundExact: false,
          docs: [],
        } as SearchResponse;

      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json() as Promise<SearchResponse>;
    },
    enabled: !!query, // Only run the query if there's a search term
  });
  return { data, isLoading, isError, error };
};
