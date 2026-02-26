import React, { useContext } from "react";
import {
  FaHeart,
  FaUsers,
  FaHandshake,
  FaComments,
  FaBalanceScale,
  FaCheckCircle,
  FaStar,
  FaClock,
  FaShieldAlt,
  FaUserMd,
  FaRegSmile,
} from "react-icons/fa";
import { ChevronRight, Target, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Benefits Section Component
const BenefitsSection = ({ benefits }) => {
  if (!benefits || benefits.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Key Benefits of Couples Counseling
          </h2>
          <p className="text-gray-600 text-lg">
            We offer personalized support to strengthen relationships, rebuild
            trust, and improve communication.
          </p>
        </div>
      </section>
    );
  }

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
            Our couples counseling helps you build a stronger, more fulfilling
            relationship through proven therapeutic techniques.
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
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto`}
                >
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

const CouplesCounselling = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) {
      navigate("/login?type=login");
    } else {
      navigate("/couples?therapy=couple");
    }
  };

  const benefits = [
    {
      icon: <FaComments className="text-xl" />,
      title: "Improved Communication",
      description:
        "Learn to express needs and listen effectively without conflicts escalating",
    },
    {
      icon: <FaBalanceScale className="text-xl" />,
      title: "Conflict Resolution",
      description:
        "Develop healthy ways to resolve disagreements and find common ground",
    },
    {
      icon: <FaHeart className="text-xl" />,
      title: "Rebuild Trust & Intimacy",
      description:
        "Heal from betrayals and reconnect emotionally and physically",
    },
    {
      icon: <FaHandshake className="text-xl" />,
      title: "Strengthen Partnership",
      description:
        "Build a stronger foundation for facing life's challenges together",
    },
  ];

  const whatWeAddress = [
    "Communication breakdown and constant arguments",
    "Trust issues and infidelity recovery",
    "Intimacy and sexual concerns",
    "Financial conflicts and disagreements",
    "Parenting differences and family dynamics",
    "Work-life balance affecting the relationship",
    "Cultural or religious differences",
    "Life transitions (marriage, children, retirement)",
  ];

  const ourApproach = [
    {
      step: "1",
      title: "Assessment Session",
      description:
        "Joint and individual sessions to understand relationship dynamics",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "2",
      title: "Goal Setting",
      description: "Define what success looks like for both partners",
      color: "from-pink-500 to-rose-500",
    },
    {
      step: "3",
      title: "Skill Building",
      description:
        "Learn practical communication and conflict resolution tools",
      color: "from-rose-500 to-red-500",
    },
    {
      step: "4",
      title: "Implementation",
      description: "Apply new skills with guided support from our experts",
      color: "from-red-500 to-orange-500",
    },
  ];

  const therapyTypes = [
    {
      title: "Gottman Method",
      description:
        "Research-based approach focusing on friendship, conflict management, and shared meaning",
      techniques: ["Love Maps", "Turning Towards", "Positive Perspective"],
    },
    {
      title: "Emotionally Focused Therapy (EFT)",
      description:
        "Helps couples understand and reshape emotional responses and attachment bonds",
      techniques: [
        "Attachment Theory",
        "Emotional Accessibility",
        "Responsive Engagement",
      ],
    },
    {
      title: "Imago Relationship Therapy",
      description:
        "Explores how childhood experiences shape adult relationship patterns",
      techniques: [
        "Dialogues",
        "Parent-Child Connections",
        "Conscious Relationships",
      ],
    },
  ];

  const stats = [
    {
      number: "93%",
      label: "Report Improved Communication",
      icon: <FaComments />,
    },
    { number: "87%", label: "Experience Renewed Intimacy", icon: <FaHeart /> },
    { number: "95%", label: "Would Recommend to Others", icon: <FaStar /> },
    {
      number: "50+",
      label: "Certified Couples Therapists",
      icon: <FaUserMd />,
    },
  ];

  const faqs = [
    {
      question: "How long does couples therapy typically take?",
      answer:
        "Most couples see significant improvement in 12-20 sessions, but it varies based on your specific goals and challenges.",
    },
    {
      question: "Do we need to be married to benefit?",
      answer:
        "No, we work with couples at all stages - dating, engaged, married, or considering separation.",
    },
    {
      question: "What if my partner is reluctant to attend?",
      answer:
        "We often start with individual sessions to address concerns and help partners feel comfortable joining.",
    },
    {
      question: "Is everything we share confidential?",
      answer:
        "Yes, all sessions are completely confidential, creating a safe space for open communication.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-rose-100">
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
              Transform Your{" "}
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Relationship
              </span>{" "}
              with Expert Couples Counseling
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Rediscover connection, rebuild trust, and create the loving
              partnership you deserve. Our certified couples therapists provide
              evidence-based approaches to help you grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAssessmentClick}
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Your Journey Today
              </button>
              {/* <button className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-semibold shadow-lg border border-pink-200 hover:shadow-xl transition-all duration-300">
                Learn More About Our Approach
              </button> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100 text-center"
            >
              <div className="text-pink-600 mb-2 flex justify-center">
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

      {/* What We Address Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden md:flex">
            <div className="p-8 md:p-12 flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Common Challenges We Address
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Every relationship faces challenges. Our therapists are
                  experienced in helping couples navigate:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whatWeAddress.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-8 md:p-12 flex-1 flex items-center">
              <div className="text-white text-center">
                <FaUsers className="text-6xl mb-6 mx-auto opacity-80" />
                <h3 className="text-2xl font-bold mb-4">You're Not Alone</h3>
                <p className="text-lg opacity-90">
                  Most couples experience relationship challenges at some point.
                  Seeking help is a sign of strength and commitment to your
                  partnership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                4-Step Approach
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured process designed to create meaningful, lasting change
              in your relationship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ourApproach.map((step, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-8 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden text-center"
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
              Our therapists are trained in multiple proven methodologies to
              best serve your unique relationship needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
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

export default CouplesCounselling;
