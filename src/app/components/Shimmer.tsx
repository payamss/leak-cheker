import React from 'react';

type ShimmerProps = {
  text?: string;
};

const Shimmer: React.FC<ShimmerProps> = ({ text }) => (
  <div className="animate-pulse items-center justify-center text-center bg-gray-200 text-gray-800 h-6 w-full rounded">
    {text}
  </div>
);

export default Shimmer;
