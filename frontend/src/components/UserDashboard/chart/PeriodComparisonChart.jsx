import { Triangle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

const PeriodComparisonChart = ({ frequency }) => {
  const {
    lastPeriod = 0,
    thisPeriod = 0,
    currentPeriodDaily = [],
  } = frequency || {};

  // Calculate trend
  const delta = thisPeriod - lastPeriod;
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const trendColor = isPositive
    ? "text-green-500"
    : isNegative
    ? "text-red-500"
    : "text-gray-400";
  const trendArrow = isPositive ? (
    <Triangle className={`w-4 h-4 ${trendColor}`} />
  ) : isNegative ? (
    <Triangle className={`w-4 h-4 ${trendColor} rotate-180`} />
  ) : null;
  const trendPercentage =
    delta === 0 ? "0%" : `${isPositive ? "+" : "-"}${100}%`;

  // Get month names
  const getCurrentAndPreviousMonth = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const previousMonthIndex = (currentMonthIndex - 1 + 12) % 12;
    return {
      currentMonth: monthNames[currentMonthIndex],
      previousMonth: monthNames[previousMonthIndex],
    };
  };

  // Format daily data
  const chartData = currentPeriodDaily.map((d) => ({
    ...d,
  }));

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-lg text-start font-semibold mt-2">Frequency</h1>

      {/* Bar Chart */}
      <div className="w-full h-24 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={20}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <Bar
              dataKey="count"
              radius={[10, 10, 0, 0]}
              fill="#16a34a" // single green color
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="flex w-full mb-4">
        {/* This Period */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-300 py-2">
          <p className="text-lg font-semibold">
            <span className="text-gray-500">X</span> {thisPeriod}
          </p>
          <p className="text-sm text-gray-500">
            {getCurrentAndPreviousMonth().currentMonth}
          </p>
        </div>

        {/* Last Period */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-300 py-2">
          <p className="text-lg font-semibold">
            <span className="text-gray-500">X</span> {lastPeriod}
          </p>
          <p className="text-sm text-gray-500">
            VS. {getCurrentAndPreviousMonth().previousMonth}
          </p>
        </div>

        {/* Trend */}
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <p className="text-lg text-center flex justify-center items-center gap-1 font-semibold">
            {trendArrow}
            <span className={`${trendColor}`}>{thisPeriod}</span>
          </p>
          <p className="text-sm text-gray-500">TREND</p>
          <p className={`text-xs font-semibold ${trendColor}`}>
            {trendPercentage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeriodComparisonChart;
