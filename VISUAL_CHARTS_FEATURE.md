# 📊 Visual Charts Feature - Mood Dashboard

## Overview

The Visual Charts feature provides comprehensive data visualization for mood tracking and analysis. It includes multiple chart types to display mood patterns, trends, and correlations over time, helping users understand their emotional patterns and make informed decisions about their mental health.

## 🎯 Features

### 1. **Line Chart** 📈

- **Purpose**: Shows mood progression over time
- **Data**: Individual mood entries with timestamps
- **Features**:
  - Animated line drawing with Framer Motion
  - Color-coded data points based on mood scores
  - Grid lines for easy reading
  - Interactive hover states
  - Responsive design

### 2. **Bar Chart** 📊

- **Purpose**: Displays mood distribution and frequency
- **Data**: Count of different mood states
- **Features**:
  - Animated bar growth
  - Color-coded mood categories
  - Rotated labels for readability
  - Mood-specific colors (happy=green, sad=red, etc.)

### 3. **Heatmap** 🔥

- **Purpose**: Visualizes mood patterns by time of day
- **Data**: Average mood scores for each hour
- **Features**:
  - 24-hour time grid
  - Color intensity based on mood scores
  - Day-of-week organization
  - Time-based pattern identification

### 4. **Radar Chart** 🎯

- **Purpose**: Shows correlations between different factors and mood
- **Data**: Factor correlation scores
- **Features**:
  - Multi-factor analysis
  - Circular grid layout
  - Animated area filling
  - Factor relationship visualization

### 5. **Activity Correlation Chart** 🏃‍♂️

- **Purpose**: Displays how different activities impact mood
- **Data**: Average mood scores for each activity
- **Features**:
  - Activity-specific icons
  - Sorted by impact strength
  - Color-coded impact levels
  - Numerical score display

## 🛠️ Technical Implementation

### Frontend Components

#### `MoodCharts.jsx`

```javascript
// Main chart component with type selection
const MoodCharts = ({
  moodEntries,
  analytics,
  chartType = "line",
  width = 600,
  height = 300,
  title,
}) => {
  // Renders different chart types based on chartType prop
};
```

#### Individual Chart Components

- `LineChart`: SVG-based line chart with animations
- `BarChart`: Animated bar chart with mood distribution
- `Heatmap`: Time-based mood visualization
- `RadarChart`: Factor correlation analysis
- `ActivityCorrelationChart`: Activity impact visualization

### Chart Features

#### 1. **Responsive Design**

- Adapts to different screen sizes
- Maintains aspect ratios
- Mobile-friendly interactions

#### 2. **Animations**

- Framer Motion integration
- Staggered animations for data points
- Smooth transitions between chart types

#### 3. **Color Coding**

```javascript
const getMoodColor = (score) => {
  if (score >= 4) return "#10B981"; // green
  if (score >= 3) return "#F59E0B"; // yellow
  if (score >= 2) return "#F97316"; // orange
  return "#EF4444"; // red
};
```

#### 4. **Interactive Elements**

- Chart type selector
- Hover tooltips
- Click interactions
- Responsive legends

## 📊 Chart Types in Detail

### Line Chart Implementation

```javascript
const LineChart = ({
  data,
  width = 600,
  height = 300,
  title = "Mood Trend",
}) => {
  // Sort data by timestamp
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Calculate chart dimensions and points
  const points = sortedData.map((entry, index) => {
    const x = padding + (index / (sortedData.length - 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((entry.moodScore - minScore) / scoreRange) * chartHeight;
    return { x, y, score: entry.moodScore };
  });

  // Create SVG path
  const pathData = points
    .map((point, index) =>
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    )
    .join(" ");
};
```

### Bar Chart Features

- **Mood Distribution**: Shows frequency of different mood states
- **Color Mapping**: Each mood type has a specific color
- **Animation**: Bars grow from bottom with staggered timing
- **Labels**: Rotated text for better readability

### Heatmap Implementation

```javascript
const Heatmap = ({
  data,
  width = 600,
  height = 300,
  title = "Mood Heatmap",
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Create grid cells for each hour/day combination
  return days.map((day, dayIndex) =>
    hours.map((hour, hourIndex) => {
      const score = data[hour] || 0;
      return (
        <rect
          key={`${day}-${hour}`}
          fill={score > 0 ? getHeatmapColor(score) : "#F3F4F6"}
        />
      );
    })
  );
};
```

### Radar Chart Analysis

- **Factor Correlations**: Shows relationships between mood and various factors
- **Circular Layout**: Factors arranged in a circle
- **Area Visualization**: Filled area shows correlation strength
- **Grid Lines**: Multiple concentric circles for scale reference

## 🎨 Visual Design

### Color Scheme

