import React from "react";
import { Loader as LucideLoader } from "lucide-react";

const Loader = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <LucideLoader
        className={`${sizeClasses[size]} animate-spin text-blue-500`}
      />
    </div>
  );
};

export default Loader;
