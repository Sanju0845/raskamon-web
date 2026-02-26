import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaRegSmile, FaBrain, FaHeart, FaUserMd, FaStar } from "react-icons/fa";
import { ChevronRight, Target } from "lucide-react";

// Benefits Section Component
const BenefitsSection = ({ benefits }) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What You'll{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Achieve
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Individual therapy helps you build coping skills, improve mental
            wellness, and achieve personal growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const IndividualTherapy = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) navigate("/login?type=login");
    else navigate("/individual?therapy=individual");
  };

  // Benefits
  const benefits = [
    {
      icon: <FaBrain className="text-xl" />,
      title: "Better Mental Health",
      description:
        "Address anxiety, depression, and emotional challenges effectively.",
    },
    {
      icon: <FaHeart className="text-xl" />,
      title: "Emotional Resilience",
      description: "Learn coping strategies and self-regulation skills.",
    },
    {
      icon: <FaStar className="text-xl" />,
      title: "Personal Growth",
      description:
        "Improve self-awareness and work towards your personal goals.",
    },
    {
      icon: <FaRegSmile className="text-xl" />,
      title: "Improved Quality of Life",
      description:
        "Experience better relationships, work-life balance, and overall well-being.",
    },
  ];

  // Conditions
  const conditions = [
    "Depression",
    "Anxiety",
    "Obsessive-Compulsive Disorder (OCD)",
    "Bipolar Disorder",
    "Adult ADHD",
    "Social Anxiety",
    "Alcohol Addiction",
    "Tobacco Addiction",
    "Women's Health",
  ];

  // Care Model Steps
  const careModel = [
    {
      title: "Initial Consultation",
      subtitle: "Understanding Your Needs",
      description:
        "Schedule a session with a licensed therapist to discuss your mental health goals and explore the support available.",
      color: "from-purple-600 to-pink-600",
      icon: <FaUserMd className="text-3xl text-white" />,
    },
    {
      title: "Comprehensive Assessment",
      subtitle: "Evaluating Your Wellbeing",
      description:
        "We conduct thorough assessments, including emotional, cognitive, and behavioral evaluations, to create an accurate understanding of your needs.",
      color: "from-pink-600 to-rose-500",
      icon: <FaBrain className="text-3xl text-white" />,
    },
    {
      title: "Therapy & Support",
      subtitle: "Personalized Care Plan",
      description:
        "Begin tailored therapy sessions, both online and in-person, designed to improve coping strategies, emotional resilience, and overall mental wellness.",
      color: "from-rose-500 to-red-500",
      icon: <FaRegSmile className="text-3xl text-white" />,
    },
  ];

  // Therapy Types
  const therapyTypes = [
    {
      title: "Cognitive Behavioral Therapy (CBT)",
      description:
        "Structured therapy focusing on identifying and changing negative thought patterns.",
      techniques: [
        "Thought Records",
        "Behavioral Experiments",
        "Coping Skills",
      ],
    },
    {
      title: "Mindfulness & Meditation",
      description:
        "Techniques to enhance awareness, reduce stress, and improve emotional regulation.",
      techniques: ["Breathing Exercises", "Body Scan", "Mindful Journaling"],
    },
    {
      title: "Psychodynamic Therapy",
      description:
        "Explore underlying emotional conflicts and past experiences affecting current behavior.",
      techniques: ["Self-Reflection", "Dream Analysis", "Emotion Exploration"],
    },
    {
      title: "Solution-Focused Therapy",
      description:
        "Goal-oriented approach emphasizing solutions rather than problems.",
      techniques: [
        "Goal Setting",
        "Strength Identification",
        "Practical Action Plans",
      ],
    },
  ];

  // FAQs
  const faqs = [
    {
      question: "Who can benefit from individual therapy?",
      answer:
        "Individuals of any age experiencing mental health challenges, stress, emotional difficulties, or personal growth goals can benefit.",
    },
    {
      question: "How long does therapy usually take?",
      answer:
        "Therapy duration varies, but many clients see improvement within 8-20 sessions depending on their goals.",
    },
    {
      question: "Are sessions confidential?",
      answer:
        "Yes, all sessions are confidential, providing a safe space for open expression.",
    },
    {
      question: "Can therapy be online?",
      answer:
        "Yes, we provide both online and in-person therapy options to suit your needs.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Yourself with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Individual Therapy
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Our therapists provide personalized support to improve mental
              wellness, emotional resilience, and overall quality of life.
            </p>
            <button
              onClick={handleAssessmentClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Your Journey Today
            </button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />

      {/* Conditions Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Conditions We Support
          </h2>
          <p className="text-gray-600 text-lg mb-12">
            We provide therapy for a range of mental health concerns.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {conditions.map((condition, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 text-gray-700 font-medium"
              >
                {condition}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Model Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Individual Therapy
              </span>{" "}
              Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured approach designed to guide you from assessment to
              personalized care and ongoing support.
            </p>
          </motion.div>

          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform -translate-y-1/2 z-0"></div>

            {careModel.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative z-10 flex-1 bg-gradient-to-br rounded-3xl p-8 shadow-lg text-black mx-4 mb-8 md:mb-0 hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-6 shadow-lg bg-gradient-to-br ${step.color} mx-auto`}
                >
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                {step.subtitle && (
                  <h4 className="font-semibold mb-2 text-purple-700">
                    {step.subtitle}
                  </h4>
                )}
                <p className="leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapy Types Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Evidence-Based{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Approaches
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our therapists are trained in multiple proven methods for
              individualized care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {therapyTypes.map((therapy, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {therapy.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {therapy.description}
                </p>
                <h4 className="flex items-center text-sm font-semibold mb-3 text-purple-600">
                  <Target className="mr-2" /> Key Techniques:
                </h4>
                <ul className="space-y-2">
                  {therapy.techniques.map((technique, i) => (
                    <li key={i} className="flex items-start text-gray-600">
                      <ChevronRight className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                      {technique}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                viewport={{ once: true }}
                className="border-b border-gray-200 pb-4"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndividualTherapy;
