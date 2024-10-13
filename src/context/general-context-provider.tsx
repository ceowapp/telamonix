'use client';
import React, { createContext, useContext, useState } from 'react';

interface Product {
  title: string;
  description: string;
}

interface GeneralContextType {
  openAISEO: boolean;
  setOpenAISEO: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export const GeneralContextProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
  const [openAISEO, setOpenAISEO] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  return (
    <GeneralContext.Provider value={{ 
      openAISEO, 
      setOpenAISEO,
      selectedProduct,
      setSelectedProduct
    }}>
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneralContext = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error('useGeneralContext must be used within a ContextProvider');
  }
  return context;
};