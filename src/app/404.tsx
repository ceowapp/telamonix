'use client';
import React from 'react';

const Page404 = () => {
  return (
    <section className="py-10 bg-white font-arvo">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="bg-404-bg h-400px bg-center bg-no-repeat flex items-center justify-center">
              <h1 className="text-8xl">404</h1>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl">
                Looks like you&apos;re lost
              </h3>
              <p className="text-gray-700">The page you are looking for is not available!</p>
              <a href="/" className="text-white bg-green-600 px-4 py-2 rounded mt-4 hover:bg-green-200 cursor-pointer inline-block">
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page404;
