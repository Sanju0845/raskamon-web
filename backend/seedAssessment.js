// backend/seedAssessment.js
import mongoose from "mongoose";
import { Assessment } from "./models/assessmentModel.js";
import "dotenv/config";

// Helper: remove duplicate questions by text (case-insensitive, trimmed)
function dedupeQuestionsByText(questions = []) {
  const seen = new Set();
  const unique = [];
  for (const q of questions) {
    const key = (q.text || "").trim().toLowerCase();
    if (!key) continue;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }
  return unique;
}

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
  therapyType: "individual",
};

const gad7Assessment = {
  title: "Anxiety Screening (GAD-7)",
  therapyType: "individual",
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
  therapyType: "individual",
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

const gad10Assessment = {
  title: "Generalized Anxiety Disorder (GAD-10)",
  description:
    "An extended 10-item screening tool to measure the severity of generalized anxiety symptoms over the last two weeks.",
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
      text: "Being so restless that it is hard to sit still",
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
    // --- New questions added to get to 10 ---
    {
      text: "Experiencing dizziness, heart palpitations, or shortness of breath due to anxiety",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Physical Anxiety",
    },
    {
      text: "Avoiding situations or activities due to anxiety or worry",
      options: [
        { text: "Not at all", value: 0 },
        { text: "Several days", value: 1 },
        { text: "More than half the days", value: 2 },
        { text: "Nearly every day", value: 3 },
      ],
      category: "Anxiety",
    },
    {
      text: "Difficulty falling or staying asleep because of worrying",
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
      maxScore: 5,
      result: "Minimal anxiety",
      recommendations: [
        "Your score suggests minimal anxiety symptoms.",
        "Continue practices that support your mental well-being.",
      ],
    },
    {
      minScore: 6,
      maxScore: 10,
      result: "Mild anxiety",
      recommendations: [
        "Your score suggests mild anxiety symptoms.",
        "Mindfulness and stress-management techniques may be helpful.",
      ],
    },
    {
      minScore: 11,
      maxScore: 15,
      result: "Moderate anxiety",
      recommendations: [
        "Your score suggests moderate anxiety symptoms.",
        "Consider speaking with a healthcare or mental health professional.",
        "Therapies like CBT can be very effective for managing anxiety.",
      ],
    },
    {
      minScore: 16,
      maxScore: 30,
      result: "Severe anxiety",
      recommendations: [
        "Your score suggests severe anxiety symptoms.",
        "It is highly recommended to consult with a mental health professional for assessment and support.",
        "You can explore various treatment options, including therapy and lifestyle changes.",
      ],
    },
  ],
  isActive: true,
  therapyType: "individual",
};
const workplaceBurnoutAssessment = {
  title: "Workplace Burnout Assessment",
  description:
    "A 10-item tool to assess feelings of exhaustion, cynicism, and reduced efficacy related to one's job.",
  questions: [
    {
      text: "I feel emotionally drained from my work.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Exhaustion",
    },
    {
      text: "I feel tired when I get up in the morning and have to face another day at work.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Exhaustion",
    },
    {
      text: "Working all day is a strain for me.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Exhaustion",
    },
    {
      text: "I have become more cynical about whether my work contributes anything meaningful.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Cynicism",
    },
    {
      text: "I doubt the significance of my work.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Cynicism",
    },
    {
      text: "I feel I am making a positive difference at my job. (Reverse-scored)",
      options: [
        { text: "Never", value: 4 }, // Reverse score
        { text: "Rarely", value: 3 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 1 },
        { text: "Always", value: 0 },
      ],
      category: "Efficacy",
    },
    {
      text: "I can effectively solve the problems that arise in my work. (Reverse-scored)",
      options: [
        { text: "Never", value: 4 }, // Reverse score
        { text: "Rarely", value: 3 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 1 },
        { text: "Always", value: 0 },
      ],
      category: "Efficacy",
    },
    // --- New questions added to get to 10 ---
    {
      text: "I feel frustrated by my job.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Cynicism",
    },
    {
      text: "I feel my workload is unmanageable.",
      options: [
        { text: "Never", value: 0 },
        { text: "Rarely", value: 1 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 3 },
        { text: "Always", value: 4 },
      ],
      category: "Exhaustion",
    },
    {
      text: "I have energy for my hobbies and personal life after work. (Reverse-scored)",
      options: [
        { text: "Never", value: 4 }, // Reverse score
        { text: "Rarely", value: 3 },
        { text: "Sometimes", value: 2 },
        { text: "Often", value: 1 },
        { text: "Always", value: 0 },
      ],
      category: "Exhaustion",
    },
  ],
  scoringRanges: [
    {
      minScore: 0,
      maxScore: 15,
      result: "Low risk of burnout",
      recommendations: [
        "Your score indicates a low risk of burnout.",
        "Continue to maintain a healthy work-life balance.",
      ],
    },
    {
      minScore: 16,
      maxScore: 25,
      result: "Moderate risk of burnout",
      recommendations: [
        "You are showing some signs of burnout.",
        "Consider setting stronger work boundaries and prioritizing self-care.",
        "Make time for activities you enjoy outside of work.",
      ],
    },
    {
      minScore: 26,
      maxScore: 35,
      result: "High risk of burnout",
      recommendations: [
        "Your score indicates a high risk of burnout.",
        "It is important to take proactive steps to address this.",
        "Discuss workload with your manager, if possible.",
        "Consider seeking support from a coach or therapist.",
      ],
    },
    {
      minScore: 36,
      maxScore: 40,
      result: "Severe risk of burnout",
      recommendations: [
        "Your score suggests you are experiencing severe symptoms of burnout.",
        "Taking action is crucial for your mental and physical health.",
        "Strongly recommend seeking professional support to develop a recovery plan.",
        "Explore options for time off or changes to your work responsibilities.",
      ],
    },
  ],
  isActive: true,
  therapyType: "individual",
};
// New Assessment 1: Stress Level Check
const stressAssessment = {
  title: "Stress Level Check",
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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
  therapyType: "individual",
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

// ---------- FAMILY THERAPY ASSESSMENTS (14 tests, 10 questions each) ----------

const FAMILY_OPTION_LABELS = [
  "Never / Not at all",
  "Rarely / Somewhat",
  "Sometimes / Mostly",
  "Often / Completely / Very well",
];

function makeOptions(reverse = false) {
  return FAMILY_OPTION_LABELS.map((text, index) => ({
    text,
    value: reverse ? 3 - index : index,
  }));
}

function buildFamilyAssessment({ title, description, questions, category }) {
  return {
    title,
    description,
    therapyType: "family",
    questions: questions.map((q) => ({
      text: q.text,
      options: makeOptions(!!q.reverse),
      category,
    })),
    scoringRanges: [
      {
        minScore: 24,
        maxScore: 30,
        result: "High Harmony",
        recommendations: [
          "Strong dynamics; maintain with periodic family check-ins",
          "Continue open communication and shared activities",
        ],
      },
      {
        minScore: 16,
        maxScore: 23,
        result: "Moderate Harmony",
        recommendations: [
          "Solid functioning with some challenges",
          "Use self-help strategies and reassess in 2–4 weeks",
        ],
      },
      {
        minScore: 8,
        maxScore: 15,
        result: "Areas of Concern",
        recommendations: [
          "Notable issues present; consider family therapy",
          "Focus on structured dialogues and role clarity",
        ],
      },
      {
        minScore: 0,
        maxScore: 7,
        result: "Significant Challenges",
        recommendations: [
          "Urgent need for professional intervention",
          "Prioritize safety, emotional support, and conflict mediation",
        ],
      },
    ],
    isActive: true,
  };
}

const familyAssessments = [
  buildFamilyAssessment({
    title: "Family Communication Clarity",
    description:
      "Assesses clarity and effectiveness of communication within Indian families where hierarchy and respect influence dialogue.",
    category: "Family Communication",
    questions: [
      {
        text: "Do family members express their thoughts clearly during discussions?",
      },
      {
        text: "Are you comfortable asking for clarification when you don’t understand someone?",
      },
      {
        text: "Do family members avoid interrupting each other when speaking?",
      },
      { text: "Are sensitive topics discussed openly without avoidance?" },
      {
        text: "Do you feel your opinions are valued during family conversations?",
      },
      {
        text: "Are non-verbal cues (e.g., tone, body language) generally positive during talks?",
      },
      {
        text: "Do family members avoid misunderstandings by confirming what was said?",
      },
      {
        text: "Are family meetings or discussions held regularly to address issues?",
      },
      { text: "Do you feel heard when sharing concerns with family?" },
      {
        text: "Are cultural or generational differences respected during communication?",
      },
    ],
  }),
  buildFamilyAssessment({
    title: "Emotional Support Network",
    description:
      "Evaluates the emotional support system where family is a primary support structure.",
    category: "Emotional Support",
    questions: [
      {
        text: "Do you feel emotionally supported by your family during tough times?",
      },
      {
        text: "Can you rely on family members to listen when you’re stressed?",
      },
      {
        text: "Do family members offer encouragement during personal challenges?",
      },
      { text: "Are you comfortable sharing vulnerabilities with your family?" },
      { text: "Do family members check in on your emotional well-being?" },
      {
        text: "Is emotional support consistent across generations (e.g., parents, elders)?",
      },
      { text: "Do you feel your emotions are validated by family members?" },
      {
        text: "Are family members empathetic when you share personal struggles?",
      },
      {
        text: "Do you feel supported in pursuing personal goals (e.g., career, education)?",
      },
      { text: "Is emotional support free of judgment or criticism?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Role and Responsibility Balance",
    description:
      "Measures fairness in sharing responsibilities in joint families where roles may be rigid.",
    category: "Roles & Responsibilities",
    questions: [
      { text: "Are household chores shared fairly among family members?" },
      {
        text: "Do family members take responsibility for their assigned tasks?",
      },
      { text: "Are financial responsibilities distributed equitably?" },
      {
        text: "Do you feel your contributions to family duties are appreciated?",
      },
      {
        text: "Are caregiving roles (e.g., for children or elders) shared fairly?",
      },
      { text: "Do family members discuss role expectations openly?" },
      {
        text: "Are traditional gender roles respected without causing imbalance?",
      },
      {
        text: "Do you feel overburdened by family responsibilities?",
        reverse: true,
      },
      {
        text: "Are younger family members given age-appropriate responsibilities?",
      },
      {
        text: "Do family members adjust roles during stressful times (e.g., illness)?",
      },
    ],
  }),
  buildFamilyAssessment({
    title: "Conflict Resolution Effectiveness",
    description:
      "Assesses how well conflicts are resolved without lingering resentment, key for family harmony.",
    category: "Conflict Resolution",
    questions: [
      { text: "Does your family resolve conflicts without lasting grudges?" },
      { text: "Are disagreements addressed calmly and respectfully?" },
      { text: "Do family members apologize when they’ve upset someone?" },
      {
        text: "Are conflicts resolved through compromise rather than dominance?",
      },
      {
        text: "Do family members avoid bringing up past disputes during arguments?",
      },
      { text: "Are solutions to conflicts fair to all involved?" },
      { text: "Do you feel safe addressing conflicts directly with family?" },
      {
        text: "Are cultural expectations (e.g., respect for elders) balanced during conflicts?",
      },
      {
        text: "Do family members avoid passive-aggressive behavior after disputes?",
      },
      { text: "Are conflicts resolved quickly to maintain family peace?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Trust and Transparency",
    description: "Evaluates trust levels and transparency across generations.",
    category: "Trust & Transparency",
    questions: [
      { text: "Do you trust family members to keep your confidences?" },
      {
        text: "Are family members honest about their feelings and intentions?",
      },
      { text: "Do you feel safe sharing personal secrets with family?" },
      {
        text: "Are financial matters discussed transparently within the family?",
      },
      { text: "Do family members avoid hiding important information?" },
      { text: "Is there mutual trust in decision-making processes?" },
      { text: "Do you feel family members act in the family’s best interest?" },
      { text: "Are promises or commitments generally kept by family members?" },
      { text: "Do family members avoid gossiping about each other?" },
      {
        text: "Is trust consistent across generations (e.g., parents, children)?",
      },
    ],
  }),
  buildFamilyAssessment({
    title: "Family Cohesion and Bonding",
    description:
      "Measures time spent together and unity, reflecting cultural emphasis on family bonding.",
    category: "Cohesion & Bonding",
    questions: [
      {
        text: "Do family members spend quality time together (e.g., meals, activities)?",
      },
      { text: "Are shared activities (e.g., festivals, outings) prioritized?" },
      {
        text: "Do family members enjoy each other’s company during gatherings?",
      },
      { text: "Are traditions or rituals celebrated together regularly?" },
      { text: "Do you feel a sense of belonging within your family?" },
      {
        text: "Are younger and older generations included in family activities?",
      },
      {
        text: "Do family members make time for casual interactions (e.g., chats)?",
      },
      { text: "Are family gatherings free of tension or conflict?" },
      { text: "Do you feel connected to your family’s values and culture?" },
      {
        text: "Are efforts made to include distant family members (e.g., via calls)?",
      },
    ],
  }),
  buildFamilyAssessment({
    title: "Adaptability to Change",
    description:
      "Assesses resilience to external changes such as economic and social pressures.",
    category: "Adaptability",
    questions: [
      { text: "Does your family adapt well to financial challenges?" },
      {
        text: "Are family members supportive during major changes (e.g., relocation)?",
      },
      { text: "Do you feel your family handles unexpected events calmly?" },
      { text: "Are family roles adjusted flexibly during crises?" },
      { text: "Does your family discuss strategies to cope with change?" },
      {
        text: "Are younger members supported during transitions (e.g., exams, jobs)?",
      },
      { text: "Do family members remain united during stressful times?" },
      {
        text: "Are external changes (e.g., societal pressures) managed effectively?",
      },
      { text: "Does your family learn from past challenges to improve?" },
      { text: "Is there optimism about overcoming future challenges?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Emotional Safety",
    description:
      "Evaluates whether members feel secure expressing emotions, vital for mental health.",
    category: "Emotional Safety",
    questions: [
      { text: "Do you feel safe expressing your emotions within your family?" },
      { text: "Are your feelings respected without judgment?" },
      { text: "Can you share fears or anxieties without fear of criticism?" },
      { text: "Do family members avoid belittling each other’s emotions?" },
      { text: "Is it safe to express disagreement without retaliation?" },
      { text: "Are emotional boundaries respected within the family?" },
      { text: "Do you feel comfortable being vulnerable with family members?" },
      { text: "Are sensitive topics (e.g., mental health) discussed openly?" },
      { text: "Do family members offer comfort during emotional distress?" },
      { text: "Is emotional expression encouraged across generations?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Parenting and Caregiving Dynamics",
    description:
      "Assesses parenting and caregiving roles, significant in multigenerational caregiving.",
    category: "Parenting & Caregiving",
    questions: [
      {
        text: "Are parenting responsibilities shared fairly among caregivers?",
      },
      { text: "Do caregivers communicate openly about parenting decisions?" },
      { text: "Are children’s emotional needs prioritized by caregivers?" },
      { text: "Do caregivers avoid favoritism among children?" },
      { text: "Are caregiving roles for elders shared equitably?" },
      { text: "Do caregivers support each other during parenting challenges?" },
      { text: "Are discipline methods consistent and fair?" },
      { text: "Do children feel supported in their personal growth?" },
      { text: "Are caregiving expectations discussed openly?" },
      { text: "Do caregivers balance their own needs with family duties?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Financial Collaboration",
    description:
      "Measures cooperation in financial matters where finances are often shared.",
    category: "Financial Collaboration",
    questions: [
      { text: "Are financial decisions made collaboratively in the family?" },
      { text: "Do family members discuss budgets openly?" },
      { text: "Are financial responsibilities shared based on ability?" },
      { text: "Do you feel supported during personal financial stress?" },
      { text: "Are financial goals (e.g., savings, investments) aligned?" },
      { text: "Do family members avoid secrecy about money matters?" },
      { text: "Are financial disputes resolved fairly?" },
      { text: "Do you feel comfortable discussing financial concerns?" },
      { text: "Are younger members educated about family finances?" },
      { text: "Is financial planning inclusive of all generations?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Respect for Individuality",
    description:
      "Evaluates respect for personal autonomy while balancing tradition and individuality.",
    category: "Individuality & Autonomy",
    questions: [
      { text: "Are individual choices (e.g., career, hobbies) respected?" },
      {
        text: "Do family members avoid imposing their expectations on others?",
      },
      { text: "Are personal boundaries respected within the family?" },
      { text: "Do you feel free to pursue your own interests?" },
      { text: "Are differing opinions valued during family discussions?" },
      { text: "Do family members support each other’s personal goals?" },
      { text: "Are cultural or generational differences respected?" },
      { text: "Do you feel accepted for who you are within the family?" },
      { text: "Are personal achievements celebrated by the family?" },
      { text: "Is individuality encouraged without judgment?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Cultural and Traditional Alignment",
    description:
      "Assesses alignment with cultural values and traditions central to many families.",
    category: "Culture & Tradition",
    questions: [
      {
        text: "Are family traditions (e.g., festivals, rituals) celebrated together?",
      },
      {
        text: "Do family members respect cultural expectations (e.g., respect for elders)?",
      },
      {
        text: "Are traditional values discussed openly with younger generations?",
      },
      { text: "Do you feel connected to your family’s cultural heritage?" },
      { text: "Are conflicts about traditions resolved respectfully?" },
      { text: "Do family members balance modernity with cultural values?" },
      { text: "Are cultural practices inclusive of all family members?" },
      { text: "Do you feel proud of your family’s cultural identity?" },
      {
        text: "Are traditional roles (e.g., gender, age) respected without rigidity?",
      },
      { text: "Do family members participate willingly in cultural events?" },
    ],
  }),
  buildFamilyAssessment({
    title: "External Stress Impact",
    description:
      "Gauges how external stressors (e.g., societal pressures, work) affect family dynamics.",
    category: "External Stress",
    questions: [
      {
        text: "Do work-related stresses negatively impact family interactions?",
        reverse: true,
      },
      {
        text: "Are financial pressures managed without harming family bonds?",
        reverse: true,
      },
      {
        text: "Do societal expectations (e.g., marriage, career) cause family tension?",
        reverse: true,
      },
      {
        text: "Does the family support each other during external challenges?",
      },
      { text: "Are external stressors discussed openly within the family?" },
      {
        text: "Do family members avoid blaming each other for external issues?",
      },
      { text: "Is the family resilient against societal judgments?" },
      {
        text: "Do external pressures disrupt family routines (e.g., meals)?",
        reverse: true,
      },
      { text: "Are coping strategies shared to handle external stress?" },
      { text: "Does the family remain united despite external challenges?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Intergenerational Harmony",
    description:
      "Assesses relationships across generations in joint family contexts.",
    category: "Intergenerational Harmony",
    questions: [
      { text: "Do younger and older generations communicate openly?" },
      { text: "Are generational differences respected within the family?" },
      { text: "Do elders feel valued by younger family members?" },
      { text: "Are younger members supported by elders in their goals?" },
      {
        text: "Do family members avoid generational conflicts (e.g., tradition vs. modernity)?",
      },
      { text: "Are caregiving responsibilities for elders shared fairly?" },
      { text: "Do younger members feel heard by older generations?" },
      { text: "Are family decisions inclusive of all generations?" },
      {
        text: "Do intergenerational activities (e.g., storytelling) strengthen bonds?",
      },
      { text: "Is respect mutual across generations?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Problem-Solving and Decision Making",
    description:
      "Assesses collaborative problem-solving and inclusivity in decisions.",
    category: "Problem Solving",
    questions: [
      {
        text: "Are family problems discussed with input from all stakeholders?",
      },
      { text: "Are decisions made after considering multiple viewpoints?" },
      { text: "Do members feel decisions are fair and transparent?" },
      { text: "Are disagreements about decisions addressed respectfully?" },
      { text: "Do elders and youth both contribute to solutions?" },
      { text: "Is there follow-up to see if decisions worked well?" },
      { text: "Are urgent decisions made calmly and efficiently?" },
      { text: "Do members accept outcomes even when not their preference?" },
      { text: "Are learnings from past decisions applied to new ones?" },
      { text: "Is decision-making free from coercion or guilt?" },
    ],
  }),
  buildFamilyAssessment({
    title: "Boundaries and Privacy",
    description:
      "Evaluates respect for personal space and privacy within families.",
    category: "Boundaries & Privacy",
    questions: [
      { text: "Are personal boundaries communicated and respected?" },
      { text: "Is privacy (e.g., room, phone) generally respected?" },
      {
        text: "Do members ask consent before involving others in personal matters?",
      },
      { text: "Are private conversations kept confidential?" },
      { text: "Do parents balance guidance with adolescents’ privacy needs?" },
      { text: "Do elders’ preferences for privacy get honored?" },
      { text: "Are visitors/relatives respectful of household privacy norms?" },
      { text: "Are boundary violations acknowledged and corrected?" },
      { text: "Do members feel safe setting new boundaries when needed?" },
      { text: "Is there a culture of asking rather than assuming?" },
    ],
  }),
];

// ---------- CHILD THERAPY ASSESSMENTS: Child Stress Check (14 Days) ----------

function buildChildAssessment({ title, description, questions, category }) {
  return {
    title,
    description,
    therapyType: "child",
    questions: questions.map((q) => ({
      text: q.text,
      options: makeOptions(!!q.reverse),
      category,
    })),
    scoringRanges: [
      {
        minScore: 24,
        maxScore: 30,
        result: "High Harmony",
        recommendations: [
          "Strong dynamics; maintain with periodic check-ins",
          "Reinforce healthy routines and coping skills",
        ],
      },
      {
        minScore: 16,
        maxScore: 23,
        result: "Moderate Harmony",
        recommendations: [
          "Functional with some stressors",
          "Use self-help strategies; reassess in 2–4 weeks",
        ],
      },
      {
        minScore: 8,
        maxScore: 15,
        result: "Areas of Concern",
        recommendations: [
          "Notable stress; consider child-focused therapy",
          "Strengthen support across home and school",
        ],
      },
      {
        minScore: 0,
        maxScore: 7,
        result: "Significant Challenges",
        recommendations: [
          "Urgent need for professional intervention",
          "Prioritize safety, predictable routines, and emotional support",
        ],
      },
    ],
    isActive: true,
  };
}

const childAssessments = [
  buildChildAssessment({
    title: "Child Stress Check Day 1: Academic Stress",
    description:
      "Assesses stress from school performance within education-centric contexts.",
    category: "Academic Stress",
    questions: [
      {
        text: "Does the child seem stressed about schoolwork or exams?",
        reverse: true,
      },
      { text: "Does the child feel confident in handling academic tasks?" },
      {
        text: "Is the child able to complete homework without excessive worry?",
      },
      {
        text: "Does the child compare their grades with peers frequently?",
        reverse: true,
      },
      { text: "Does the child enjoy learning or school activities?" },
      { text: "Are academic pressures discussed calmly with you?" },
      {
        text: "Does the child avoid school tasks due to stress?",
        reverse: true,
      },
      { text: "Is the child supported in managing academic expectations?" },
      {
        text: "Does the child feel overwhelmed by teacher expectations?",
        reverse: true,
      },
      { text: "Does the child balance schoolwork with relaxation?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 2: Emotional Regulation",
    description:
      "Evaluates ability to manage emotions under stress, key for resilience.",
    category: "Emotional Regulation",
    questions: [
      {
        text: "Does the child manage big emotions (e.g., anger, sadness) healthily?",
      },
      {
        text: "Does the child get upset or angry easily when stressed?",
        reverse: true,
      },
      { text: "Can the child calm down after an emotional outburst?" },
      {
        text: "Does the child express emotions verbally instead of acting out?",
      },
      { text: "Are emotional reactions proportionate to the situation?" },
      { text: "Does the child seek help when feeling overwhelmed?" },
      {
        text: "Are stressful events followed by prolonged mood changes?",
        reverse: true,
      },
      {
        text: "Does the child use coping strategies (e.g., talking, drawing)?",
      },
      { text: "Is the child comfortable sharing stressful feelings?" },
      { text: "Does the child recover quickly from emotional stress?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 3: Social Interactions",
    description:
      "Measures stress from peer dynamics common in school settings.",
    category: "Social Interactions",
    questions: [
      { text: "Does the child interact well with friends without stress?" },
      {
        text: "Does the child worry about fitting in with peers?",
        reverse: true,
      },
      { text: "Are friendships a source of support rather than stress?" },
      {
        text: "Does the child feel confident in social settings (e.g., school)?",
      },
      {
        text: "Does the child experience bullying or peer conflicts?",
        reverse: true,
      },
      { text: "Is the child comfortable expressing themselves with friends?" },
      {
        text: "Do social pressures (e.g., popularity) cause anxiety?",
        reverse: true,
      },
      { text: "Does the child enjoy group activities or playtime?" },
      { text: "Are peer conflicts resolved without lasting distress?" },
      { text: "Does the child feel accepted by their social circle?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 4: Family Dynamics",
    description:
      "Assesses stress from family interactions within family-oriented cultures.",
    category: "Family Dynamics",
    questions: [
      { text: "Does the child seem relaxed during family interactions?" },
      {
        text: "Do family conflicts (e.g., arguments) stress the child?",
        reverse: true,
      },
      { text: "Does the child feel supported by family members?" },
      {
        text: "Are family expectations (e.g., behavior) overwhelming?",
        reverse: true,
      },
      { text: "Does the child feel safe expressing stress to family?" },
      { text: "Are family changes (e.g., new sibling) handled calmly?" },
      { text: "Does the child enjoy family activities (e.g., meals)?" },
      {
        text: "Do parental disagreements cause visible stress?",
        reverse: true,
      },
      { text: "Is the child included in family discussions about stress?" },
      { text: "Does the child feel emotionally secure at home?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 5: Sleep Quality",
    description:
      "Evaluates stress impacting sleep, a key indicator of mental health.",
    category: "Sleep Quality",
    questions: [
      {
        text: "Does the child have trouble sleeping due to stress?",
        reverse: true,
      },
      { text: "Does the child wake up feeling rested and energetic?" },
      { text: "Are the child’s sleep patterns consistent despite stress?" },
      {
        text: "Does the child complain of sleep issues when stressed?",
        reverse: true,
      },
      { text: "Does the child follow a calming bedtime routine?" },
      {
        text: "Are sleep disturbances linked to specific stressors (e.g., exams)?",
        reverse: true,
      },
      {
        text: "Does the child nap excessively due to stress-related fatigue?",
        reverse: true,
      },
      { text: "Is the child’s sleep environment calm and supportive?" },
      { text: "Does the child report feeling refreshed after sleep?" },
      { text: "Are sleep issues discussed openly with you?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 6: Physical Well-Being",
    description:
      "Assesses stress-related physical symptoms reflecting overall health.",
    category: "Physical Well-Being",
    questions: [
      {
        text: "Does the child complain of headaches or stomachaches when stressed?",
        reverse: true,
      },
      { text: "Does the child maintain a healthy appetite under stress?" },
      {
        text: "Is the child physically active (e.g., play, sports) regularly?",
      },
      {
        text: "Do stressful days lead to fatigue or low energy?",
        reverse: true,
      },
      { text: "Does the child seem physically healthy despite stress?" },
      { text: "Are physical symptoms discussed with you or a doctor?" },
      {
        text: "Does the child avoid activities due to physical discomfort?",
        reverse: true,
      },
      { text: "Is the child’s energy level consistent most days?" },
      {
        text: "Does stress affect the child’s posture or body language?",
        reverse: true,
      },
      { text: "Does the child receive support for physical health needs?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 7: Focus and Concentration",
    description: "Measures stress impacting attention and task completion.",
    category: "Focus & Concentration",
    questions: [
      {
        text: "Can the child focus on tasks (e.g., homework) without distraction?",
      },
      {
        text: "Does stress cause the child to lose focus easily?",
        reverse: true,
      },
      { text: "Is the child able to complete tasks without frustration?" },
      { text: "Does the child stay engaged in activities they enjoy?" },
      { text: "Are distractions linked to stressful thoughts?", reverse: true },
      { text: "Does the child organize tasks effectively under pressure?" },
      { text: "Is the child able to follow instructions during stress?" },
      { text: "Does the child show interest in learning despite stress?" },
      { text: "Are concentration issues discussed openly?" },
      { text: "Does the child recover focus after stressful events?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 8: Self-Esteem",
    description: "Evaluates stress affecting self-worth and confidence.",
    category: "Self-Esteem",
    questions: [
      {
        text: "Does the child seem confident in their abilities (e.g., school)?",
      },
      {
        text: "Does the child feel discouraged by failures or setbacks?",
        reverse: true,
      },
      { text: "Is the child proud of their achievements, big or small?" },
      {
        text: "Does the child compare themselves negatively to others?",
        reverse: true,
      },
      { text: "Are the child’s efforts praised by family or teachers?" },
      {
        text: "Does the child express self-doubt when stressed?",
        reverse: true,
      },
      { text: "Is the child comfortable trying new activities?" },
      { text: "Does the child feel valued by peers or family?" },
      { text: "Are stressful events met with a positive self-image?" },
      {
        text: "Does the child believe in their ability to overcome challenges?",
      },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 9: Coping Strategies",
    description:
      "Assesses methods for handling stress useful for interventions.",
    category: "Coping Strategies",
    questions: [
      {
        text: "Does the child use healthy coping strategies (e.g., talking, art)?",
      },
      {
        text: "Does the child act out (e.g., tantrums) when stressed?",
        reverse: true,
      },
      { text: "Is the child able to seek help from adults when stressed?" },
      { text: "Does the child use creative outlets to manage stress?" },
      { text: "Are stressful emotions expressed constructively?" },
      { text: "Does the child avoid unhealthy behaviors (e.g., isolation)?" },
      { text: "Is the child taught coping skills by family or school?" },
      { text: "Does the child recover emotionally after stress?" },
      { text: "Are coping strategies consistent across stressors?" },
      { text: "Does the child feel empowered to handle stress?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 10: Academic Engagement",
    description: "Measures school engagement reflecting stress and motivation.",
    category: "Academic Engagement",
    questions: [
      { text: "Does the child show interest in school activities?" },
      { text: "Is the child enthusiastic about learning or projects?" },
      {
        text: "Does stress reduce the child’s engagement in school?",
        reverse: true,
      },
      { text: "Does the child participate actively in class or activities?" },
      { text: "Are academic achievements celebrated by the family?" },
      { text: "Does the child avoid schoolwork due to stress?", reverse: true },
      { text: "Is the child motivated to improve academically?" },
      { text: "Does the child share school experiences with you?" },
      { text: "Are academic pressures balanced with encouragement?" },
      { text: "Does the child feel fulfilled by school activities?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 11: Social Confidence",
    description: "Assesses confidence in social settings under stress.",
    category: "Social Confidence",
    questions: [
      {
        text: "Does the child feel confident in group settings (e.g., school)?",
      },
      { text: "Does the child worry about peer acceptance?", reverse: true },
      { text: "Is the child comfortable initiating conversations with peers?" },
      {
        text: "Does the child enjoy social events (e.g., parties, playdates)?",
      },
      { text: "Are social rejections handled without excessive stress?" },
      { text: "Does the child feel supported by friends during stress?" },
      { text: "Do social media pressures cause anxiety?", reverse: true },
      { text: "Is the child able to resolve peer conflicts calmly?" },
      { text: "Does the child feel included in social groups?" },
      { text: "Are social interactions positive and stress-free?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 12: Family Support",
    description:
      "Evaluates family as a stress buffer within joint family contexts.",
    category: "Family Support",
    questions: [
      { text: "Does the child feel emotionally supported by family?" },
      { text: "Is the child comfortable sharing stress with family?" },
      { text: "Does the family provide a safe space during stress?" },
      { text: "Are family expectations a source of stress?", reverse: true },
      { text: "Does the child receive encouragement during challenges?" },
      { text: "Are family interactions free of tension or conflict?" },
      { text: "Does the child feel valued by family members?" },
      { text: "Are stressful family events discussed openly?" },
      { text: "Does the family help the child manage stress?" },
      { text: "Is the child’s home environment calming?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 13: External Stressors",
    description:
      "Gauges impact of external factors such as societal or financial pressures.",
    category: "External Stressors",
    questions: [
      { text: "Do academic expectations stress the child?", reverse: true },
      { text: "Does the child handle family pressures (e.g., roles) calmly?" },
      {
        text: "Are societal norms (e.g., behavior) a source of stress?",
        reverse: true,
      },
      { text: "Does the child feel supported during external challenges?" },
      {
        text: "Are financial stresses in the family affecting the child?",
        reverse: true,
      },
      { text: "Does the child discuss external stressors with you?" },
      { text: "Are peer pressures (e.g., social media) manageable?" },
      { text: "Does the child remain calm during family changes?" },
      { text: "Are external stressors balanced with positive experiences?" },
      { text: "Does the child show resilience against external pressures?" },
    ],
  }),
  buildChildAssessment({
    title: "Child Stress Check Day 14: Emotional Resilience",
    description:
      "Assesses overall resilience to stress for long-term mental health.",
    category: "Emotional Resilience",
    questions: [
      { text: "Does the child bounce back quickly after stressful events?" },
      { text: "Is the child optimistic about overcoming challenges?" },
      { text: "Does the child maintain a positive mood under stress?" },
      { text: "Are stressful events met with problem-solving skills?" },
      { text: "Does the child avoid prolonged sadness or anxiety?" },
      { text: "Is the child able to find joy despite stressors?" },
      {
        text: "Does stress overwhelm the child’s daily functioning?",
        reverse: true,
      },
      { text: "Are coping skills applied consistently across situations?" },
      { text: "Does the child feel empowered to face challenges?" },
      { text: "Is the child’s resilience supported by family or school?" },
    ],
  }),
];

// ---------- COUPLE THERAPY ASSESSMENTS: 14-Day Relationship Health Check ----------

function buildCoupleAssessment({ title, description, questions, category }) {
  return {
    title,
    description,
    therapyType: "couple",
    questions: questions.map((q) => ({
      text: q.text,
      options: makeOptions(!!q.reverse),
      category,
    })),
    scoringRanges: [
      {
        minScore: 24,
        maxScore: 30,
        result: "High Harmony",
        recommendations: [
          "Strong relationship; maintain communication rituals",
          "Schedule regular check-ins and shared activities",
        ],
      },
      {
        minScore: 16,
        maxScore: 23,
        result: "Moderate Harmony",
        recommendations: [
          "Solid foundation with areas to refine",
          "Target conflict skills or intimacy; reassess in 2–4 weeks",
        ],
      },
      {
        minScore: 8,
        maxScore: 15,
        result: "Areas of Concern",
        recommendations: [
          "Notable challenges; consider couples therapy",
          "Practice structured dialogues and repair attempts",
        ],
      },
      {
        minScore: 0,
        maxScore: 7,
        result: "Significant Challenges",
        recommendations: [
          "High strain; seek professional support promptly",
          "Stabilize safety, reduce conflict cycles, and rebuild trust",
        ],
      },
    ],
    isActive: true,
  };
}

const coupleAssessments = [
  buildCoupleAssessment({
    title: "Relationship Health Check Day 1: Open Communication",
    description:
      "Assesses emotional safety and clarity in sharing thoughts and feelings.",
    category: "Open Communication",
    questions: [
      {
        text: "How often do you and your partner openly share your feelings without fear of judgment?",
      },
      {
        text: "Do you feel your partner listens attentively when you express your emotions?",
      },
      {
        text: "How often do you discuss difficult topics (e.g., finances, family) openly with your partner?",
      },
      {
        text: "Do you feel comfortable expressing disagreement with your partner?",
      },
      {
        text: "How often does your partner initiate honest conversations about their feelings?",
      },
      {
        text: "Do you feel your partner understands your perspective during discussions?",
      },
      {
        text: "How often do you avoid discussing important issues to prevent conflict?",
        reverse: true,
      },
      {
        text: "Do you feel your partner communicates their needs clearly to you?",
      },
      {
        text: "How often do you feel heard when sharing your thoughts with your partner?",
      },
      {
        text: "Do you and your partner regularly check in about your relationship’s health?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 2: Trust",
    description: "Evaluates mutual trust and reliability.",
    category: "Trust",
    questions: [
      {
        text: "Do you feel confident trusting your partner with personal or sensitive matters?",
      },
      {
        text: "How often does your partner keep promises or commitments made to you?",
      },
      {
        text: "Do you feel secure sharing your vulnerabilities with your partner?",
      },
      {
        text: "How often do you doubt your partner’s honesty or intentions?",
        reverse: true,
      },
      {
        text: "Does your partner respect your privacy (e.g., personal space, communications)?",
      },
      {
        text: "How often do you feel your partner is reliable in difficult situations?",
      },
      {
        text: "Do you trust your partner to prioritize your relationship’s well-being?",
      },
      {
        text: "How often do past betrayals or mistrust affect your current interactions?",
        reverse: true,
      },
      {
        text: "Do you feel your partner trusts you with their own vulnerabilities?",
      },
      { text: "How often do you and your partner discuss trust openly?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 3: Conflict Resolution",
    description: "Measures ability to navigate and resolve disagreements.",
    category: "Conflict Resolution",
    questions: [
      { text: "How easily can you and your partner resolve disagreements?" },
      {
        text: "How often do you and your partner stay calm during disagreements?",
      },
      {
        text: "Do you feel your partner listens to your side during conflicts?",
      },
      {
        text: "How often do conflicts escalate to yelling or hurtful behavior?",
        reverse: true,
      },
      { text: "Do you and your partner compromise to resolve disputes?" },
      { text: "How often do you feel understood after resolving a conflict?" },
      {
        text: "Do you feel safe expressing disagreement without fear of retaliation?",
      },
      {
        text: "How often do unresolved conflicts linger in your relationship?",
        reverse: true,
      },
      { text: "Do you and your partner revisit conflicts to learn from them?" },
      { text: "How often do you feel conflicts strengthen your relationship?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 4: Emotional Support",
    description: "Assesses presence of mutual emotional support.",
    category: "Emotional Support",
    questions: [
      {
        text: "Do you feel supported by your partner when facing personal challenges?",
      },
      {
        text: "How often does your partner offer encouragement during tough times?",
      },
      {
        text: "Do you feel your partner empathizes with your emotional struggles?",
      },
      {
        text: "How often do you feel dismissed when sharing your difficulties?",
        reverse: true,
      },
      {
        text: "Does your partner actively help you cope with stress or challenges?",
      },
      {
        text: "How often do you feel comfortable seeking support from your partner?",
      },
      { text: "Do you feel your partner relies on you for emotional support?" },
      {
        text: "How often does your partner check in on your emotional well-being?",
      },
      {
        text: "Do you feel your partner’s support makes challenges easier to handle?",
      },
      {
        text: "How often do you and your partner discuss ways to support each other better?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 5: Productive Conflict",
    description: "Evaluates whether conflicts lead to growth or understanding.",
    category: "Productive Conflict",
    questions: [
      {
        text: "How often do disagreements with your partner lead to better understanding?",
      },
      {
        text: "Do conflicts help you and your partner clarify your needs or expectations?",
      },
      { text: "How often do arguments result in actionable solutions?" },
      {
        text: "Do you feel conflicts with your partner improve your communication?",
      },
      {
        text: "How often do you and your partner learn from past disagreements?",
      },
      {
        text: "Do conflicts lead to stronger emotional connection with your partner?",
      },
      { text: "How often do arguments end with mutual respect intact?" },
      {
        text: "Do you feel conflicts help you understand your partner’s perspective?",
      },
      {
        text: "How often do you and your partner discuss how to handle conflicts better?",
      },
      {
        text: "Do you feel conflicts ultimately bring you and your partner closer?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 6: Emotional Intimacy",
    description: "Measures emotional closeness and safety.",
    category: "Emotional Intimacy",
    questions: [
      {
        text: "How often do you and your partner share moments of emotional closeness (e.g., deep conversations)?",
      },
      {
        text: "Do you feel emotionally connected to your partner during interactions?",
      },
      { text: "How often do you express affection through words or gestures?" },
      { text: "Do you feel your partner understands your emotional needs?" },
      {
        text: "How often do you share your fears or dreams with your partner?",
      },
      {
        text: "Do you feel safe being emotionally vulnerable with your partner?",
      },
      { text: "How often does your partner show emotional warmth toward you?" },
      {
        text: "Do you feel your partner prioritizes emotional closeness with you?",
      },
      {
        text: "How often do you and your partner laugh or share joyful moments?",
      },
      { text: "Do you feel emotionally fulfilled in your relationship?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 7: Shared Goals",
    description: "Assesses alignment on life objectives and values.",
    category: "Shared Goals",
    questions: [
      {
        text: "Do you and your partner feel aligned on long-term goals (e.g., family, career)?",
      },
      { text: "How often do you discuss your shared vision for the future?" },
      { text: "Do you feel your partner supports your personal aspirations?" },
      {
        text: "How often do you and your partner agree on financial priorities?",
      },
      {
        text: "Do you feel confident in your partner’s commitment to shared goals?",
      },
      { text: "How often do you work together on plans for your future?" },
      { text: "Do you feel your partner respects your individual goals?" },
      {
        text: "How often do disagreements arise over future plans or priorities?",
        reverse: true,
      },
      {
        text: "Do you and your partner share similar values about family or lifestyle?",
      },
      {
        text: "How often do you feel excited about your shared future together?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 8: Mutual Respect",
    description: "Evaluates respect during interactions and boundary honoring.",
    category: "Mutual Respect",
    questions: [
      {
        text: "How often do you feel respected by your partner during disagreements?",
      },
      { text: "Does your partner value your opinions, even when they differ?" },
      {
        text: "How often does your partner speak to you in a kind or respectful tone?",
      },
      {
        text: "Do you feel your partner respects your boundaries (e.g., time, space)?",
      },
      {
        text: "How often do you feel belittled or criticized by your partner?",
        reverse: true,
      },
      {
        text: "Does your partner acknowledge your contributions to the relationship?",
      },
      { text: "How often do you feel your partner treats you as an equal?" },
      {
        text: "Do you feel respected for your individuality within the relationship?",
      },
      {
        text: "How often does your partner show appreciation for your efforts?",
      },
      { text: "Do you feel your partner respects your decisions or choices?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 9: Quality Time",
    description: "Assesses investment in shared experiences and connection.",
    category: "Quality Time",
    questions: [
      {
        text: "How often do you and your partner spend meaningful, uninterrupted time together?",
      },
      {
        text: "Do you feel satisfied with the amount of quality time you share?",
      },
      {
        text: "How often do you and your partner engage in shared hobbies or activities?",
      },
      { text: "Do you feel your partner prioritizes spending time with you?" },
      {
        text: "How often do you feel distracted when spending time with your partner?",
        reverse: true,
      },
      {
        text: "Do you and your partner make time for meaningful conversations?",
      },
      { text: "How often do you enjoy shared moments of fun or relaxation?" },
      {
        text: "Do you feel quality time strengthens your connection with your partner?",
      },
      {
        text: "How often do you and your partner plan special activities together?",
      },
      { text: "Do you feel your partner values the time you spend together?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 10: Conflict Frequency",
    description: "Quantifies prevalence of disputes and strain.",
    category: "Conflict Frequency",
    questions: [
      {
        text: "How frequently do conflicts or arguments arise in your relationship?",
        reverse: true,
      },
      {
        text: "How often do small disagreements escalate into larger conflicts?",
        reverse: true,
      },
      {
        text: "Do you feel conflicts occur over minor or trivial issues?",
        reverse: true,
      },
      {
        text: "How often do you feel stressed due to frequent arguments?",
        reverse: true,
      },
      {
        text: "Do conflicts disrupt your daily interactions with your partner?",
        reverse: true,
      },
      {
        text: "How often do you avoid addressing issues to prevent arguments?",
        reverse: true,
      },
      {
        text: "Do you feel arguments occur over recurring unresolved issues?",
        reverse: true,
      },
      {
        text: "How often do conflicts leave you feeling disconnected from your partner?",
        reverse: true,
      },
      {
        text: "Do you feel conflicts dominate your interactions with your partner?",
        reverse: true,
      },
      {
        text: "How often do you and your partner have calm periods without arguments?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 11: Appreciation",
    description: "Measures expressions of gratitude and positivity.",
    category: "Appreciation",
    questions: [
      { text: "How often do you feel appreciated or valued by your partner?" },
      {
        text: "Does your partner express gratitude for your efforts in the relationship?",
      },
      { text: "How often do you feel recognized for small acts of kindness?" },
      {
        text: "Do you feel your partner notices your contributions (e.g., chores, support)?",
      },
      {
        text: "How often does your partner verbally acknowledge your efforts?",
      },
      { text: "Do you feel appreciated for who you are as a person?" },
      { text: "How often do you express appreciation to your partner?" },
      { text: "Do you feel your partner values your role in their life?" },
      {
        text: "How often do you feel taken for granted by your partner?",
        reverse: true,
      },
      {
        text: "Does your partner show appreciation through actions (e.g., gestures, favors)?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 12: Personal Growth",
    description: "Assesses support for individual development.",
    category: "Personal Growth",
    questions: [
      {
        text: "Do you feel your partner supports your personal growth or goals?",
      },
      {
        text: "How often does your partner encourage you to pursue your interests?",
      },
      {
        text: "Do you feel free to explore personal ambitions within the relationship?",
      },
      { text: "How often does your partner celebrate your achievements?" },
      {
        text: "Do you feel your partner respects your need for personal space or time?",
      },
      {
        text: "How often do you feel stifled in pursuing your personal goals?",
        reverse: true,
      },
      { text: "Does your partner inspire you to grow as an individual?" },
      {
        text: "How often do you and your partner discuss your individual aspirations?",
      },
      { text: "Do you feel your personal growth enhances your relationship?" },
      {
        text: "How often does your partner support your efforts to improve yourself?",
      },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 13: Stress Management",
    description: "Evaluates resilience to external pressures together.",
    category: "Stress Management",
    questions: [
      {
        text: "How well do you and your partner handle external stress without impacting your relationship?",
      },
      {
        text: "How often does stress from work or family cause tension between you?",
        reverse: true,
      },
      { text: "Do you feel your partner supports you in managing stress?" },
      { text: "How often do you and your partner discuss stress openly?" },
      {
        text: "Do you feel stress pulls you and your partner apart?",
        reverse: true,
      },
      {
        text: "How often do you and your partner work together to cope with stress?",
      },
      {
        text: "Do you feel your partner remains calm under external pressure?",
      },
      {
        text: "How often does stress lead to arguments or misunderstandings?",
        reverse: true,
      },
      {
        text: "Do you feel your relationship is a safe space during stressful times?",
      },
      { text: "How often do you and your partner help each other de-stress?" },
    ],
  }),
  buildCoupleAssessment({
    title: "Relationship Health Check Day 14: Physical Intimacy",
    description:
      "Assesses physical connection complementing emotional intimacy.",
    category: "Physical Intimacy",
    questions: [
      {
        text: "How satisfied are you with the level of physical affection in your relationship?",
      },
      {
        text: "How often do you and your partner share non-sexual physical affection (e.g., hugs, touch)?",
      },
      {
        text: "Do you feel comfortable expressing physical affection to your partner?",
      },
      { text: "How often does your partner initiate physical closeness?" },
      { text: "Do you feel satisfied with the frequency of intimate moments?" },
      {
        text: "How often do physical intimacy issues cause tension?",
        reverse: true,
      },
      { text: "Do you feel your partner respects your physical boundaries?" },
      {
        text: "How often does physical affection strengthen your emotional bond?",
      },
      {
        text: "Do you and your partner openly discuss physical intimacy needs?",
      },
      { text: "How often do you feel physically connected to your partner?" },
    ],
  }),
];

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
      gad10Assessment,
      workplaceBurnoutAssessment,
      ...familyAssessments,
      ...childAssessments,
      ...coupleAssessments,
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
      // Ensure therapyType defaults to individual if missing
      if (!assessment.therapyType) {
        assessment.therapyType = "individual";
      }
      // Dedupe questions by text
      assessment.questions = dedupeQuestionsByText(assessment.questions);

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
