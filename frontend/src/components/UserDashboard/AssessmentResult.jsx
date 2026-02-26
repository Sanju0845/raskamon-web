import React from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import dayjs from "dayjs";

const AssessmentResult = ({ data, isOpen, onClose }) => {
  if (!isOpen) return null;

  if (!data)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <p className="text-white text-lg animate-pulse">
          Loading assessment data...
        </p>
      </div>
    );

  const { title, date, answers, totalScore, result, recommendations } = data;
  const formattedDate = date ? dayjs(date).format("DD MMM YYYY") : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-y-auto max-h-[75vh] p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          <FaTimes size={20} />
        </button>
        {/* Title */}
        <h1 className="text-xl max-sm:text-xl font-bold text-gray-800 m-4 text-center">
          {title || "Assessment Result"}
        </h1>
        {/* Date Badge */}
        {formattedDate && (
          <div className="flex justify-center mb-6">
            <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm shadow-sm">
              {formattedDate}
            </span>
          </div>
        )}

        {/* Questions */}
        <div className="grid gap-5 mb-8">
          {answers && answers.length > 0 ? (
            answers.map((answer, idx) => {
              const questionText =
                answer.question?.text || `Question ID: ${answer.questionId}`;

              // Find the option object by value
              const selectedOptionObj = answer.question?.options?.find(
                (o) => o.value === answer.selectedOption
              );
              const selectedOptionText = selectedOptionObj
                ? selectedOptionObj.text
                : `Option ${answer.selectedOption}`;

              const questionScore = answer.selectedOption; // use backend score directly
              const maxQuestionScore = answer.question?.options
                ? Math.max(...answer.question.options.map((o) => o.value))
                : answer.selectedOption;

              const progressPercent = Math.round(
                (questionScore / maxQuestionScore) * 100
              );

              return (
                <div
                  key={answer._id?.$oid || answer._id}
                  className="bg-gradient-to-br from-white to-blue-50 shadow-md rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition-transform transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800">
                      {idx + 1}. {questionText}
                    </p>
                    <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded-md text-sm shadow">
                      {questionScore}/{maxQuestionScore}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">
                    Answer:{" "}
                    <span className="text-blue-600 font-medium">
                      {selectedOptionText}
                    </span>
                  </p>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 text-center">No answers available.</p>
          )}
        </div>

        {/* Total Score & Result */}
        <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-white p-6 rounded-3xl text-center border border-blue-200 shadow-lg mb-8">
          <div className="flex justify-center items-center space-x-3 mb-3">
            <FaCheckCircle className="text-blue-600 w-6 h-6 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
              Your Score
            </h2>
          </div>
          <p className="text-gray-800 text-xl mb-1">
            <span className="font-semibold">Total Score:</span>{" "}
            {totalScore || "-"} /{" "}
            {answers
              ? answers.reduce((acc, answer) => {
                  const maxQ = answer.question?.options
                    ? Math.max(...answer.question.options.map((o) => o.value))
                    : answer.selectedOption;
                  return acc + maxQ;
                }, 0)
              : "-"}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Result:</span> {result || "-"}
          </p>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Recommendations
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentResult;
