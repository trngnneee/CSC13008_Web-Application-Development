"use client";

export const ProductItemSkeleton = () => {
  return (
    <div className="p-5 bg-white shadow-2xl rounded-[10px] animate-pulse">
      
      {/* IMAGE */}
      <div className="w-full h-[200px] bg-gray-200 rounded-md"></div>

      {/* NAME */}
      <div className="mt-[23px]">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* PRICE */}
      <div className="mt-[20px]">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* BUY NOW PRICE */}
      <div className="border-b border-black pb-2.5 mb-2.5 mt-3">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* POSTED TIME */}
      <div className="flex items-center gap-[5px] mb-2">
        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>

      {/* END DATE */}
      <div className="flex items-center gap-[5px]">
        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* BUTTON AREA */}
      <div className="flex items-center mt-[30px] gap-2.5">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded-full w-10"></div>
      </div>
    </div>
  );
};