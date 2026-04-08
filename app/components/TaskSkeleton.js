import React from "react";

const TaskSkeleton = () => {
  return (
    <div className="relative rounded-xl border border-gray-200 shadow-sm p-4 flex justify-between items-start w-full bg-white animate-pulse">
      {/* Status Ring Skeleton */}
      <div className="relative w-6 h-6 flex-shrink-0">
        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
      </div>

      {/* Task Content Skeleton */}
      <div className="ml-4 flex-1">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        {/* Description */}
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>

        <div className="flex mt-4 w-full justify-between items-center">
          {/* Date */}
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          {/* Status Text */}
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      {/* Options Menu Skeleton */}
      <div className="ml-2 flex-shrink-0">
        <div className="w-4 h-5 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default TaskSkeleton;
