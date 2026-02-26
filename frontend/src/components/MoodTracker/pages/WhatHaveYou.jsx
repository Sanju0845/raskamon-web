import { Plus } from "lucide-react";
import React, { useState } from "react";

export default function WhatHaveYou({ data = [] }) {
  const [selectedEmotions, setSelectedEmotions] = useState([]);

  const toggleEmotion = (situation, emotion) => {
    const key = `${situation}-${emotion}`;
    setSelectedEmotions((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  return (
    <div className="p-4 flex m-auto justify-center items-center max-w-6xl">
      {/* <h1 className="text-gray-800 font-semibold text-xl mb-6">
        What Have You Been Feeling?
      </h1> */}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item._id}
            className="border rounded-2xl shadow-md bg-white transition-all hover:shadow-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 ">
              <h2 className="text-gray-700 font-medium capitalize">
                {item.situation}
              </h2>
              <div className="bg-gray-100 hover:bg-green-100 transition-all rounded-full flex justify-center items-center w-10 h-10 cursor-pointer">
                <Plus className="text-green-500" />
              </div>
            </div>

            {/* Emotions */}
            <div className="p-4 flex flex-wrap gap-2">
              {item.emotions?.map((emotion, i) => {
                const key = `${item.situation}-${emotion}`;
                const isSelected = selectedEmotions.includes(key);
                return (
                  <button
                    key={i}
                    onClick={() => toggleEmotion(item.situation, emotion)}
                    className={`text-sm px-3 py-1 rounded-full font-medium border transition-all duration-200 
                      ${
                        isSelected
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
