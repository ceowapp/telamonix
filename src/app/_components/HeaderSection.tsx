import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Card, Button, User } from "@nextui-org/react";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Play } from 'lucide-react';

const VideoLoader = lazy(() => import('@/components/VideoLoader'));

const EmbeddedVideo = ({ source, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Suspense fallback={<VideoLoader />}>
      <div className="relative w-full max-w-[800px] aspect-video rounded-lg overflow-hidden shadow-xl">
        {!isPlaying && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-blue-600" />
            </motion.button>
          </div>
        )}
        {(isPlaying) && (
          <iframe
            title={title}
            src={`${source}${isPlaying ? '&autoplay=1' : ''}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </Suspense>
  );
};


const HeaderSection = () => {
  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Hi! This is Doc2Product - AI Powered</h1>
      
      <div className="flex gap-4 mb-6">
        <Card className="bg-blue-600 text-white p-4 flex-1">
          <h2 className="text-xl font-semibold mb-2">How to use Doc2Product?</h2>
          <EmbeddedVideo 
           source={"https://www.youtube.com/embed/xXS30d2q1X8?si=KLcO0taqTXi9cksV"} 
           title={"DEMO DOC2PRODUCT"}
          />
        </Card>
        
        <Card className="p-4 flex-1">
          <h3 className="font-semibold mb-2">Start your journey with Doc2Product - AI Powered</h3>
          <p className="text-sm text-gray-600 mb-4">
            Let us guide you through an easier way to transform your Google Docs into a Shopify page, eliminating the need for repetitive manual tasks.
          </p>
          <Button color="primary">Watch now</Button>
        </Card>
      </div>
    </div>
  );
};

export default HeaderSection;