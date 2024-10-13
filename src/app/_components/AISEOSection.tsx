import React, { useState } from "react";
import { Button, Input, Textarea, Card } from "@nextui-org/react";
import { useShopifyAI } from "@/hooks/use-shopify-ai";
import ActionButtons from "./ActionButtons";
import { useGeneralContext } from "@/context/general-context-provider";

const AISEOSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [seoData, setSeoData] = useState(null);
  const { openAISEO, selectedProduct, setSelectedProduct } = useGeneralContext();

  const { handleShopifyAI } = useShopifyAI({
    isLoading,
    setIsLoading,
    error,
    setError,
    option: "seo",
    prompt: JSON.stringify(selectedProduct),
  });

  const handleGetResult = async () => {
    const result = await handleShopifyAI();
    setSeoData(JSON.parse(result));
    setSelectedProduct({ ...selectedProduct, ...JSON.parse(result) });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between gap-6">
        <Card className="flex-1 p-6">
          <h2 className="text-xl font-bold mb-4">Current Product Data</h2>
          <Input label="Title" value={selectedProduct?.title} readOnly className="mb-4" />
          <Textarea label="Description" value={selectedProduct?.description} readOnly className="mb-4" />
        </Card>

        <Card className="flex-1 p-6">
          <h2 className="text-xl font-bold mb-4">AI SEO Suggestions</h2>
          <Button color="primary" onClick={handleGetResult} className="mb-4">
            Get AI SEO Result
          </Button>
          {seoData && (
            <>
              <Input label="Title" value={seoData.title} className="mb-4" />
              <Textarea label="Description" value={seoData.description} className="mb-4" />
              <Input label="Page Title" value={seoData.pageTitle} className="mb-4" />
              <Textarea label="Meta Description" value={seoData.metaDescription} className="mb-4" />
              <Input label="URL Handle" value={seoData.urlHandle} className="mb-4" />
              <Input label="Tags" value={seoData.tags.join(", ")} className="mb-4" />
            </>
          )}
        </Card>
        {openAISEO && <ActionButtons />}
      </div>
    </div>
  );
};

export default AISEOSection;