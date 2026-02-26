import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";

const WeekBarChart = ({ data = {} }) => {
  const convertToShort = {
    Sunday: "Sun",
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
  };

  const weekOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const normalizedData = {};
  Object.keys(data).forEach((day) => {
    const short = convertToShort[day];
    if (short) normalizedData[short] = data[day];
  });

  const chartData = weekOrder.map((day) => ({
    displayDay: day,
    value: normalizedData[day] || 0,
  }));

  // Define colors for each bar
  const barColors = [
    "#16a34a",
    "#f59e0b",
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
    "#10b981",
    "#f97316",
  ];

  return (
    <div className="w-full mx-auto">
      <h1 className="text-lg text-start font-semibold mt-2">
        Occurrence During Week
      </h1>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={20}
            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
          >
            <XAxis
              dataKey="displayDay"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const { value } = chartData.find(
                  (d) => d.displayDay === payload.value
                );

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      dy={16}
                      textAnchor="middle"
                      fill="#333"
                      fontSize={12}
                      fontWeight="600"
                    >
                      {payload.value}
                    </text>
                    <text
                      dy={32}
                      textAnchor="middle"
                      fill={barColors[weekOrder.indexOf(payload.value)]}
                      fontSize={12}
                      fontWeight="700"
                    >
                      {value}
                    </text>
                  </g>
                );
              }}
            />
            <Bar
              dataKey="value"
              radius={[10, 10, 0, 0]}
              fill="#16a34a"
              // Assign color per bar
              // index argument gives the bar index
              // fill will override default color
              shape={({ x, y, width, height, index }) => (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={10}
                  fill={barColors[index % barColors.length]}
                />
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeekBarChart;
