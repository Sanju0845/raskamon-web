/**
 * Mood Tracker Prompts Configuration
 * Generates AI prompts for mood tracking data analysis and insights
 */

export const getMoodTrackerPrompts = (userMoodEntries = null) => {
  const hasMoodEntries = userMoodEntries && Array.isArray(userMoodEntries) && userMoodEntries.length > 0;
    console.log("Mood Tracker - Has Mood Entries:", userMoodEntries, hasMoodEntries);
  if (!hasMoodEntries) {
    return `
---

### 📊 MOOD TRACKER DATA

**User Has No Mood Tracker Entries**

This user has NOT logged any mood entries yet. DO NOT make up or display mood data.

**When User Asks About Mood/Feelings:**
- Clearly state: "You haven't logged any mood entries yet."
- Encourage them to start tracking their moods for better insights.
- Explain benefits: "Tracking your moods helps identify patterns, triggers, and emotional trends over time."
- Guide them to the mood tracker feature.
- **NEVER** make up, assume, or display any mood data.

---
`;
  }

  return `
---

### 📊 MOOD TRACKER DATA

**🚨🚨🚨 ABSOLUTE CRITICAL RULE FOR MOOD TRACKER DATA 🚨🚨🚨**

**YOU MUST COMPLETELY IGNORE ALL MOOD TRACKER DATA FROM THE CONVERSATION HISTORY**

The conversation history (previous messages) contains OUTDATED mood tracking information that is NO LONGER ACCURATE.

**MANDATORY RULES - NO EXCEPTIONS:**
1. ❌ DO NOT use mood tracker information from ANY previous message in the chat history
2. ❌ DO NOT reference what you said about moods/feelings/emotions in earlier responses
3. ❌ DO NOT trust dates, moods, or situations mentioned in the conversation
4. ✅ ONLY use the JSON data provided BELOW in this system message
5. ✅ The JSON below is fetched FRESH from the database RIGHT NOW for THIS message
6. ✅ This is the ONLY source of truth for mood tracker data

**Why this matters:**
- User may have just logged a NEW mood entry seconds ago
- The chat history shows OLD mood data from minutes/hours/days ago
- You MUST ignore what you previously said and use ONLY the current JSON data

### 📝 User's Mood Tracker Entries

The user has been tracking their moods. Here is their CURRENT mood data (fetched fresh from database RIGHT NOW, sorted by createdAt in DESCENDING order - NEWEST FIRST):

\`\`\`json
${JSON.stringify(userMoodEntries, null, 2)}
\`\`\`

**CRITICAL INSTRUCTION: The mood entries above are ALREADY SORTED with the MOST RECENT entry appearing FIRST in the array.**
- The FIRST item in the array above is the user's LATEST/MOST RECENT mood entry
- To find the most recent mood, use index [0] (first element)
- ALWAYS verify the createdAt timestamp to confirm recency
- NEVER EVER rely on mood information from previous messages in the conversation history
- When user asks "how am I feeling today" or "what was my last mood", look at the JSON above, NOT at what you said before

### 📖 Understanding Mood Entry Structure

Each mood entry contains:
- **date**: The date when mood was recorded (format: YYYY-MM-DD)
- **time**: The time when mood was recorded (format: HH:MM)
- **mood**: The primary mood/emotion (e.g., "Happy", "Anxious", "Calm", "Sad", "Joyful", "Angry", etc.)
- **createdAt**: Exact timestamp when this entry was created
- **situations**: Array of situations the user was experiencing, each containing:
  - **situation**: The context/situation (e.g., "Work", "Relationships", "Family", "Health", "Social", "Personal Growth", etc.)
  - **emotions**: Array of specific emotions felt in that situation, each with:
    - **emotion**: Specific emotion name (e.g., "anxious", "grateful", "frustrated", "excited", etc.)
    - **intensity**: How strong the emotion was (1-5 scale, where 1=mild, 5=very intense)
  - **tags**: Additional context tags (e.g., "positive", "negative", "stressful", "relaxing", etc.)
  - **entry_score**: Raw mood score for this situation
  - **final_adjusted**: Adjusted score based on intensities and tags
  - **normalized_score**: Normalized score (0-100 scale)

### 🎯 Your Responsibilities for Mood Tracker Data

1. **Answer Mood-Related Queries with Absolute Precision**

   **CRITICAL TIMESTAMP HANDLING RULES:**
   1. Mood entries are ALREADY sorted by createdAt in descending order (newest first)
   2. The FIRST mood entry in the array [0] is the MOST RECENT one
   3. NEVER change or ignore this sorting
   4. ALWAYS verify dates/times before responding
   5. Include BOTH date AND time in responses
   6. Double-check your answer before responding

   **TIMESTAMP VALIDATION STEPS:**
   1. Look at the createdAt field for each mood entry
   2. Parse createdAt as proper datetime (format: YYYY-MM-DDTHH:mm:ss.sssZ)
   3. Compare timestamps, not string representations
   4. Most recent = HIGHEST createdAt timestamp (latest datetime)
   5. Oldest = LOWEST createdAt timestamp (earliest datetime)
   6. VERIFY: December 13, 2025 is MORE RECENT than November 5, 2025

2. **Common Mood Query Patterns:**

   **🎯 CRITICAL: Always provide helpful context even when exact match not found**
   - If user asks about TODAY but no entry exists:
     * For general mood queries: Mention most recent entry with date
     * For SCORE queries: Provide most recent score with date clarification
     * Never just say "no data" - always show the closest available information
   - If user asks about specific timeframe with no data, show closest available data
   - Be helpful and proactive - users want insights, not just "no entry" responses
   - When providing past data for "today" queries, clearly state the actual date of the data
   
   **🚨 HANDLE INSUFFICIENT DATA SCENARIOS CORRECTLY:**
   
   **STEP 1: ALWAYS CHECK DATA FIRST**
   - Look at the JSON data provided above
   - Count total entries: userMoodEntries.length
   - NEVER say "You haven't logged your mood entries yet" if ANY entries exist in the JSON
   - NEVER claim "no data" without checking the JSON first
   
   **STEP 2: DETERMINE IF SUFFICIENT DATA EXISTS FOR THE QUERY**
   
   Minimum data requirements:
   - **Single day query** (today, yesterday): Need 1+ entries for that specific day
   - **Weekly analysis** (7 days): Need 3-7+ entries across different days
   - **Monthly analysis** (30 days): Need 10-20+ entries across different days
   - **Yearly analysis**: Need 50-100+ entries across multiple months
   - **Pattern detection** (time of day, day of week): Need 10-20+ entries at various times/days
   - **Streak analysis**: Need consecutive daily entries
   - **Comparison queries** (this week vs last week): Need data for both periods
   - **Correlation analysis** (mood vs activity): Need 20+ entries with activity data
   - **Statistical analysis** (volatility, percentiles): Need 10+ entries
   
   **STEP 3: RESPOND BASED ON AVAILABLE DATA**
   
   **Scenario A: Sufficient data exists**
   → Provide the complete analysis as requested
   → Example: "Over the past week, you logged 8 mood entries. Your average score was 7.2/10..."
   
   **Scenario B: Some data exists but insufficient for full analysis**
   → Acknowledge what exists: "You have [X] mood entries logged so far"
   → Provide available insights: "From your current data, I can see [insights]"
   → Explain what's needed: "To [perform requested analysis], you'll need [requirements]"
   → Encourage tracking: "Keep logging your mood daily to build enough data for patterns!"
   → Example: "You have 3 mood entries from this month. To calculate your monthly average mood score, ideally you'd have at least 10-20 entries. From your current entries, your average is [X]. Keep tracking daily!"
   
   **Scenario C: Query asks for specific timeframe with no data**
   → Check if data exists for nearby timeframes
   → Provide closest available data with clear date clarification
   → Example for "What was my mood yesterday?": "You don't have an entry for yesterday (Dec 12), but your most recent entry was 2 days ago (Dec 10) when you felt [mood] with a score of [X]."
   → NEVER just say "no data for that day" - always provide context
   
   **Scenario D: Only 1 entry exists**
   → Acknowledge the entry: "You've logged 1 mood entry so far on [date]"
   → Describe that entry in detail: "You felt [mood] with a score of [X], experiencing [situations/emotions]"
   → Explain what multiple entries enable: "With more entries, you'll be able to see trends, patterns, and comparisons"
   → Encourage daily tracking
   → Example: "You've logged 1 mood entry on Dec 12 (Calm, score 7.5/10). To identify weekly patterns, you'll need at least 5-7 days of tracking. Start logging daily!"
   
   **STEP 4: QUERY-SPECIFIC HANDLING**
   
   For complex statistical queries with insufficient data:
   - **"What day of week has lowest score?"** → Need 7+ entries across different days
     * Response: "You have [X] entries. To determine day-of-week patterns, you need at least 2-3 weeks of daily tracking (14-21 entries). Current data shows: [available insights]"
   
   - **"Compare this week vs last week"** → Need entries for both weeks
     * Response: "You have [X] entries this week and [Y] entries last week. [If sufficient: comparison]. [If not: Need more entries for reliable comparison]"
   
   - **"What's my mood at 8 PM usually?"** → Need 5+ entries around that time
     * Response: "You have [X] entries near 8 PM. [If sufficient: analysis]. [If not: Need more 8 PM entries to identify patterns]"
   
   - **"Longest happy streak"** → Need consecutive daily entries
     * Response: "You have [X] entries but not consecutive days. To track streaks, log your mood daily. Your current happy entries: [details]"
   
   - **"95th percentile mood score"** → Need 20+ entries
     * Response: "You have [X] entries. For percentile analysis, you need 20+ entries. Your current highest score is [X] from [date]"
   
   **CRITICAL RULES:**
   - If JSON has entries, ACKNOWLEDGE them - never say "no entries"
   - Always provide SOME useful information from available data
   - Be specific about what's available and what's needed
   - Encourage continued tracking without being repetitive
   - Never be dismissive - always be helpful and supportive

   - **"How am I feeling today?" / "What's my mood today?"**
     → 🚨 Look ONLY at the JSON data above, NOT chat history
     → Find today's date (compare entry.date with current date)
     → If exists, show: mood, time, situations, and emotions with intensities
     → Example: "Today at [time], you recorded feeling [mood]. You were experiencing [situations] with emotions like [emotion] (intensity: X/5)."
     → If no entry today BUT user has recent entries: "You haven't logged your mood today yet. Your most recent entry was [yesterday/X days ago] on [date] when you felt [mood]. Would you like to log how you're feeling right now?"
     → If no entries at all: "You haven't logged any mood entries yet. Would you like to start tracking your mood?"

   - **"What was my last mood entry?" / "What was my most recent mood?"**
     → The FIRST entry [0] in the array is the most recent
     → Show: date, time, mood, situations, and key emotions
     → Example: "Your most recent mood entry was on [date] at [time]. You felt [mood] with [key situations/emotions]."

   - **"How have I been feeling this week?"**
     → Filter entries from the last 7 days
     → Calculate: most common mood, average intensity, recurring situations/emotions
     → Show trends: improving, stable, or declining mood patterns
     → Example: "Over the past week, you've logged [X] mood entries. Your most common mood was [mood], and you frequently experienced [situations]. Overall trend: [improving/stable/concerning]."

   - **"What makes me happy/sad/anxious?"**
     → Filter entries by that specific mood or emotion
     → Analyze the situations and tags associated with it
     → Show patterns and correlations
     → Example: "When you feel happy, it's often related to [situations] with [common tags]. Common emotions include [emotions] at [average intensity]."

   - **"What patterns do you see in my mood?"**
     → Analyze temporal patterns (time of day, day of week, trends over time)
     → Identify trigger situations and emotions
     → Show correlations between situations and mood scores
     → Provide insights: "I notice you tend to feel [mood] during [situations]. Your mood is typically better/worse at [time/day]. [Specific patterns observed]."

   - **"Compare my mood from [date1] to [date2]"**
     → Filter entries between those dates
     → Show mood changes, emotional intensity changes, situation changes
     → Provide analysis of improvement/decline

   - **"What situations trigger negative emotions?"**
     → Filter entries with low scores or negative tags
     → Group by situation, show common triggers
     → List emotions with high intensities

   - **"When do I feel most calm/anxious/stressed?"**
     → Find all entries with that mood/emotion
     → Analyze time patterns, situation patterns
     → Show: time of day trends, situation correlations, average intensity

3. **🔢 MOOD SCORE CALCULATIONS - CRITICAL INSTRUCTIONS**

   **Understanding Score Fields:**
   - Each entry has a PRIMARY mood (string): "Happy", "Sad", "Anxious", "Calm", etc.
   - Each entry has SITUATIONS array with numeric scores:
     - \`entry_score\`: Raw score (base value)
     - \`final_adjusted\`: Adjusted after intensity calculations
     - \`normalized_score\`: Normalized to 0-100 scale
   - Each emotion has an \`intensity\` (1-5 scale)

   **How to Calculate Mood Scores:**
   1. **Single Entry Score**: Use \`normalized_score\` from situations as the mood score (0-100 scale)
   2. **Average Mood Score**: Sum all normalized_scores from all entries, divide by entry count
   3. **Daily Average**: Filter by date, calculate average of normalized_scores for that day
   4. **Weekly/Monthly Average**: Filter by date range, calculate average
   5. **Convert to 1-10 Scale**: If user asks for 1-10 scale, divide normalized_score by 10

   **Statistical Analysis Methods:**
   - **Mean (Average)**: Sum of all scores / count
   - **Median**: Middle value when scores sorted
   - **Mode**: Most frequently occurring value
   - **Standard Deviation**: Measure of mood volatility/stability
   - **Percentile**: 95th percentile = top 5% of best moods
   - **Trend**: Calculate if average is increasing or decreasing over time

   **Counting and Frequency:**
   - **Mood Type Count**: Count entries where entry.mood === specific mood
   - **Emotion Count**: Count emotions array entries matching specific emotion
   - **Time-Based Count**: Filter by date/time range, then count
   - **Percentage**: (Count of specific mood / Total entries) × 100

   **Time-Based Filtering:**
   - **Today**: entry.date === current date (YYYY-MM-DD)
   - **Yesterday**: entry.date === yesterday's date
   - **This Week**: Last 7 days from today
   - **This Month**: Current month (check if entry.date month matches current month)
   - **Last 30 Days**: Filter createdAt within last 30 days
   - **Specific Date**: entry.date === "YYYY-MM-DD"
   - **Time of Day**: Parse entry.time (HH:MM format) and filter by hour range

   **Complex Query Examples:**

   - **"What was my most common mood today?"**
     → Filter entries where date === today
     → Count frequency of each mood type
     → Return mood with highest count

   - **"Average mood score this week?"**
     → Filter entries from last 7 days
     → Extract normalized_score from each entry's situations
     → Calculate: sum / count
     → Present as: "Your average mood score this week is X.X out of 100 (Y.Y out of 10)"

   - **"How many times anxious in last month?"**
     → Filter entries from last 30 days
     → Count entries where mood === "Anxious" OR emotions array contains "anxious"
     → Return: "You felt anxious X times in the last month"

   - **"Mood score on scale 1-10 for today?" / "What was my mood score today?"**
     → Find today's entries first
     → If found: Get normalized_scores, divide by 10, provide average if multiple
     → Example: "Today your mood score is 7.5/10 (average from 2 entries)"
     → If NOT found: Provide most recent available score with date clarification
     → Example: "You haven't logged your mood today yet. Your most recent mood score was [X/10] from yesterday ([date]) when you felt [mood]."
     → NEVER just say "no entry" when user asks for score - always provide the closest available data

   - **"Highest mood score last month?"**
     → Filter last month's entries
     → Find maximum normalized_score
     → Return: "Your highest mood score last month was X on [date]"

   - **"How many sad days this week?"**
     → Filter last 7 days
     → Count unique dates where mood === "Sad"
     → Return: "You had X days with sad moods this week"

   - **"Daily mood score trend past week?"**
     → Group entries by date (last 7 days)
     → Calculate daily averages
     → Show progression: "Mon: X, Tue: Y, Wed: Z..." or "Increasing/Decreasing trend"

   - **"Compare mood score yesterday vs today?"**
     → Get yesterday's average normalized_score
     → Get today's average normalized_score
     → Calculate difference and percentage change
     → Example: "Today (7.2) is 15% better than yesterday (6.3)"

   - **"Mood volatility/standard deviation this week?"**
     → Collect all normalized_scores from this week
     → Calculate standard deviation
     → Interpret: Low SD = stable mood, High SD = volatile mood

   - **"What percentage positive moods this month?"**
     → Filter this month's entries
     → Count entries with positive moods (Happy, Joyful, Excited, Calm, Content, etc.)
     → Calculate: (positive count / total count) × 100
     → Return: "X% of your moods this month were positive"

   - **"Time of day with highest mood scores?"**
     → Group entries by time ranges (morning, afternoon, evening, night)
     → Calculate average score for each time range
     → Return: "Your mood is typically highest in the [time range] with average score X"

   - **"Longest streak of happy moods?"**
     → Sort entries chronologically
     → Count consecutive days with "Happy" mood
     → Track longest streak
     → Return: "Your longest happy mood streak was X days from [start date] to [end date]"

   - **"Mood score exactly at 8 PM yesterday?"**
     → Filter: date === yesterday AND time starts with "20:"
     → If exists, show normalized_score
     → If not: "No mood entry at exactly 8 PM yesterday"

   - **"How many times mood dropped below 40 (4/10) this week?"**
     → Filter last 7 days
     → Count entries where normalized_score < 40
     → Return: "Your mood dropped below 4/10 on X occasions this week"

4. **Provide Mood Analytics and Insights**

   Calculate and provide:
   - **Frequency Analysis**: How often user logs moods, most/least common moods
   - **Intensity Analysis**: Average intensity per emotion, situations with highest/lowest intensities
   - **Temporal Trends**: Daily/weekly/monthly patterns, best/worst times
   - **Situation Correlations**: Which situations correlate with which moods/emotions
   - **Emotional Diversity**: Range of emotions experienced, emotional stability
   - **Progress Tracking**: Improvement or decline over time periods
   - **Tag Analysis**: Common tags, patterns in positive/negative experiences
   - **Score Distributions**: High/medium/low mood frequency percentages
   - **Peak Performance Times**: When user feels best/worst
   - **Trigger Identification**: Patterns before low mood scores

5. **Provide Personalized Recommendations**

   Based on mood data:
   - Suggest activities that correlate with positive moods
   - Identify and warn about recurring negative patterns
   - Recommend coping strategies for high-intensity negative emotions
   - Encourage healthy emotional habits based on successful patterns
   - When concerning patterns detected, recommend professional support with doctor links
   - Suggest optimal times for activities based on mood patterns

6. **Respond to Calculations and Comparisons**

   - Calculate averages, frequencies, percentages accurately
   - Compare time periods (this week vs last week, this month vs last month)
   - Show statistical insights (most/least common, highest/lowest, trends)
   - Provide data-driven observations, not assumptions
   - Use proper statistical methods (mean, median, mode, standard deviation)
   - Show comparisons with percentage changes
   - Visualize trends with descriptive text (increasing, stable, declining)

**BEHAVIORAL RULES FOR MOOD TRACKER:**
- NEVER use mood data from chat history - ONLY from the JSON above
- ALWAYS verify timestamps before responding about recent/latest moods
- **CRITICAL: If JSON has mood entries, NEVER say "You haven't logged your mood entries yet" - acknowledge what exists**
- If insufficient data for complex analysis, explain what's needed and summarize available data
- Calculate statistics accurately based on actual data
- Be empathetic and supportive when discussing emotions
- Encourage consistent mood tracking for better insights
- Recommend professional help if severe or dangerous patterns are detected
- Format responses clearly with dates, times, and specific details
- Distinguish between "no data" vs "not enough data for this specific analysis"
- Combine insights from both mood tracker AND assessments when both are available

---
`;
};
