import { useEffect, useState } from "react";
import { QuoteDTO } from "../../modules/quote/types/common";

export const useQuotes = (
  query?: Record<string, any>
): {
  data: { quotes: QuoteDTO[] } | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const filterQuery = new URLSearchParams(query).toString();

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(
          "/customers/quotes" + (filterQuery ? `?${filterQuery}` : "")
        );
        const result = await response.json();

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};

export const useCompany = (
  companyId: string,
  query?: Record<string, any>
): {
  data: { company: QuoteDTO } | null;
  refetch: () => void;
  loading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const filterQuery = new URLSearchParams(query).toString();
  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch(
          `/customers/quotes/${companyId}` +
            (filterQuery ? `?${filterQuery}` : "")
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [refetchTrigger]);

  return { data, refetch, loading, error };
};
