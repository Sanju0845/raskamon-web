import React, { useState } from "react";

export default function Pricing() {
  const [active, setActive] = useState("Pro");

  return (
    <div className="w-full bg-slate-100 min-h-screen flex flex-col items-center py-12">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <span className="font-medium text-gray-400 tracking-widest uppercase">
          Our Price
        </span> */}
        <h2 className="mt-7 text-3xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Voice Chat Plans
        </h2>
        <div className="mt-5 w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto"></div>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 text-center">
          Talk to our AI Agent ( Raska) through Voice anytime, effortlessly
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-col lg:flex-row items-center justify-center mt-12  px-4 lg:px-0">
        <div
          onClick={() => setActive("Lite")}
          class="lg:w-[23rem] bg-white text-gray-600 w-full border-2 lg:border-r-0 border-gray-200 p-5 rounded-2xl lg:rounded-r-none"
        >
          <div class="pb-3 mb-4 border-b border-gray-200">
            <div class="text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Lite
            </div>
            <div class="flex items-center">
              <h2 class="text-5xl m-0 font-normal">₹400</h2>
              <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1">
                /1hr
              </span>
            </div>
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            2-Way Voice
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            60 Minutes
          </div>
          <div class="flex text-sm items-center  mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~100,000 Characters
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~100,000 Total Credits
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 3.75
       L14.63 9.08
       L20.5 9.93
       L16.25 14.07
       L17.25 19.92
       L12 17.15
       L6.75 19.92
       L7.75 14.07
       L3.5 9.93
       L9.37 9.08
       Z"
              ></path>
            </svg>
            1 credit per character
          </div>
          <div class="mt-4 w-full">
            {active === "Lite" && (
              <button class=" w-full group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2 rounded-full text-lg font-semibold  flex items-center shadow-xl transition-all duration-300 justify-center gap-2">
                Get Lite
                <svg
                  class="ml-auto"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.75 6.75L19.25 12L13.75 17.25"
                  ></path>
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 12H4.75"
                  ></path>
                </svg>
              </button>
            )}
            <div class="text-xs mt-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent line-height-2">
              Voice chat credits for real-time emotional support.
            </div>
          </div>
        </div>
        <div
          onClick={() => setActive("Pro")}
          class="lg:w-[23rem] bg-white text-gray-600 w-full lg:my-0 my-4 border-2 border-gray-200 p-5 rounded-2xl lg:shadow-8"
        >
          <div class="pb-3 mb-4 border-b border-gray-200">
            <div class="text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              PRO
            </div>
            <div class="flex items-center">
              <h2 class="text-5xl m-0 font-normal">₹1800</h2>
              <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1">
                /5hr
              </span>
            </div>
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            2-Way Voice
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            300 Minutes
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~500,000 Characters
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~500,000 Total Credits
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            Real-time AI Voice
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 3.75
       L14.63 9.08
       L20.5 9.93
       L16.25 14.07
       L17.25 19.92
       L12 17.15
       L6.75 19.92
       L7.75 14.07
       L3.5 9.93
       L9.37 9.08
       Z"
              ></path>
            </svg>
            1 credit per character
          </div>

          <div class="mt-4 w-full">
            {active === "Pro" && (
              <button class=" w-full group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2 rounded-full text-lg font-semibold  flex items-center shadow-xl transition-all duration-300 justify-center gap-2">
                Get Pro
                <svg
                  class="ml-auto"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.75 6.75L19.25 12L13.75 17.25"
                  ></path>
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 12H4.75"
                  ></path>
                </svg>
              </button>
            )}
            <div class="text-xs mt-3  line-height-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Voice chat credits for real-time emotional support.
            </div>
          </div>
        </div>
        <div
          onClick={() => setActive("Unlimited")}
          class="lg:w-[23rem] bg-white text-gray-600 w-full border-2 lg:border-l-0 border-gray-200 p-5 rounded-2xl lg:rounded-l-none"
        >
          <div class="pb-3 mb-4 border-b border-gray-200">
            <div class="text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Unlimited
            </div>
            <div class="flex items-center">
              <h2 class="text-5xl m-0 font-normal">₹3500</h2>
              <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-1">
                /10hr
              </span>
            </div>
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            2-Way Voice
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            600 Minutes
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~1,000,000 Characters
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5.75 12.8665L8.33995 16.4138C9.15171 17.5256 10.8179 17.504 11.6006 16.3715L18.25 6.75"
              ></path>
            </svg>
            ~1,000,000 Total Credits
          </div>
          <div class="flex text-sm items-center mb-2">
            <svg
              width="24"
              height="24"
              fill="none"
              class="text-green-500 mr-1"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 3.75
       L14.63 9.08
       L20.5 9.93
       L16.25 14.07
       L17.25 19.92
       L12 17.15
       L6.75 19.92
       L7.75 14.07
       L3.5 9.93
       L9.37 9.08
       Z"
              ></path>
            </svg>
            1 credit per character
          </div>
          <div class="mt-4 w-full">
            {active === "Unlimited" && (
              <button class=" w-full group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2 rounded-full text-lg font-semibold  flex items-center shadow-xl transition-all duration-300 justify-center gap-2">
                Get Unlimited
                <svg
                  class="ml-auto"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M13.75 6.75L19.25 12L13.75 17.25"
                  ></path>
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 12H4.75"
                  ></path>
                </svg>
              </button>
            )}
            <div class="text-xs mt-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent line-height-2">
              Voice chat credits for real-time emotional support.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
