import React from 'react';

export const CardSkeleton = ({ heightClass = 'h-64' }) => {
  return (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 p-2 shadow-sm animate-pulse">
      <div className={`w-full ${heightClass} rounded-xl bg-zinc-300 dark:bg-zinc-700`}></div>
      <div className="mt-3 px-2">
        <div className="h-4 w-3/4 rounded bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="mt-2 flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="h-3 w-1/3 rounded bg-zinc-300 dark:bg-zinc-700"></div>
        </div>
      </div>
    </div>
  );
};

export const MasonrySkeleton = () => {
  // Generate random heights to match masonry look
  const heights = [
    'h-48', 'h-72', 'h-56', 'h-80', 
    'h-60', 'h-48', 'h-64', 'h-72', 
    'h-56', 'h-80', 'h-64', 'h-60'
  ];

  return (
    <div className="columns-2 gap-4 p-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {heights.map((height, i) => (
        <CardSkeleton key={i} heightClass={height} />
      ))}
    </div>
  );
};
export default MasonrySkeleton;
