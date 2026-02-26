// backend/controllers/assessmentController.js
import { Assessment, UserAssessment } from "../models/assessmentModel.js";
import userModel from "../models/userModel.js";

// Get all active assessments
export const getAssessments = async (req, res) => {
  try {
    const { therapyType } = req.query;
    const query = { isActive: true };
    if (therapyType) {
      query.therapyType = therapyType;
    }
    const assessments = await Assessment.find(query);
    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assessment by ID
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit assessment answers
export const submitAssessment = async (req, res) => {
  try {
    const { userId, assessmentId, answers, startTime, therapyType, title } =
      req.body;

    // Validate user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Calculate total score
    let totalScore = 0;
    answers.forEach((answer) => {
      const question = assessment.questions.id(answer.questionId);
      if (question) {
        const selectedOption = question.options.find(
          (opt) => opt.value === answer.selectedOption
        );
        if (selectedOption) {
          totalScore += selectedOption.value;
        }
      }
    });

    // Determine result based on scoring ranges
    let result = "";
    let recommendations = [];
    for (const range of assessment.scoringRanges) {
      if (totalScore >= range.minScore && totalScore <= range.maxScore) {
        result = range.result;
        recommendations = range.recommendations;
        break;
      }
    }

    // Save user assessment
    const userAssessment = new UserAssessment({
      userId,
      title,
      assessmentId,
      answers,
      therapyType,
      totalScore,
      result,
      startedAt: startTime || new Date(),
      recommendations,
    });

    await userAssessment.save();

    res.status(201).json({
      totalScore,
      result,
      recommendations,
      assessmentId: userAssessment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's assessment history
export const getUserAssessments = async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await UserAssessment.find({ userId })
      .populate("assessmentId", "title description")
      .sort({ completedAt: -1 });

    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get detailed assessment results
export const getAssessmentDetails = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Get the user assessment
    const userAssessment = await UserAssessment.findById(assessmentId).populate(
      "assessmentId"
    );

    if (!userAssessment) {
      return res.status(404).json({ message: "Assessment results not found" });
    }

    // Verify the user owns this assessment
    if (userAssessment.userId.toString() !== req.body.userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Get the original assessment with questions
    const assessment = await Assessment.findById(
      userAssessment.assessmentId._id
    );

    // Map answers with questions for detailed view
    const detailedResults = userAssessment.answers.map((answer) => {
      const question = assessment.questions.id(answer.questionId);
      const selectedOption = question.options.find(
        (opt) => opt.value === answer.selectedOption
      );

      return {
        question: question.text,
        category: question.category,
        selectedOption: selectedOption.text,
        score: selectedOption.value,
        maxScore: Math.max(...question.options.map((opt) => opt.value)),
      };
    });

    res.status(200).json({
      assessment: userAssessment.assessmentId,
      completedAt: userAssessment.completedAt,
      totalScore: userAssessment.totalScore,
      result: userAssessment.result,
      recommendations: userAssessment.recommendations,
      detailedResults,
      categoryBreakdown: calculateCategoryBreakdown(detailedResults),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user progress data
export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all user assessments with basic details
    const assessments = await UserAssessment.find({ userId })
      .populate("assessmentId", "title description")
      .sort({ completedAt: 1 });

    // Calculate progress metrics
    const progressData = {
      totalAssessments: assessments.length,
      averageScore:
        assessments.reduce((acc, curr) => acc + curr.totalScore, 0) /
          assessments.length || 0,
      improvementTrend: calculateImprovementTrend(assessments),
      categoryProgress: calculateCategoryProgress(assessments),
      lastAssessment:
        assessments.length > 0 ? assessments[assessments.length - 1] : null,
    };

    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
function calculateCategoryBreakdown(detailedResults) {
  const categories = {};

  detailedResults.forEach((result) => {
    if (!categories[result.category]) {
      categories[result.category] = {
        totalScore: 0,
        maxScore: 0,
        count: 0,
      };
    }
    categories[result.category].totalScore += result.score;
    categories[result.category].maxScore += result.maxScore;
    categories[result.category].count++;
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    score: data.totalScore,
    maxScore: data.maxScore,
    percentage: Math.round((data.totalScore / data.maxScore) * 100),
  }));
}

function calculateImprovementTrend(assessments) {
  if (assessments.length < 2) return null;

  const first = assessments[0].totalScore;
  const last = assessments[assessments.length - 1].totalScore;
  const improvement = ((last - first) / first) * 100;

  return {
    percentage: Math.round(improvement),
    direction: improvement >= 0 ? "up" : "down",
  };
}

function calculateCategoryProgress(assessments) {
  const categoryData = {};

  assessments.forEach((assessment) => {
    assessment.answers.forEach((answer) => {
      const question = assessment.assessmentId.questions.id(answer.questionId);
      if (!categoryData[question.category]) {
        categoryData[question.category] = {
          totalScore: 0,
          maxScore: 0,
          count: 0,
        };
      }
      const selectedOption = question.options.find(
        (opt) => opt.value === answer.selectedOption
      );
      categoryData[question.category].totalScore += selectedOption.value;
      categoryData[question.category].maxScore += Math.max(
        ...question.options.map((opt) => opt.value)
      );
      categoryData[question.category].count++;
    });
  });

  return Object.entries(categoryData).map(([category, data]) => ({
    category,
    averageScore: data.totalScore / data.count,
    averageMaxScore: data.maxScore / data.count,
    percentage: Math.round((data.totalScore / data.maxScore) * 100),
  }));
}
