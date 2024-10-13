import React, { useCallback } from "react";
import { useCompletion } from "ai/react";
import { toast } from "sonner";

interface UseShopifyAIProps {
  option?: string;
  prompt?: string;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  setResData?: React.Dispatch<React.SetStateAction<any[]>>;
  setError?: React.Dispatch<React.SetStateAction<string>>;
}

export const useShopifyAI = ({
  option,
  prompt,
  setIsLoading,
  setError,
  setResData,
}: UseShopifyAIProps = {}) => {
  const { complete, stop } = useCompletion({
    api: '/api/ai/openai',
    onResponse: async (response) => {
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Error parsing JSON:", e);
          errorData = { error: "An unexpected error occurred", status: response.status };
        }
        setError && setError(errorData.error);
        switch (response.status) {
          case 429:
            toast.error("Rate limit exceeded. Please try again later.");
            break;
          case 403:
            toast.error("Access forbidden. Please check your credentials.");
            break;
          default:
            toast.error(errorData.error);
        }
        return null;
      }
      return response;
    },
    onError: (e) => {
      setError && setError(e.message);
      toast.error(e.message);
    },
    onFinish: (prompt, completion) => {
      try {
        const parsedData = JSON.parse(completion);
        if (Array.isArray(parsedData)) {
          setResData && setResData(parsedData);
        } else {
          setResData && setResData([parsedData]);
        }
      } catch (e) {
        console.error("Error parsing completion:", e);
        setError && setError("Failed to parse AI response");
        toast.error("Failed to parse AI response");
      }
    },
  });

  const handleShopifyAI = useCallback(async () => {
    setIsLoading && setIsLoading(true);
    setError && setError("");

    try {
      const requestOption = {
        command: option,
        model: 'gpt-3.5-turbo',
        config: {
          RPM: 5000,
          RPD: 5000,
          max_tokens: 4096,
        }
      };

      await complete(prompt || "", { body: requestOption });
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.error("Error in POST request:", err);
      setError && setError(err);
      toast.error(err);
    } finally {
      setIsLoading && setIsLoading(false);
    }
  }, [prompt, option, setIsLoading, setError, complete]);

  return { handleShopifyAI, stop };
};