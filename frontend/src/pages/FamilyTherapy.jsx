import React, { useContext } from "react";
import {
  FaUsers,
  FaHeart,
  FaCheckCircle,
  FaHandsHelping,
  FaUserMd,
  FaRegSmile,
  FaStar,
  FaComments,
} from "react-icons/fa";
import { ChevronRight, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Benefits Section Component
const BenefitsSection = ({ benefits }) => {
  if (!benefits || benefits.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            How Family Therapy{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Supports Mental Wellness
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Strengthen bonds, improve communication, and foster emotional
            well-being for all family members.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden text-center"
            >
              <div className="absolute top-[-1rem] right-[-1rem] w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-30 blur-3xl"></div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = ({ testimonials }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Families We've Helped
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from families who improved communication, emotional
            well-being, and connection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 relative"
            >
              <div className="mb-4">
                <FaRegSmile className="text-purple-600 text-4xl mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">&quot;{t.feedback}&quot;</p>
              <h4 className="font-bold text-gray-900 text-center">{t.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FamilyTherapy = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) navigate("/login?type=login");
    else navigate("/family?therapy=family");
  };

  const benefits = [
    {
      icon: <FaUsers />,
      title: "Enhanced Communication",
      description: "Improve understanding among family members.",
    },
    {
      icon: <FaHandsHelping />,
      title: "Conflict Resolution",
      description: "Learn strategies to manage disagreements.",
    },
    {
      icon: <FaHeart />,
      title: "Emotional Support",
      description: "Create a safe space for sharing feelings.",
    },
    {
      icon: <FaCheckCircle />,
      title: "Stronger Bonds",
      description: "Build trust, empathy, and connection.",
    },
    {
      icon: <FaRegSmile />,
      title: "Mental Wellness",
      description: "Support mental health for children, teens, and adults.",
    },
    {
      icon: <FaUserMd />,
      title: "Guided Expert Support",
      description: "Certified therapists help navigate complex family issues.",
    },
  ];

  const ourApproach = [
    {
      step: "1",
      title: "Initial Assessment",
      description: "Understand family needs and patterns.",
      color: "from-purple-600 to-pink-600",
    },
    {
      step: "2",
      title: "Goal Setting",
      description: "Define measurable objectives.",
      color: "from-pink-600 to-purple-500",
    },
    {
      step: "3",
      title: "Skill Building",
      description: "Learn communication & coping techniques.",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "4",
      title: "Implementation",
      description: "Apply strategies with guidance.",
      color: "from-pink-500 to-purple-400",
    },
    {
      step: "5",
      title: "Follow-Up & Maintenance",
      description: "Review progress and maintain improvements.",
      color: "from-purple-400 to-pink-400",
    },
  ];

  const therapyTypes = [
    {
      title: "Structural Therapy",
      description: "Focus on family roles, boundaries, and hierarchy.",
      techniques: ["Family Mapping", "Role Restructuring"],
    },
    {
      title: "Bowenian Therapy",
      description: "Address intergenerational patterns and anxiety management.",
      techniques: ["Genograms", "Differentiation of Self"],
    },
    {
      title: "Solution-Focused Therapy",
      description: "Emphasizes family strengths and solutions.",
      techniques: ["Goal-Oriented Sessions", "Positive Reinforcement"],
    },
    {
      title: "Narrative Therapy",
      description: "Families rewrite their story for empowerment.",
      techniques: ["Externalizing Problems", "Family Storytelling"],
    },
  ];

  const stats = [
    {
      number: "92%",
      label: "Report Improved Communication",
      icon: <FaComments />,
    },
    { number: "88%", label: "Feel Stronger Family Bonds", icon: <FaHeart /> },
    { number: "95%", label: "Would Recommend Therapy", icon: <FaStar /> },
    { number: "60+", label: "Certified Family Therapists", icon: <FaUserMd /> },
  ];

  const testimonials = [
    {
      name: "The Sharma Family",
      feedback:
        "Therapy helped us communicate without arguments and understand each other better.",
    },
    {
      name: "Priya & Raj",
      feedback:
        "Our teenage children are more open, and the stress in our home has reduced significantly.",
    },
    {
      name: "The Singh Family",
      feedback:
        "We learned tools to resolve conflicts and feel more connected than ever.",
    },
  ];

  const faqs = [
    {
      question: "Who should attend therapy?",
      answer: "All family members can benefit, even if only a few attend.",
    },
    {
      question: "Can therapy help children or teens?",
      answer: "Yes, our therapists specialize in youth mental wellness.",
    },
    {
      question: "How many sessions are needed?",
      answer: "Typically 8-15 sessions, but customized based on needs.",
    },
    {
      question: "Is therapy confidential?",
      answer: "Yes, confidentiality is strictly maintained.",
    },
    {
      question: "Do we need to live together to participate?",
      answer: "No, remote sessions and flexible scheduling are available.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Family Relationships
              </span>{" "}
              & Mental Wellness
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Rediscover connection, rebuild trust, and create a healthier
              family environment with certified family therapists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAssessmentClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Your Family Wellness Journey
              </button>
              {/* <button className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300">
                Learn More About Our Approach
              </button> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100 text-center"
            >
              <div className="text-purple-600 mb-2 flex justify-center">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />

      {/* Our Approach Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Step-by-Step Approach
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured process designed to create meaningful, lasting change
              in your family dynamics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {ourApproach.map((step, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full relative text-center"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} rounded-full -translate-y-16 translate-x-16 opacity-10`}
                ></div>
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg mx-auto`}
                  >
                    <span className="text-2xl font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Therapy Types Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
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
              Our therapists are trained in multiple proven methodologies for
              family mental wellness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {therapyTypes.map((therapy, idx) => (
              <div
                key={idx}
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
                  {therapy.techniques.map((t, i) => (
                    <li key={i} className="flex items-start text-gray-600">
                      <ChevronRight className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" />{" "}
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={testimonials} />

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
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 * idx, duration: 0.5 }}
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

export default FamilyTherapy;