- **Green (#10B981)**: High mood scores (4-5)
- **Yellow (#F59E0B)**: Medium mood scores (3)
- **Orange (#F97316)**: Low-medium mood scores (2)
- **Red (#EF4444)**: Low mood scores (1)
- **Purple (#8B5CF6)**: Chart lines and accents

### Typography

- **Chart Titles**: 18px, semibold, gray-900
- **Axis Labels**: 12px, gray-500
- **Data Labels**: 14px, medium weight
- **Legends**: 12px, gray-600

### Spacing and Layout

- **Padding**: 50px for chart margins
- **Grid Gap**: 6px for chart elements
- **Border Radius**: 8px for rounded corners
- **Shadow**: Subtle drop shadows for depth

## 🔧 Integration with Dashboard

### Chart Selection

```javascript
const [selectedChartType, setSelectedChartType] = useState("line");

// Chart type buttons
{
  [
    { id: "line", label: "Line Chart", icon: "📈" },
    { id: "bar", label: "Bar Chart", icon: "📊" },
    { id: "heatmap", label: "Heatmap", icon: "🔥" },
    { id: "radar", label: "Radar Chart", icon: "🎯" },
    { id: "activity", label: "Activity Impact", icon: "🏃‍♂️" },
  ].map((chart) => (
    <button onClick={() => setSelectedChartType(chart.id)}>
      {chart.icon} {chart.label}
    </button>
  ));
}
```

### Data Flow

1. **Backend**: Provides comprehensive analytics data
2. **Service Layer**: Transforms data for chart consumption
3. **Component**: Renders appropriate chart type
4. **User Interaction**: Allows chart type switching

## 📈 Analytics Integration

### Data Sources

- **Mood Entries**: Individual mood tracking data
- **Analytics**: Calculated statistics and patterns
- **Time Patterns**: Hourly, daily, weekly, seasonal patterns
- **Factor Correlations**: Relationships between mood and various factors

### Chart Data Mapping

```javascript
// Line Chart: Uses moodEntries directly
<LineChart data={moodEntries} />

// Bar Chart: Uses mood distribution
<BarChart data={analytics?.moodDistribution} />

// Heatmap: Uses time patterns
<Heatmap data={analytics?.timePatterns} />

// Radar Chart: Uses factor correlations
<RadarChart data={analytics?.factorCorrelations} />

// Activity Chart: Uses activity correlation
<ActivityCorrelationChart data={analytics?.activityCorrelation} />
```

## 🎯 User Experience Features

### 1. **Chart Descriptions**

Each chart includes educational content explaining:

- What the chart shows
- How to interpret the data
- Key insights to look for
- Actionable takeaways

### 2. **Interactive Elements**

- **Chart Type Selector**: Easy switching between visualizations
- **Hover Effects**: Additional information on data points
- **Responsive Design**: Works on all device sizes
- **Loading States**: Smooth transitions between data loads

### 3. **Accessibility**

- **Color Contrast**: Meets WCAG guidelines
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Mode**: Supports system preferences

## 🚀 Performance Optimization

### 1. **SVG Rendering**

- Lightweight vector graphics
- Scalable without quality loss
- Efficient DOM manipulation

### 2. **Animation Performance**

- Hardware-accelerated animations
- Optimized re-renders
- Debounced interactions

### 3. **Data Handling**

- Efficient data transformations
- Lazy loading for large datasets
- Memory management for chart instances

## 🔮 Future Enhancements

### Planned Features

1. **Export Functionality**: Save charts as images/PDFs
2. **Custom Date Ranges**: User-defined time periods
3. **Comparative Charts**: Side-by-side comparisons
4. **Predictive Analytics**: Mood forecasting
5. **Interactive Annotations**: User notes on charts
6. **Real-time Updates**: Live data streaming
7. **Advanced Filtering**: Filter by mood types, activities, etc.

### Technical Improvements

1. **WebGL Rendering**: For large datasets
2. **Offline Support**: Cached chart data
3. **Progressive Loading**: Load charts incrementally
4. **Custom Themes**: User-defined color schemes
5. **Chart Templates**: Predefined chart configurations

## 📋 Usage Instructions

### For Users

1. **Navigate to Mood Dashboard**
2. **Select "Trends" tab**
3. **Choose chart type** from the selector
4. **Interpret the visualization** using provided descriptions
5. **Switch between charts** to explore different aspects

### For Developers

1. **Import MoodCharts component**
2. **Provide required data props**
3. **Specify chart type and dimensions**
4. **Handle chart interactions** as needed

## 🐛 Troubleshooting

### Common Issues

1. **Empty Charts**: Ensure data is properly formatted
2. **Missing Animations**: Check Framer Motion installation
3. **Responsive Issues**: Verify container dimensions
4. **Performance Problems**: Consider data size and chart complexity

### Debug Tips

- Check browser console for errors
- Verify data structure matches expected format
- Test with sample data first
- Monitor performance with React DevTools

## 📚 Related Documentation

- [Mood Dashboard Feature](./MOOD_DASHBOARD_FEATURE.md)
- [Analytics Implementation](./AI_MOOD_TRACKER_INTEGRATION.md)
- [Backend API Documentation](./TESTING_GUIDE.md)
- [Frontend Components Guide](./README.md)

---

This visual charts feature transforms raw mood data into meaningful, actionable insights through beautiful and interactive visualizations. Users can now easily understand their emotional patterns, identify trends, and make informed decisions about their mental health journey.
