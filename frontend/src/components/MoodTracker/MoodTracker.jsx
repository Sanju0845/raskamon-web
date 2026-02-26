import React, { useEffect, useContext, useRef, useState } from "react";
import axios from "axios";
import { Calendar, Clock, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
export default function MoodTracker() {
  const { token, userData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [moods, setMoods] = useState([]);
  const [selectedEmotions, setSelectedEmotions] = useState([]); // keeps "situation-emotion"
  const [selectedTags, setSelectedTags] = useState([]); // keeps "situation-tag"
  const [situationData, setSituationData] = useState({}); // stores payload by situation

  const getMoods = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/moods/get-all-moods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMoods(response.data.data);
    } catch (error) {
      console.error("Error fetching moods:", error);
    }
  };

  useEffect(() => {
    getMoods();
  }, []);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  useEffect(() => {
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

  const moodsList = [
    // ===== Positive Emotions =====
    {
      emoji: "😁",
      label: "Joyful",
      color: "text-yellow-400",
      description: "Feeling full of joy and excitement.",
    },
    {
      emoji: "😊",
      label: "Happy",
      color: "text-yellow-500",
      description: "Feeling good, cheerful, and positive.",
    },
    {
      emoji: "😌",
      label: "Calm",
      color: "text-blue-400",
      description: "Feeling relaxed and at peace.",
    },
    {
      emoji: "🙏",
      label: "Grateful",
      color: "text-amber-500",
      description: "Feeling thankful and appreciative.",
    },
    {
      emoji: "💪",
      label: "Motivated",
      color: "text-orange-500",
      description: "Feeling driven and ready to take action.",
    },
    {
      emoji: "❤️",
      label: "Loved",
      color: "text-pink-500",
      description: "Feeling cared for and emotionally supported.",
    },
    {
      emoji: "🌟",
      label: "Inspired",
      color: "text-yellow-300",
      description: "Feeling creative and full of new ideas.",
    },

    // ===== Negative Emotions =====
    {
      emoji: "😢",
      label: "Sad",
      color: "text-blue-500",
      description: "Feeling down or emotionally hurt.",
    },
    {
      emoji: "😡",
      label: "Angry",
      color: "text-red-600",
      description: "Feeling irritated, frustrated, or upset.",
    },
    {
      emoji: "😰",
      label: "Anxious",
      color: "text-teal-500",
      description: "Feeling nervous, worried, or uneasy.",
    },
    {
      emoji: "😩",
      label: "Tired",
      color: "text-gray-400",
      description: "Feeling exhausted or low on energy.",
    },
    {
      emoji: "😖",
      label: "Overwhelmed",
      color: "text-red-400",
      description: "Feeling like there's too much to handle.",
    },
    {
      emoji: "😭",
      label: "Awful",
      color: "text-purple-500",
      description: "Feeling extremely upset or distressed.",
    },

    // ===== Neutral / Ambiguous =====
    {
      emoji: "😐",
      label: "Neutral",
      color: "text-gray-500",
      description: "Feeling neither good nor bad.",
    },
    {
      emoji: "😕",
      label: "Confused",
      color: "text-indigo-400",
      description: "Feeling unsure or unclear about something.",
    },
    {
      emoji: "🥱",
      label: "Bored",
      color: "text-slate-400",
      description: "Feeling uninterested or unengaged.",
    },
    {
      emoji: "🙂",
      label: "Okay",
      color: "text-green-400",
      description: "Feeling fine, but not great.",
    },

    // ===== Complex / Mixed =====
    {
      emoji: "🥹",
      label: "Nostalgic",
      color: "text-pink-400",
      description: "Feeling emotional about past memories.",
    },
    {
      emoji: "🌈",
      label: "Hopeful",
      color: "text-emerald-400",
      description: "Feeling optimistic about the future.",
    },
    {
      emoji: "😔",
      label: "Guilty",
      color: "text-rose-400",
      description: "Feeling responsible for something wrong.",
    },
    {
      emoji: "😳",
      label: "Ashamed",
      color: "text-rose-500",
      description: "Feeling embarrassed or regretful.",
    },
  ];

  const toggleEmotion = (situation, emotion, itemData) => {
    const key = `${situation}-${emotion}`;
    setSelectedEmotions((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );

    // build or update situation object
    setSituationData((prev) => {
      const existing = prev[situation] || {
        situation,
        emotions: [],
        tags: [],
        entry_score: itemData.entry_score,
        final_adjusted: itemData.final_adjusted,
        intensities: itemData.intensities,
        normalized_score: itemData.normalized_score,
        tag_adjustment: itemData.tag_adjustment,
      };

      let updatedEmotions = [...existing.emotions];
      const existingEmotion = updatedEmotions.find(
        (e) => e.emotion === emotion
      );
      if (existingEmotion) {
        // remove if already there
        updatedEmotions = updatedEmotions.filter((e) => e.emotion !== emotion);
      } else {
        // pick random or first intensity from intensities
        const intensity =
          itemData.intensities?.[
            Math.floor(Math.random() * itemData.intensities.length)
          ] || 3;
        updatedEmotions.push({ emotion, intensity });
      }

      return {
        ...prev,
        [situation]: {
          ...existing,
          emotions: updatedEmotions,
        },
      };
    });
  };

  const toggleTag = (situation, tag) => {
    const key = `${situation}-${tag}`;
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );

    setSituationData((prev) => {
      const existing = prev[situation] || { situation, emotions: [], tags: [] };
      let updatedTags = [...existing.tags];
      if (updatedTags.includes(tag)) {
        updatedTags = updatedTags.filter((t) => t !== tag);
      } else {
        updatedTags.push(tag);
      }
      return {
        ...prev,
        [situation]: {
          ...existing,
          tags: updatedTags,
        },
      };
    });
  };

  const handleSubmiteMood = async () => {
    try {
      const userPayload = {
        date: selectedDate,
        time: selectedTime,
        mood: selectedMood,
        situations: Object.values(situationData),
      };

      await axios.post(`${backendUrl}/api/moods/submit-mood`, userPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Error submitting mood:", error);
    }
  };

  function checkIfTodayMoodSubmitted(userData) {
    if (!userData || !Array.isArray(userData.moodEntries)) return false;

    // Get today's local date in "YYYY-MM-DD" format
    // const today = new Date();
    // const todayStr = today.toLocaleDateString("en-CA"); // "2025-11-16"

    // const hasSubmitted = userData.moodEntries.some((entry) => {
    //   // Convert entry.createdAt to local date string
    //   const entryDate = new Date(entry.createdAt).toLocaleDateString("en-CA");
    //   return entryDate === todayStr;
    // });

    // if (hasSubmitted) {
    //   alert("You have already submitted your mood for today.");
    //   return true;
    // }

    setStep(2); // proceed to next step
    return false;
  }
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#F0F2FF]">
      <div className="max-w-7xl  flex w-full  justify-center  items-center m-auto  px-4 py-10">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex max-w-7xl flex-col items-center justify-center w-full  py-4 px-4 ">
            <div className=" bg-white rounded-2xl shadow-md text-center p-12 w-full max-w-4xl  items-center justify-center space-y-4">
              <h1 className="text-5xl font-bold mb-2 text-center">
                How are you feeling right now?
              </h1>
              <div>
                <p className="text-[20px] ">
                  Select the face that best describes your feelings
                </p>
                <p className="text-[14px]">Your current emotional state</p>
              </div>

              <div className="flex justify-center  items-center">
                <div className="relative w-fit" onClick={openDatePicker}>
                  <input
                    type="date"
                    ref={dateInputRef}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={todayString}
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

                <div className="relative w-fit" onClick={openTimePicker}>
                  <input
                    type="time"
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
            </div>

            <div className="grid grid-cols-4 justify-center  gap-4 mb-8 mt-10">
              {moodsList.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => {
                    setSelectedMood(mood.label),
                      checkIfTodayMoodSubmitted(userData);
                  }}
                  className={`flex flex-col space-y-3 items-center bg-white shadow-md p-6 rounded-3xl transition-transform duration-200 hover:scale-105 ${
                    selectedMood === mood.label
                      ? "text-green-500 "
                      : "text-gray-800/50"
                  }`}
                >
                  <span className={`text-6xl ${mood.color}`}>{mood.emoji}</span>
                  <p className="text-lg mt-1 text-black font-semibold">
                    {mood.label}
                  </p>
                  <p className="text-[14px] mt-1 ">{mood.description}</p>
                </button>
              ))}
            </div>

            {/* <button className="flex flex-col items-center relative gap-2 mt-10">
              <div className="relative flex justify-center items-center rounded-full w-12 h-12 bg-green-500">
                <ChevronRight className="text-white" size={20} />
              </div>
              <div className="font-medium">Continue</div>
            </button> */}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="p-6 flex flex-col m-auto justify-center items-center max-w-6xl w-full">
            {/* === Mood Cards Grid === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {moods.map((item) => (
                <div
                  key={item._id}
                  className="
            rounded-2xl bg-white border border-gray-200 
            p-6 flex flex-col transition-all 
            hover:shadow-sm hover:-translate-y-1
          "
                >
                  {/* Title */}
                  <h2 className="text-gray-800 font-semibold text-lg mb-4 capitalize">
                    {item.situation}
                  </h2>

                  {/* Emotions */}
                  <div className="flex flex-wrap gap-2">
                    {item.emotions?.map((emotion, i) => {
                      const key = `${item.situation}-${emotion}`;
                      const isSelected = selectedEmotions.includes(key);

                      return (
                        <button
                          key={i}
                          onClick={() =>
                            toggleEmotion(item.situation, emotion, item)
                          }
                          className={`
                    text-base px-3 py-1.5 rounded-full border transition-all duration-200
                    ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600"
                        : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                    }
                  `}
                        >
                          {emotion}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* === Continue Button === */}
            <div className="flex justify-center w-full mt-10">
              <button
                onClick={() => setStep(3)}
                className="
          px-6 py-2.5 rounded-lg bg-green-600 
          hover:bg-green-700 text-white font-medium 
          transition-all shadow-sm hover:shadow
        "
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="w-full max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setStep(2)}
              className="
        text-green-600 text-sm font-medium border border-green-600 
        px-3 py-1.5 rounded-full hover:bg-green-50 transition-all
      "
            >
              ← Back
            </button>

            {/* Title Card */}
            <h1
              className="
        text-2xl font-semibold text-gray-900 text-center
        bg-white border border-gray-200 shadow-sm
        p-5 rounded-2xl w-full mt-4 mb-6
      "
            >
              Select tags for your situations
            </h1>

            {/* Situation Cards */}
            <div className="space-y-6">
              {moods
                .filter((item) =>
                  Object.keys(situationData).includes(item.situation)
                )
                .map((item) => (
                  <div
                    key={item._id}
                    className="
              p-6 rounded-2xl bg-white border border-gray-200 
              shadow-sm hover:shadow-md hover:-translate-y-1 
              transition-all
            "
                  >
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      {item.situation}
                    </h2>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => {
                        const key = `${item.situation}-${tag}`;
                        const isSelected = selectedTags.includes(key);

                        return (
                          <button
                            key={idx}
                            onClick={() => toggleTag(item.situation, tag)}
                            className={`
                      text-sm px-4 py-1.5 rounded-full border transition-all
                      ${
                        isSelected
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                      }
                    `}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>

            {/* Finish Button */}
            <div className="flex justify-center mt-10">
              <button
                onClick={handleSubmiteMood}
                className="
          px-12 py-2.5 rounded-2xl bg-green-600 
          hover:bg-green-700 text-white font-semibold 
          shadow-sm hover:shadow transition-all
        "
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
