import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-semibold text-gray-700">Loading...</span>
        <span className="text-lg font-semibold text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Please wait while we fetch your appointments...
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
