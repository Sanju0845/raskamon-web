// backend/seedAssessment.js
import mongoose from "mongoose";
import { Assessment } from "./models/assessmentModel.js";
import "dotenv/config";

// Existing assessments (PHQ-9, GAD-7, PSS)
const phq9Assessment = {
  title: "Depression Screening (PHQ-9)",
  description:
    "A 9-item depression screening tool used to assess the presence and severity of depressive symptoms.",
  questions: [
    {
      text: "Little interest or pleasure in doing things",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Feeling down, depressed, or hopeless",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Trouble falling or staying asleep, or sleeping too much",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Feeling tired or having little energy",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Poor appetite or overeating",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Feeling bad about yourself — or that you're a failure or have let yourself or your family down",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Trouble concentrating on things, such as reading the newspaper or watching television",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
    {
      text: "Thoughts that you would be better off dead or of hurting yourself in some way",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Depression",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 4,
      result: "Minimal depression",
      recommendations: [
        "Your score suggests minimal depression symptoms",
        "Continue to monitor your mood",
        "Practice self-care and maintain healthy habits",
      ],
    },
    {
      minScore: 5,
      maxScore: 9,
      result: "Mild depression",
      recommendations: [
        "Your score suggests mild depression symptoms",
        "Consider talking to a healthcare provider",
        "Practice stress-reduction techniques",
        "Maintain social connections",
      ],
    },
    {
      minScore: 10,
      maxScore: 14,
      result: "Moderate depression",
      recommendations: [
        "Your score suggests moderate depression symptoms",
        "We recommend consulting with a mental health professional",
        "Consider therapy options like CBT",
        "Talk to your doctor about treatment options",
      ],
    },
    {
      minScore: 15,
      maxScore: 19,
      result: "Moderately severe depression",
      recommendations: [
        "Your score suggests moderately severe depression symptoms",
        "Strongly recommend consulting with a mental health professional",
        "Consider therapy and discuss medication options with your doctor",
        "Reach out to friends/family for support",
      ],
    },
    {
      minScore: 20,
      maxScore: 27,
      result: "Severe depression",
      recommendations: [
        "Your score suggests severe depression symptoms",
        "Immediate consultation with a mental health professional is recommended",
        "Contact a healthcare provider or crisis line if having suicidal thoughts",
        "You don't have to go through this alone - help is available",
      ],
    },
  ],
  isActive: true,
};

const gad7Assessment = {
  title: "Anxiety Screening (GAD-7)",
  description:
    "A 7-item anxiety screening tool used to assess generalized anxiety disorder symptoms.",
  questions: [
    {
      text: "Feeling nervous, anxious, or on edge",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Not being able to stop or control worrying",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Worrying too much about different things",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Trouble relaxing",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Being so restless that it's hard to sit still",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Becoming easily annoyed or irritable",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Feeling afraid as if something awful might happen",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 4,
      result: "Minimal anxiety",
      recommendations: [
        "Your score suggests minimal anxiety symptoms",
        "Continue to monitor your feelings",
        "Practice relaxation techniques as needed",
      ],
    },
    {
      minScore: 5,
      maxScore: 9,
      result: "Mild anxiety",
      recommendations: [
        "Your score suggests mild anxiety symptoms",
        "Consider stress management techniques",
        "Mindfulness exercises may be helpful",
        "Monitor if symptoms persist or worsen",
      ],
    },
    {
      minScore: 10,
      maxScore: 14,
      result: "Moderate anxiety",
      recommendations: [
        "Your score suggests moderate anxiety symptoms",
        "Consider consulting with a mental health professional",
        "Cognitive Behavioral Therapy (CBT) can be effective",
        "Practice regular relaxation techniques",
      ],
    },
    {
      minScore: 15,
      maxScore: 21,
      result: "Severe anxiety",
      recommendations: [
        "Your score suggests severe anxiety symptoms",
        "Strongly recommend consulting with a mental health professional",
        "Treatment options including therapy and/or medication may help",
        "Consider stress reduction strategies and self-care",
      ],
    },
  ],
  isActive: true,
};

const pssAssessment = {
  title: "Perceived Stress Scale (PSS)",
  description:
    "A 10-item scale measuring the degree to which situations in one's life are appraised as stressful.",
  questions: [
    {
      text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt nervous and 'stressed'?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
      options: [
        { text: "Very often", value: 0 },
        { text: "Fairly often", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Almost never", value: 3 },
        { text: "Never", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt that things were going your way?",
      options: [
        { text: "Very often", value: 0 },
        { text: "Fairly often", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Almost never", value: 3 },
        { text: "Never", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you been able to control irritations in your life?",
      options: [
        { text: "Very often", value: 0 },
        { text: "Fairly often", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Almost never", value: 3 },
        { text: "Never", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt that you were on top of things?",
      options: [
        { text: "Very often", value: 0 },
        { text: "Fairly often", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Almost never", value: 3 },
        { text: "Never", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you been angered because of things that happened that were outside of your control?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
    {
      text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
      options: [
        { text: "Never", value: 0 },
        { text: "Almost never", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Fairly often", value: 3 },
        { text: "Very often", value: 4 },
      ],
      category: "Stress",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 13,
      result: "Low stress",
      recommendations: [
        "Your score suggests low perceived stress",
        "Continue healthy stress management practices",
        "Maintain good work-life balance",
      ],
    },
    {
      minScore: 14,
      maxScore: 26,
      result: "Moderate stress",
      recommendations: [
        "Your score suggests moderate perceived stress",
        "Consider stress reduction techniques",
        "Mindfulness and relaxation exercises may help",
        "Evaluate work-life balance",
      ],
    },
    {
      minScore: 27,
      maxScore: 40,
      result: "High stress",
      recommendations: [
        "Your score suggests high perceived stress",
        "Recommend stress management strategies",
        "Consider counseling or therapy if stress is affecting daily life",
        "Prioritize self-care and healthy coping mechanisms",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 1: Stress Level Check
const stressAssessment = {
  title: "Stress Level Check",
  description:
    "A 10-item scale assessing perceived stress levels over the past 2 weeks.",
  questions: [
    {
      text: "Feeling overwhelmed or unable to cope with daily tasks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Difficulty concentrating on tasks due to stress?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Feeling irritable or short-tempered?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Experiencing physical symptoms like headaches or muscle tension?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Trouble sleeping due to racing thoughts?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Feeling a sense of dread or constant worry?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Struggling to make decisions due to stress?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Feeling tense or unable to unwind?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Experiencing changes in appetite due to stress?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
    {
      text: "Feeling like stress is impacting your relationships?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Stress",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Minimal stress",
      recommendations: [
        "Stress levels are low",
        "Maintain balance with relaxation techniques like meditation or light exercise",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate stress",
      recommendations: [
        "Stress is noticeable",
        "Try stress-reduction techniques (e.g., yoga, time management)",
        "Reassess in 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Moderate to Severe stress",
      recommendations: [
        "High stress levels detected",
        "Strongly recommend consulting a counselor or therapist for coping strategies",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 2: Burnout Assessment
const burnoutAssessment = {
  title: "Burnout Assessment",
  description:
    "A 10-item scale assessing symptoms of burnout over the past 2 weeks.",
  questions: [
    {
      text: "Feeling emotionally drained from work or responsibilities?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Feeling detached or cynical about your work or daily tasks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Doubting your ability to accomplish tasks effectively?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Feeling unmotivated to start or complete tasks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Experiencing a sense of failure or low self-worth?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Feeling disconnected from your work or purpose?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Struggling to find joy in tasks you once enjoyed?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Feeling physically exhausted even after rest?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Avoiding responsibilities or procrastinating more than usual?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
    {
      text: "Feeling like your efforts go unnoticed or unappreciated?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Burnout",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Minimal burnout risk",
      recommendations: [
        "Burnout risk is low",
        "Continue setting boundaries and practicing self-care",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate burnout",
      recommendations: [
        "Early signs of burnout",
        "Prioritize rest, delegate tasks",
        "Consider professional support if no improvement",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Moderate to Severe burnout",
      recommendations: [
        "Strong signs of burnout",
        "Seek professional guidance from a therapist or coach",
        "Address workload and emotional health",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 3: Social Anxiety Check
const socialAnxietyAssessment = {
  title: "Social Anxiety Check",
  description:
    "A 10-item scale assessing social anxiety symptoms over the past 2 weeks.",
  questions: [
    {
      text: "Feeling nervous or afraid in social situations?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Avoiding social events or interactions due to fear of judgment?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Experiencing physical symptoms (e.g., sweating, trembling) in social settings?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Worrying excessively about what others think of you?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Feeling self-conscious or embarrassed during conversations?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Dreading public speaking or being the center of attention?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Feeling isolated due to avoiding social interactions?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Overthinking past social interactions?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Feeling anxious about upcoming social events?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
    {
      text: "Struggling to initiate or maintain conversations?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Social Anxiety",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Minimal social anxiety",
      recommendations: [
        "Social anxiety is minimal",
        "Practice small social interactions to build confidence",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate social anxiety",
      recommendations: [
        "Social anxiety is noticeable",
        "Try exposure techniques or mindfulness apps",
        "Monitor for 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Moderate to Severe social anxiety",
      recommendations: [
        "Significant social anxiety detected",
        "Consult a therapist for strategies like cognitive-behavioral therapy (CBT)",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 4: General Well-Being Check
const wellbeingAssessment = {
  title: "General Well-Being Check",
  description:
    "A 10-item scale assessing overall well-being and life satisfaction.",
  questions: [
    {
      text: "Feeling satisfied with your life or daily activities?",
      options: [
        { text: "Nearly every day", value: 0 },
        { text: "More than half the days", value: 1 },
        { text: "Several days", value: 2 },
        { text: "Not at all", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Struggling to find meaning or purpose in your routine?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Feeling disconnected from friends or family?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Experiencing low mood or lack of enthusiasm?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Feeling unable to enjoy hobbies or leisure activities?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Feeling a lack of energy for daily tasks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Struggling to feel hopeful about the future?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Feeling lonely even when around others?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Experiencing difficulty staying motivated?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
    {
      text: "Feeling like life is unbalanced or unfulfilling?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Well-being",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Stable well-being",
      recommendations: [
        "Your well-being seems stable",
        "Continue nurturing relationships and hobbies",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate challenges",
      recommendations: [
        "Some challenges to well-being",
        "Try reconnecting with loved ones or exploring new activities",
        "Reassess in 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Significant well-being issues",
      recommendations: [
        "Well-being is significantly impacted",
        "Seek professional support to explore underlying causes and solutions",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 5: Sleep Quality Assessment
const sleepAssessment = {
  title: "Sleep Quality Assessment",
  description:
    "A 10-item scale assessing sleep quality and disturbances over the past 2 weeks.",
  questions: [
    {
      text: "Difficulty falling asleep at night?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Waking up during the night and struggling to fall back asleep?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Feeling unrested or groggy upon waking?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Experiencing daytime fatigue due to poor sleep?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Having nightmares or disruptive dreams?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Feeling anxious about sleep or bedtime?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Waking up too early and unable to return to sleep?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Experiencing irregular sleep patterns?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Relying on sleep aids or substances to fall asleep?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
    {
      text: "Feeling that poor sleep affects your mood or productivity?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Sleep",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Good sleep quality",
      recommendations: [
        "Sleep quality is generally good",
        "Maintain a consistent sleep routine",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate sleep issues",
      recommendations: [
        "Sleep issues are present",
        "Try sleep hygiene practices (e.g., limiting screen time, relaxation techniques)",
        "Reassess in 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Severe sleep problems",
      recommendations: [
        "Significant sleep problems detected",
        "Consult a doctor or sleep specialist for further evaluation",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 6: Emotional Resilience Check
const resilienceAssessment = {
  title: "Emotional Resilience Check",
  description:
    "A 10-item scale assessing ability to cope with challenges and bounce back from setbacks.",
  questions: [
    {
      text: "Feeling unable to bounce back from setbacks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Struggling to stay positive during challenges?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Feeling overwhelmed by unexpected changes?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Difficulty finding solutions to problems?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Feeling emotionally fragile or easily upset?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Losing confidence in your ability to handle stress?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Feeling stuck or unable to move forward after setbacks?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Struggling to stay calm under pressure?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Feeling that challenges are insurmountable?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
    {
      text: "Lacking support to cope with difficulties?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Resilience",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Strong resilience",
      recommendations: [
        "Emotional resilience is strong",
        "Continue building coping skills through mindfulness or journaling",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Moderate resilience challenges",
      recommendations: [
        "Resilience is being tested",
        "Practice stress management and seek support from friends or self-help resources",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Low resilience",
      recommendations: [
        "Resilience is low",
        "Consult a therapist to develop strategies for emotional strength and coping",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 7: Self-Esteem Assessment
const selfEsteemAssessment = {
  title: "Self-Esteem Assessment",
  description:
    "A 10-item scale assessing self-esteem and self-worth over the past 2 weeks.",
  questions: [
    {
      text: "Feeling critical of yourself or your abilities?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Comparing yourself negatively to others?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Feeling unworthy of praise or success?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Struggling to accept compliments or positive feedback?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Feeling like you're not good enough?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Doubting your worth in relationships or work?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Feeling like you don't deserve happiness?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Avoiding opportunities due to fear of failure?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Feeling inferior to others in social or professional settings?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
    {
      text: "Struggling to feel proud of your accomplishments?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Self-Esteem",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Healthy self-esteem",
      recommendations: [
        "Self-esteem is healthy",
        "Continue practicing self-compassion and positive affirmations",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Wavering self-esteem",
      recommendations: [
        "Self-esteem is wavering",
        "Try self-help strategies like journaling or gratitude exercises",
        "Reassess in 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Low self-esteem",
      recommendations: [
        "Low self-esteem detected",
        "Seek professional support to address underlying causes and build confidence",
      ],
    },
  ],
  isActive: true,
};

// New Assessment 8: Coping with Change Assessment
const changeAssessment = {
  title: "Coping with Change Assessment",
  description:
    "A 10-item scale assessing ability to adapt to and cope with life changes.",
  questions: [
    {
      text: "Feeling anxious about recent or upcoming changes?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Struggling to adapt to new routines or environments?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Feeling resistant to changes in plans or expectations?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Experiencing stress due to uncertainty about the future?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Feeling a lack of control over life changes?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Avoiding decisions related to changes?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Feeling overwhelmed by transitions in work or personal life?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Struggling to find positives in new situations?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Experiencing physical tension due to change-related stress?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
    {
      text: "Feeling stuck or unable to embrace new opportunities?",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Change Adaptation",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 8,
      result: "Adapting well to change",
      recommendations: [
        "You're adapting well to change",
        "Continue using proactive coping strategies like planning or mindfulness",
      ],
    },
    {
      minScore: 9,
      maxScore: 18,
      result: "Mild to Moderate difficulty with change",
      recommendations: [
        "Change is causing some difficulty",
        "Try flexibility exercises or talking to a trusted friend",
        "Reassess in 2 weeks",
      ],
    },
    {
      minScore: 19,
      maxScore: 30,
      result: "Significant challenges with change",
      recommendations: [
        "Significant challenges with change",
        "Consult a therapist for support in building adaptability and resilience",
      ],
    },
  ],
  isActive: true,
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const assessments = [
      phq9Assessment,
      gad7Assessment,
      pssAssessment,
      stressAssessment,
      burnoutAssessment,
      socialAnxietyAssessment,
      wellbeingAssessment,
      sleepAssessment,
      resilienceAssessment,
      selfEsteemAssessment,
      changeAssessment,
    ];

    for (const assessment of assessments) {
      // Check if the assessment has required fields
      if (!assessment.title || !assessment.description) {
        console.error(
          `Missing required fields in assessment: ${
            assessment.title || "Untitled"
          }`
        );
        continue; // Skip invalid assessments
      }
      const existing = await Assessment.findOne({ title: assessment.title });
      if (!existing) {
        await Assessment.create(assessment); // Use .create() instead of new + save
        console.log(`✅ Seeded: ${assessment.title}`);
      } else {
        console.log(`⏩ Already exists: ${assessment.title}`);
      }
    }
    console.log("✅ Database seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

seedDatabase();
