import React from 'react';
import PinCard from './PinCard';

const MasonryGrid = ({ posts, onLikeUpdate }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">No pins discovered here yet.</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Try searching for something else or create your own pin!</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 p-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 sm:gap-4 sm:p-4 [column-fill:_balance] w-full">
      {posts.map((post) => (
        <PinCard key={post._id} post={post} onLikeUpdate={onLikeUpdate} />
      ))}
    </div>
  );
};

export default MasonryGrid;
