import React, { useContext } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Target, Heart } from "lucide-react";
import {
  FaChild,
  FaSmile,
  FaBrain,
  FaStar,
  FaUserMd,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// Benefits Section Component
const BenefitsSection = ({ benefits }) => {
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
            How We{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Support Children & Adolescents
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our specialized programs help young minds navigate challenges, build
            resilience, and thrive emotionally.
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

const ChildAdolescentTherapy = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) navigate("/login?type=login");
    else navigate("/child?therapy=child");
  };

  const benefits = [
    {
      icon: <FaBrain className="text-xl" />,
      title: "Emotional Resilience",
      description:
        "Helping children manage emotions and cope with stress effectively.",
    },
    {
      icon: <FaSmile className="text-xl" />,
      title: "Improved Social Skills",
      description: "Enhancing peer relationships and communication skills.",
    },
    {
      icon: <FaChild className="text-xl" />,
      title: "Behavioral Support",
      description: "Providing strategies for managing behavioral challenges.",
    },
    {
      icon: <FaUserMd className="text-xl" />,
      title: "Psychiatric Assessment",
      description:
        "Comprehensive evaluation for mental health and developmental needs.",
    },
  ];

  const ourApproach = [
    {
      step: "1",
      title: "Initial Consultation",
      description: "Engage with family to understand concerns and history.",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "2",
      title: "Assessment",
      description: "Conduct evaluations to identify needs and challenges.",
      color: "from-pink-500 to-rose-500",
    },
    {
      step: "3",
      title: "Personalized Plan",
      description: "Design therapy and support tailored to the child.",
      color: "from-rose-500 to-red-500",
    },
    {
      step: "4",
      title: "Ongoing Support",
      description: "Monitor progress and adjust plans for maximum impact.",
      color: "from-red-500 to-orange-500",
    },
  ];

  const therapyTypes = [
    {
      title: "Individual Therapy",
      description:
        "One-on-one sessions addressing emotional and behavioral needs.",
      techniques: [
        "Cognitive Behavioral Therapy",
        "Play Therapy",
        "Mindfulness Techniques",
      ],
    },
    {
      title: "Group Therapy",
      description:
        "Small groups fostering social skills, empathy, and peer support.",
      techniques: [
        "Social Skills Training",
        "Peer Interaction Exercises",
        "Team-building Activities",
      ],
    },
    {
      title: "Family Therapy",
      description: "Supports family communication and relationships.",
      techniques: [
        "Parent-Child Interaction",
        "Family Dynamics Assessment",
        "Conflict Resolution",
      ],
    },
    {
      title: "Neurodiversity Support",
      description:
        "Tailored programs for children with autism, ADHD, and other conditions.",
      techniques: [
        "Individualized Learning Plans",
        "Behavioral Interventions",
        "Skill Development",
      ],
    },
  ];

  const careModel = [
    {
      title: "Intake Session",
      description:
        "Book a consultation with one of our psychologists or psychiatrists to explore the support you need—whether for yourself, or your child.",
      icon: <FaUserMd className="text-3xl text-white" />,
      color: "from-purple-600 to-pink-600",
    },
    {
      title: "Evaluation",
      description:
        "Based on our interactions with you and/or the young person, we will carry out relevant and comprehensive assessments to enable the best possible care.",
      icon: <FaBrain className="text-3xl text-white" />,
      color: "from-pink-600 to-rose-500",
    },
    {
      title: "Intervention & Support",
      description:
        "Once we chalk out a care plan, you can instantly book online and in-person psychiatry and therapy sessions as recommended.",
      icon: <FaSmile className="text-3xl text-white" />,
      color: "from-rose-500 to-red-500",
    },
  ];

  const faqs = [
    {
      question: "At what age can children begin therapy?",
      answer:
        "Children as young as 3 years old can benefit from age-appropriate therapy sessions.",
    },
    {
      question: "Do parents need to attend sessions?",
      answer:
        "Parents are encouraged to participate in some sessions to support progress.",
    },
    {
      question: "How long are therapy sessions?",
      answer:
        "Sessions typically range from 30-60 minutes, depending on age and needs.",
    },
    {
      question: "Is everything confidential?",
      answer:
        "Yes, all information is kept private, creating a safe space for children and families.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
              Empowering{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Children & Adolescents
              </span>{" "}
              for Mental Wellness
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Providing compassionate, evidence-based care to nurture emotional,
              social, and cognitive development.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleAssessmentClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Your Child's Journey
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection benefits={benefits} />

      {/* Our Care Model Section */}
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
                Care Model
              </span>{" "}
              for Children & Young People
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured and supportive process for assessment, intervention,
              and ongoing care.
            </p>
          </motion.div>

          <div className="relative flex flex-col md:flex-row items-center justify-between">
            {/* Horizontal connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform -translate-y-1/2 z-0"></div>

            {/* Step Cards */}
            {[
              {
                title: "Intake Session",
                subtitle: "Information Session",
                description:
                  "Book a consultation with one of our psychologists or psychiatrists to explore the support you need—whether for yourself, or your child.",
                color: "from-purple-600 to-pink-600",
                icon: <FaUserMd className="text-3xl text-white" />,
              },
              {
                title: "Evaluation",
                subtitle: "",
                description:
                  "Based on our interactions with you and/or the young person, we will carry out relevant and comprehensive assessments to enable the best possible care.",
                color: "from-pink-600 to-rose-500",
                icon: <FaBrain className="text-3xl text-white" />,
              },
              {
                title: "Intervention & Support",
                subtitle: "",
                description:
                  "Once we chalk out a care plan, you can instantly book online and in-person psychiatry and therapy sessions as recommended.",
                color: "from-rose-500 to-red-500",
                icon: <FaSmile className="text-3xl text-white" />,
              },
            ].map((step, index) => (
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
                  <h4 className="font-semibold mb-2">{step.subtitle}</h4>
                )}
                <p className="leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Approach */}
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
              Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                4-Step Approach
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A structured process designed to create meaningful, lasting
              support for children and adolescents.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ourApproach.map((step, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden text-center"
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
                Therapy Options
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Programs designed to meet the developmental, emotional, and mental
              health needs of young individuals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

export default ChildAdolescentTherapy;
