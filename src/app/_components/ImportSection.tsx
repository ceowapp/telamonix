import React, { useState, useCallback, useEffect } from "react";
import { Card, Input, Button, Tabs, Tab, Textarea } from "@nextui-org/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useShopifyAI } from "@/hooks/use-shopify-ai";
import { useGeneralContext } from "@/context/general-context-provider";
import ActionButtons from "./ActionButtons";

const ImportSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [productData, setProductData] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const { openAISEO, setOpenAISEO, setSelectedProduct } = useGeneralContext();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
    },
  });

  const [fileSelected, setFileSelected] = useState(false);
  const [url, setUrl] = useState("");

  const customToken = session?.customToken;
  const googleAccessToken = session?.accessToken;

  const { handleShopifyAI } = useShopifyAI({
    setIsLoading,
    setError,
    setResData: setProductData,
    option: "rewrite",
    prompt: content,
  });

  const loadPicker = useCallback(() => {
    if (typeof window !== 'undefined' && googleAccessToken) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('picker', () => {
          const picker = new window.google.picker.PickerBuilder()
            .addView(window.google.picker.ViewId.DOCUMENTS)
            .setOAuthToken(googleAccessToken)
            .setCallback((data) => pickerCallback(data, googleAccessToken))
            .build();
          picker.setVisible(true);
        });
      };
      document.body.appendChild(script);
    }
  }, [googleAccessToken, customToken]);

  const pickerCallback = useCallback((data, accessToken) => {
    if (data.action === google.picker.Action.PICKED) {
      const fileId = data.docs[0].id;
      setFileSelected(true);
      fetchGoogleDocContent(fileId, accessToken);
    }
  }, []);

  const fetchGoogleDocContent = async (fileId, accessToken) => {
    try {
      const response = await fetch('/api/input/read_googledoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, accessToken }),
      });
      const data = await response.text();
      setContent(data);
      convertContent(data);
    } catch (error) {
      console.error('Error fetching Google Doc content:', error);
      setError('Error fetching Google Doc content');
    }
  };

  const handleUrlSubmit = async () => {
    try {
      const isGoogleDoc = /https?:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/.test(url);
      let response;
      if (isGoogleDoc) {
        const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
        response = await fetch('/api/input/read_googledoc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId, accessToken: googleAccessToken }),
        });
      } else {
        response = await fetch('/api/input/crawl_content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
      }
      const data = await response.text();
      setContent(data);
      convertContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Error fetching content');
    }
  };

  const convertContent = async (contentToConvert) => {
    try {
      setIsLoading(true);
      await handleShopifyAI(contentToConvert);
    } catch (error) {
      console.error('Error converting content:', error);
      setError('Error converting content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleAISEO = (product) => {
    setOpenAISEO(true);
    setSelectedProduct(product);
  };

  useEffect(() => {
    if (content) {
      convertContent(content);
    }
  }, [content]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-4 mb-6">
        <Tabs aria-label="Import options">
          <Tab key="import" title="Import file">
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Select Google Doc file"
                startContent={<ArrowUpTrayIcon className="w-4 h-4 text-gray-400" />}
                endContent={
                  <Button color="primary" size="sm" onClick={loadPicker}>
                    Choose File
                  </Button>
                }
                readOnly
                value={fileSelected ? "File selected" : ""}
                className="mb-4"
              />
            </div>
          </Tab>
          <Tab key="direct" title="Direct URL">
            <div className="mt-4">
              <Input
                type="url"
                placeholder="Paste URL here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mb-4"
              />
              <Button 
                color="primary" 
                className="w-full"
                isDisabled={!url}
                onClick={handleUrlSubmit}
              >
                Fetch Content
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Card>

      {isLoading && <p>Converting content...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {productData.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Converted Products</h2>
          {productData.slice(0, displayCount).map((product, index) => (
            <Card 
              key={index} 
              className="p-4 mb-4 cursor-pointer"
              onClick={() => handleProductSelect(product)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <Button 
                  color="primary" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAISEO(product);
                  }}
                >
                  AI SEO
                </Button>
              </div>
              <p className="mb-2">Category: {product.category}</p>
              <p className="mb-2">Price: ${product.price}</p>
              {!openAISEO && <ActionButtons />}
            </Card>
          ))}
          {displayCount < productData.length && (
            <Button onClick={handleLoadMore} color="secondary">
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportSection;
