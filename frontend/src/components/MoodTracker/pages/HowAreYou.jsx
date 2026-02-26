import React, { useEffect, useRef, useState } from "react";
import { Calendar, Clock, ChevronDown, ChevronRight } from "lucide-react";

export default function HowAreYou() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  useEffect(() => {
    // Default to current date & time
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    setSelectedDate(today);
    setSelectedTime(currentTime);
  }, []);

  const formatDate = (date) => {
    const today = new Date();
    const chosen = new Date(date);
    const options = { day: "numeric", month: "long" };
    const formatted = chosen.toLocaleDateString("en-GB", options);

    const isToday =
      chosen.getDate() === today.getDate() &&
      chosen.getMonth() === today.getMonth() &&
      chosen.getFullYear() === today.getFullYear();

    return isToday ? `Today, ${formatted}` : formatted;
  };

  const formatTime12Hour = (time) => {
    if (!time) return "Select time";
    let [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) dateInputRef.current.showPicker();
    else dateInputRef.current.focus();
  };

  const openTimePicker = () => {
    if (timeInputRef.current?.showPicker) timeInputRef.current.showPicker();
    else timeInputRef.current.focus();
  };
  const [selectedMood, setSelectedMood] = useState(null);
  const moods = [
    { emoji: "😁", label: "Rad", color: "text-red-500" },
    { emoji: "🙂", label: "Good", color: "text-yellow-400" },
    { emoji: "😐", label: "Meh", color: "text-green-400" },
    { emoji: "🙁", label: "Bad", color: "text-green-500" },
    { emoji: "😭", label: "Awful", color: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-[100vh] py-10 px-4">
      {/* Heading */}
      <h1 className="text-4xl font-semibold mb-2 text-center">How are you?</h1>

      {/* Date + Time Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center">
        {/* Date Picker */}
        <div className="relative w-fit" onClick={openDatePicker}>
          <input
            type="date"
            id="datePicker"
            name="datePicker"
            ref={dateInputRef}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex items-center gap-2 px-4 py-2 text-green-500 cursor-pointer select-none">
            <Calendar className="text-green-500" size={20} />
            <span className="border-b border-b-green-500 whitespace-nowrap">
              {formatDate(selectedDate)}
            </span>
            <ChevronDown className="ml-2 text-green-500" size={18} />
          </div>
        </div>

        {/* Time Picker */}
        <div className="relative w-fit" onClick={openTimePicker}>
          <input
            type="time"
            id="timePicker"
            name="timePicker"
            ref={timeInputRef}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex items-center gap-2 px-4 py-2 text-green-500 cursor-pointer select-none">
            <Clock className="text-green-500" size={20} />
            <span className="border-b border-b-green-500 whitespace-nowrap">
              {formatTime12Hour(selectedTime)}
            </span>
            <ChevronDown className="ml-2 text-green-500" size={18} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 mb-8 mt-20">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => setSelectedMood(mood.label)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-transform duration-200 hover:scale-110 ${
              selectedMood === mood.label
                ? "text-green-500 "
                : "text-gray-800/50"
            }`}
          >
            <span className={`text-5xl ${mood.color}`}>{mood.emoji}</span>
            <p className="text-xs mt-1">{mood.label}</p>
          </button>
        ))}
      </div>
      <button className="flex flex-col items-center relative gap-2 mt-10">
        <div className="relative flex justify-center items-center rounded-full w-12 h-12 bg-green-500">
          <ChevronRight className="text-white" size={20} />
        </div>
        <div className=" font-medium">Continue</div>
      </button>
    </div>
  );
}
