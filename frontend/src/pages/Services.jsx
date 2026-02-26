import React, { useContext } from "react";
import {
  FaComments,
  FaClock,
  FaClinicMedical,
  FaUsers,
  FaHeart,
  FaHandHoldingHeart,
  FaRegSmile,
  FaBrain,
  FaBalanceScale,
  FaChartLine,
  FaCheckCircle,
  FaStar,
  FaShieldAlt,
  FaUserMd,
  FaHandsHelping,
  FaSeedling,
  FaBriefcase,
  FaSchool,
  FaHeartBroken,
  FaSmile,
  FaChild,
  FaLightbulb,
  FaHandshake,
  FaMemory,
} from "react-icons/fa";
import { ChevronRight, Target } from "lucide-react";

import { motion } from "framer-motion";
import { GiMeditation, GiHealthNormal, GiSpellBook } from "react-icons/gi";
import { RiMentalHealthLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import BookAppointmentCTA from "../components/BookAppointment";

const Services = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) {
      navigate("/login?type=login");
    } else {
      navigate("/assessments");
    }
  };
  const services = [
    // 1
    {
      icon: <FaHandsHelping className="text-2xl" />,
      title: "Addictions Counseling",
      description:
        "Addiction—whether to substances like alcohol or behaviors like screentime—traps you in a cycle that dims your life’s light. Counseling helps you reclaim control and find freedom. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Uncover Triggers",
          description: "Pinpoint what drives your addiction with support.",
        },
        {
          title: "Build Healthy Habits",
          description: "Replace harmful patterns with positive routines.",
        },
        {
          title: "Shift Mindset ",
          description: "Use CBT to conquer cravings and regain strength.",
        },
        {
          title: "Lean on Support ",
          description: "Find power in therapy and groups for accountability.",
        },
        {
          title: "Live Fully ",
          description: "Rediscover joy without dependency’s shadow.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to break free and thrive. You’ve got this!  #BreakTheCycle",
      color: "from-purple-500 to-pink-500",
    },
    // 2
    {
      icon: <FaSeedling className="text-2xl" />,
      title: "ADHD Counseling",
      description:
        "ADHD can make focus and calm feel out of reach, affecting kids’ school and social life. Counseling turns challenges into strengths. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Understand ADHD ",
          description: "Learn your child’s unique wiring to guide them.",
        },
        {
          title: "Create Structure ",
          description: "Build routines to boost focus and ease chaos.",
        },
        {
          title: "Celebrate Wins ",
          description: "Use positive reinforcement to spark confidence.",
        },
        {
          title: "Teach Coping Tools ",
          description: "Help kids manage energy with mindfulness.",
        },
        {
          title: "Shine Bright ",
          description: "Empower your child to thrive their way.",
        },
      ],
      whoItsFor:
        "Counseling helps kids with ADHD soar. You’ve got this!  #ThriveWithADHD",
      color: "from-orange-500 to-red-500",
    },
    // 3
    {
      icon: <FaClinicMedical className="text-2xl" />,
      title: "Adjustment Disorder Counseling",
      description:
        "Life’s big shifts—job loss, divorce, or moving—can stir sadness and anxiety. Adjustment disorder feels heavy, but counseling helps you adapt. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Identify Stressors ",
          description: "Uncover what’s overwhelming with guidance.",
        },
        {
          title: "Ease the Strain ",
          description: "Learn tools to manage emotional turbulence.",
        },
        {
          title: "Adapt Confidently ",
          description: "Build skills to navigate new realities.",
        },
        {
          title: "Find Stability ",
          description: "Regain balance through small steps.",
        },
        {
          title: "Move Forward ",
          description: "Embrace change with renewed hope.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to thrive through transitions. You’ve got this!  #AdaptAndGrow",
      color: "from-green-500 to-emerald-500",
    },
    // 4
    {
      icon: <FaHeartBroken className="text-2xl" />,
      title: "Break-up or Separation Counseling",
      description:
        "A breakup or separation can break your heart, leaving loneliness and doubt. Counseling helps you heal and rebuild. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Process Pain ",
          description: "Share your grief in a safe space.",
        },
        {
          title: "Build Resilience ",
          description: "Learn tools to handle emotional waves.",
        },
        {
          title: "Rediscover Worth ",
          description: "Boost self-esteem to stand tall alone.",
        },
        {
          title: "Let Go Healthily ",
          description: "Move on without lingering hurt.",
        },
        {
          title: "Embrace Tomorrow ",
          description: "Step into a brighter future with confidence.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to heal and shine. You’ve got this!  #HealWithHeart",
      color: "from-pink-500 to-rose-500",
    },
    // 5
    {
      icon: <FaRegSmile className="text-2xl" />,
      title: "Grief Counseling",
      description:
        "Grief from loss—whether a loved one or a life change—brings waves of pain and emptiness. Counseling helps you navigate it. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Express Your Loss ",
          description: "Share feelings in a caring, safe space.",
        },
        {
          title: "Manage Emotions ",
          description: "Handle grief’s ups and downs with support.",
        },
        {
          title: "Find Meaning ",
          description: "Honor your loss while healing.",
        },
        {
          title: "Adapt Gently ",
          description: "Adjust to life’s changes at your pace.",
        },
        {
          title: "Rediscover Joy ",
          description: "Build a hopeful, meaningful future.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to find peace after loss. You’ve got this!  #HealThroughGrief",
      color: "from-teal-500 to-green-500",
    },
    // 6
    {
      icon: <FaBrain className="text-2xl" />,
      title: "Burnout Counseling",
      description:
        "Burnout leaves you drained, detached, and unmotivated from endless stress. Counseling helps you rediscover your spark. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Spot Stressors ",
          description: "Uncover what’s draining you with guidance.",
        },
        {
          title: "Set Boundaries",
          description: "Protect your energy without guilt.",
        },
        {
          title: "Recharge Daily ",
          description: "Build self-care habits to restore balance.",
        },
        {
          title: "Shift Mindset ",
          description: "Reframe thoughts to spark motivation.",
        },
        {
          title: "Thrive Again ",
          description: "Live with passion and purpose.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to rise above burnout. You’ve got this!  #RiseAboveBurnout",
      color: "from-indigo-500 to-purple-500",
    },
    // 7
    {
      icon: <FaSmile className="text-2xl" />,
      title: "Depression Counseling",
      description:
        "Depression casts a heavy shadow, stealing joy and energy, making life feel empty. Counseling helps you break free. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Share Safely ",
          description: "Express struggles in a judgment-free space.",
        },
        {
          title: "Uncover Roots ",
          description: "Explore causes like trauma with support.",
        },
        {
          title: "Challenge Darkness ",
          description: "Use CBT to shift to hopeful thoughts.",
        },
        {
          title: "Build Small Wins ",
          description: "Create routines to regain control.",
        },
        {
          title: "Rediscover Joy ",
          description: "Find meaning in life’s small moments.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to lift the fog and shine. You’ve got this!  #HopeThroughHealing",
      color: "from-blue-500 to-cyan-500",
    },
    // 8
    {
      icon: <GiMeditation className="text-2xl" />,
      title: "Anger Management Counseling",
      description:
        "Anger can burn through relationships and peace, leaving guilt behind. Counseling turns it into constructive energy. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Know Triggers ",
          description: "Pinpoint what sparks anger with support.",
        },
        {
          title: "Pause & Breathe ",
          description: "Use mindfulness to cool off fast.",
        },
        {
          title: "Express Better ",
          description: "Share feelings without sparking conflict.",
        },
        {
          title: "Set Boundaries ",
          description: "Channel anger to protect your peace.",
        },
        {
          title: "Build Harmony ",
          description: "Foster healthier, calmer connections.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to master anger and find calm. You’ve got this!  #MasterYourCalm",
      color: "from-red-500 to-orange-500",
    },
    // 9
    {
      icon: <FaChild className="text-2xl" />,
      title: "Anxiety Counseling",
      description:
        "Anxiety feels like a relentless storm—racing thoughts and dread weighing you down. Counseling helps you find peace. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Spot Fears ",
          description: "Identify what fuels worry with guidance.",
        },
        {
          title: "Soothe Nerves ",
          description: "Learn breathing to calm the chaos.",
        },
        {
          title: "Reframe Thoughts ",
          description: "Shift fears to clarity with cognitive tools.",
        },
        {
          title: "Face Challenges ",
          description: "Tackle anxieties step-by-step.",
        },
        {
          title: "Live Confidently ",
          description: "Thrive beyond worry’s grip.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to quiet the storm and shine. You’ve got this!  #ConquerAnxiety",
      color: "from-blue-400 to-indigo-500",
    },
    // 10
    {
      icon: <FaLightbulb className="text-2xl" />,
      title: "Parenting Guidance Counseling",
      description:
        "Parenting is a rollercoaster of love and doubt—wondering if you’re enough can weigh heavy. Counseling helps you parent with joy. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Know Your Child ",
          description: "Understand their needs to foster growth.",
        },
        {
          title: "Connect Deeply ",
          description: "Build trust through open talks.",
        },
        {
          title: "Guide with Love ",
          description: "Discipline to inspire, not fear.",
        },
        {
          title: "Ease Stress ",
          description: "Find balance to stay present.",
        },
        {
          title: "Strengthen Bonds ",
          description: "Create a loving, lasting connection.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to parent with confidence. You’ve got this!  #ParentWithLove",
      color: "from-yellow-500 to-orange-500",
    },
    // 11
    {
      icon: <FaHandshake className="text-2xl" />,
      title: "Body Image Counseling",
      description:
        "Body image struggles—sparked by criticism or impossible standards—can make you feel unworthy. Counseling helps you embrace your true self. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Challenge Self-Talk ",
          description: "Shift negative thoughts about your body.",
        },
        {
          title: "Value Strength ",
          description: "Focus on what your body does, not looks.",
        },
        {
          title: "Defy Norms ",
          description: "Break free from society’s beauty traps.",
        },
        {
          title: "Nurture Self-Love ",
          description: "Build habits to boost confidence.",
        },
        {
          title: "Shine as You ",
          description: "Embrace your unique beauty boldly.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to love yourself fully. You’ve got this!  #LoveYourSelf",
      color: "from-pink-500 to-rose-500",
    },
    // 12
    {
      icon: <FaMemory className="text-2xl" />,
      title: "Career Confusion Counseling",
      description:
        "Choosing a career can feel like a maze—self-doubt and pressure clouding your way. Counseling lights a path to purpose. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Discover Strengths ",
          description: "Uncover passions with guided reflection.",
        },
        {
          title: "Set Bold Goals ",
          description: "Map steps to chase your dreams.",
        },
        {
          title: "Overcome Doubt ",
          description: "Turn fear into a growth mindset.",
        },
        {
          title: "Handle Stress ",
          description: "Navigate work challenges confidently.",
        },
        {
          title: "Own Your Future ",
          description: "Pursue a career that fits you.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to find your true path. You’ve got this!  #FindYourPath",
      color: "from-indigo-500 to-blue-500",
    },
    // 13
    {
      icon: <FaSchool className="text-2xl" />,
      title: "Conflict Resolution Counseling",
      description:
        "Conflicts drain energy, creating resentment and rifts in relationships. Counseling helps you resolve disputes with empathy. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "See All Sides ",
          description: "Understand perspectives with guidance.",
        },
        {
          title: "Listen Better ",
          description: "Build trust through active listening.",
        },
        {
          title: "Stay Calm ",
          description: "Manage emotions to avoid escalation.",
        },
        {
          title: "Solve Fairly ",
          description: "Find solutions that respect everyone.",
        },
        {
          title: "Strengthen Bonds ",
          description: "Foster peace and deeper connections.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to turn conflicts into growth. You’ve got this!  #ResolveWithEmpathy",
      color: "from-yellow-400 to-yellow-600",
    },
    // 14
    {
      icon: <FaBriefcase className="text-2xl" />,
      title: "Confidence Build-Up Counseling",
      description:
        "Low confidence can make you feel small, hesitant to chase dreams. Counseling helps you rediscover your strength. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Find Your Strengths ",
          description: "Uncover what makes you unique.",
        },
        {
          title: "Challenge Doubt ",
          description: "Shift self-doubt to self-belief.",
        },
        {
          title: "Step Out Boldly ",
          description: "Take risks with guided support.",
        },
        {
          title: "Celebrate Wins ",
          description: "Build confidence through small victories.",
        },
        {
          title: "Own Your Power ",
          description: "Live with assurance and courage.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to shine with confidence. You’ve got this!  #BeConfident",
      color: "from-green-500 to-teal-500",
    },
    // 15
    {
      icon: <FaMemory className="text-2xl" />,
      title: "Memory & Concentration Counseling",
      description:
        "Struggling with focus or memory can frustrate work or studies. Counseling clears the fog and boosts your mental edge. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Uncover Causes ",
          description: "Pinpoint stress affecting your focus.",
        },
        {
          title: "Train Your Brain ",
          description: "Use exercises to sharpen memory.",
        },
        {
          title: "Stay Present ",
          description: "Learn mindfulness to boost clarity.",
        },
        {
          title: "Build Routines ",
          description: "Reduce mental clutter with structure.",
        },
        {
          title: "Take Control ",
          description: "Tackle tasks with a sharper mind.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to master focus and thrive. You’ve got this!  #FocusWithClarity",
      color: "from-purple-400 to-indigo-500",
    },
    // 16
    {
      icon: <FaSchool className="text-2xl" />,
      title: "Student Counseling",
      description:
        "Students face a storm of pressures—exams, peers, and self-doubt—dimming motivation. Counseling helps you shine through. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Tame Stress ",
          description: "Handle exam pressure with calm.",
        },
        {
          title: "Boost Skills ",
          description: "Master study and time management tricks.",
        },
        {
          title: "Build Confidence ",
          description: "Grow self-esteem to face challenges.",
        },
        {
          title: "Handle Setbacks ",
          description: "Turn failures into growth.",
        },
        {
          title: "Succeed Brightly ",
          description: "Thrive academically and beyond.",
        },
      ],
      whoItsFor:
        "Counseling empowers students to conquer and soar. You’ve got this!  #ThriveInSchool",
      color: "from-blue-400 to-blue-600",
    },
    // 17
    {
      icon: <FaBalanceScale className="text-2xl" />,
      title: "Work-Life Balance Counseling",
      description:
        "Juggling work and life can leave you drained, guilty, or stressed. Counseling helps you find balance and joy. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Set Boundaries ",
          description: "Prioritize without guilt or overwhelm.",
        },
        {
          title: "Ease Stress ",
          description: "Use relaxation to recharge daily.",
        },
        {
          title: "Manage Time ",
          description: "Blend work and life with smart routines.",
        },
        {
          title: "Tackle Challenges ",
          description: "Navigate pressures with confidence.",
        },
        {
          title: "Live Fully ",
          description: "Thrive in both work and personal life.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to harmonize life with ease. You’ve got this!  #BalanceYourLife",
      color: "from-green-400 to-green-600",
    },
    // 18
    {
      icon: <FaHeart className="text-2xl" />,
      title: "Relationship Strengthening Counseling",
      description:
        "Relationships thrive on trust, but misunderstandings or hurts can create distance. Counseling helps you reconnect with love. Here’s how, crafted to spark hope:",
      benefits: [
        {
          title: "Listen Deeply ",
          description: "Build trust through active listening.",
        },
        {
          title: "Resolve Conflicts ",
          description: "Solve disputes with empathy and care.",
        },
        {
          title: "Rebuild Trust ",
          description: "Heal wounds to restore closeness.",
        },
        {
          title: "Boost Intimacy ",
          description: "Strengthen emotional and physical bonds.",
        },
        {
          title: "Grow Together ",
          description: "Create lasting, loving connections.",
        },
      ],
      whoItsFor:
        "Counseling empowers you to nurture stronger relationships. You’ve got this!  #StrengthenLove",
      color: "from-pink-400 to-red-500",
    },
  ];

  const advantages = [
    {
      icon: <FaComments className="text-2xl" />,
      title: "Talk Therapy & Counseling",
      description:
        "Personalized one-on-one sessions with licensed therapists to address emotional challenges, life transitions, and personal growth.",
      benefits: [
        "Evidence-based approaches (CBT, DBT, Psychodynamic)",
        "Confidential environment to explore feelings",
        "Personalized treatment plans",
        "Weekly or bi-weekly sessions",
      ],
      whoItsFor:
        "Ideal for individuals dealing with depression, life transitions, self-esteem issues, or those seeking personal development",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: "24/7 Online Therapy Support",
      description:
        "Immediate access to professional help through secure video, chat, or phone sessions whenever you need it.",
      benefits: [
        "No waiting lists or scheduling conflicts",
        "Therapy from the comfort of your home",
        "Emergency sessions available",
        "Same quality as in-person therapy",
      ],
      whoItsFor:
        "Perfect for busy professionals, students, parents, or anyone needing flexible access to mental health support",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FaClinicMedical className="text-2xl" />,
      title: "Offline Counseling Centers",
      description:
        "Traditional face-to-face therapy in our calming, professionally designed centers across major cities.",
      benefits: [
        "Private, comfortable therapy rooms",
        "In-person connection with your therapist",
        "Access to therapeutic tools and resources",
        "Discreet locations for complete privacy",
      ],
      whoItsFor:
        "Those who prefer in-person interaction or need a dedicated space away from their daily environment",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Group Therapy & Workshops",
      description:
        "Healing in community with others who share similar experiences, guided by expert facilitators.",
      benefits: [
        "Reduced cost compared to individual therapy",
        "Shared experiences and peer support",
        "Specialized groups (grief, addiction, parenting)",
        "Monthly workshops on mindfulness and coping skills",
      ],
      whoItsFor:
        "Individuals who benefit from community support or want to supplement their individual therapy",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaHeart className="text-2xl" />,
      title: "Couples & Relationship Counseling",
      description:
        "Expert guidance to improve communication, resolve conflicts, and strengthen emotional connections.",
      benefits: [
        "Pre-marital counseling available",
        "Conflict resolution strategies",
        "Intimacy and trust rebuilding",
        "Parenting partnership guidance",
      ],
      whoItsFor:
        "Couples at any stage - dating, engaged, married, or considering separation",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <GiMeditation className="text-2xl" />,
      title: "Stress & Anxiety Management",
      description:
        "Proven techniques to reduce anxiety, manage stress, and cultivate emotional resilience.",
      benefits: [
        "Mindfulness and meditation training",
        "Breathing and relaxation techniques",
        "Cognitive restructuring methods",
        "Personalized stress reduction plans",
      ],
      whoItsFor:
        "Anyone experiencing work stress, panic attacks, social anxiety, or general overwhelm",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const approachSteps = [
    {
      step: 1,
      title: "Initial Assessment",
      description:
        "We begin with a comprehensive evaluation to understand your unique needs and goals.",
      icon: <FaUserMd className="text-xl" />,
    },
    {
      step: 2,
      title: "Personalized Matching",
      description:
        "Our algorithm matches you with the ideal therapist based on your preferences and needs.",
      icon: <FaHeart className="text-xl" />,
    },
    {
      step: 3,
      title: "Treatment Plan",
      description:
        "Your therapist creates a customized roadmap for your healing journey.",
      icon: <FaChartLine className="text-xl" />,
    },
    {
      step: 4,
      title: "Ongoing Support",
      description:
        "Regular sessions and check-ins to ensure continuous progress and adjustment.",
      icon: <FaShieldAlt className="text-xl" />,
    },
  ];

  const stats = [
    { number: "500+", label: "Happy Clients", icon: <FaRegSmile /> },
    { number: "98%", label: "Satisfaction Rate", icon: <FaStar /> },
    { number: "50+", label: "Expert Therapists", icon: <FaUserMd /> },
    { number: "24/7", label: "Support Available", icon: <FaClock /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-40 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 border border-purple-100"
            >
              <FaHeart className="text-pink-500 text-xl mr-3" />
              <span className="text-purple-800 font-semibold">
                Our Services
              </span>
            </motion.div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transformative{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mental Wellness
              </span>{" "}
              Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              At Raska Mon, we offer a comprehensive range of evidence-based
              therapeutic services tailored to your unique needs. Each program
              is designed by our expert clinicians to provide compassionate,
              effective care.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
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
          </motion.div>
        </div>
      </section>
      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-white to-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-purple-100 px-6 py-3 rounded-full mb-8 shadow-lg"
            >
              <FaHandHoldingHeart className="text-red-500 text-xl mr-3" />
              <span className="text-purple-800 font-semibold">
                Our Offerings
              </span>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Raska Mon{" "}
              </span>
              Services
            </h2>
            {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Below are concise, engaging summaries for each of the 18
              counseling services, crafted to inspire and resonate with readers
              on their phones. Each follows the same compact, motivational style
              with deeper emotional insights, replacing “crafted for your phone”
              with “crafted to spark hope.”
            </p> */}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {service.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="flex items-center text-sm font-semibold mb-3 text-purple-600">
                        <Target className="mr-2" /> Why It Matters:
                      </h4>
                      <ul className="space-y-3">
                        {service.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-start text-gray-600"
                          >
                            <ChevronRight className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {benefit.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {benefit.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center text-sm font-semibold mb-2 text-purple-600">
                        <FaUsers className="mr-2" /> Best For:
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.whoItsFor}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Advantages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {/* <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-purple-100 px-6 py-3 rounded-full mb-8 shadow-lg"
            >
              <FaHandHoldingHeart className="text-red-500 text-xl mr-3" />
              <span className="text-purple-800 font-semibold">
                Our Offerings
              </span>
            </motion.div> */}

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Raska Mon{" "}
              </span>
              Advantages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine clinical excellence with compassionate care to address
              your unique mental health needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${advantage.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      {advantage.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {advantage.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="flex items-center text-sm font-semibold mb-3 text-purple-600">
                        <FaChartLine className="mr-2" /> Key Benefits:
                      </h4>
                      <ul className="space-y-2">
                        {advantage.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-start text-gray-600"
                          >
                            <FaCheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="flex items-center text-sm font-semibold mb-2 text-purple-600">
                        <FaUsers className="mr-2" /> Who It's For:
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {advantage.whoItsFor}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden"
          >
            <div className="md:flex">
              <div className="p-8 md:p-12 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center mb-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg mr-4">
                    <FaBrain className="text-xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Our Unique Approach
                  </h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-lg text-gray-600 mb-8 leading-relaxed"
                >
                  At Raska Mon, we don't believe in one-size-fits-all therapy.
                  Our approach combines:
                </motion.p>

                <motion.ul
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="space-y-4 text-gray-600"
                >
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Evidence-Based Practices:
                      </strong>{" "}
                      Clinically proven therapies tailored to your needs
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Cultural Sensitivity:
                      </strong>{" "}
                      Therapists who understand Indian contexts and values
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Holistic Perspective:
                      </strong>{" "}
                      Addressing mind, body, and lifestyle factors
                    </div>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">
                        Measurable Progress:
                      </strong>{" "}
                      Regular check-ins to track your improvement
                    </div>
                  </li>
                </motion.ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 md:p-12 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {approachSteps.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ x: 5 }}
                      className="flex items-start group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookAppointmentCTA />
        </div>
      </section>
    </div>
  );
};

export default Services;
