import React from "react";
import { Card, Button } from "@nextui-org/react";
import { useGeneralContext } from "@/context/general-context-provider";

const ActionButtons = () => {
  const { selectedProduct } = useGeneralContext();

  const handlePublishToShopify = async () => {
    try {
      const response = await fetch('/api/publish/shopify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProduct)
      });
      if (!response.ok) {
        throw new Error('Failed to publish to Shopify');
      }
      console.log('Published to Shopify successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancelPublishShopify = async () => {
    try {
      const response = await fetch('/api/publish/shopify', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedProduct)
      });
      if (!response.ok) {
        throw new Error('Failed to cancel publish to Shopify');
      }
      console.log('Canceled publish to Shopify successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card className="p-4 shadow-md flex flex-row justify-between">
      <Button
        color="primary"
        onClick={handlePublishToShopify}
        className="max-w-24"
      >
        Publish to Shopify
      </Button>
      <Button
        color="error"
        onClick={handleCancelPublishShopify}
        className="max-w-24"
      >
        Cancel Publish
      </Button>
    </Card>
  );
};

export default ActionButtons;