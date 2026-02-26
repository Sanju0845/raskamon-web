import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaUserMd,
  FaVideo,
  FaArrowRight,
  FaHeart,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";

const BookAppointmentCTA = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const handleAssessmentClick = () => {
    if (!token) {
      navigate("/login?type=login");
    } else {
      navigate("/assessments");
    }
  };

  const features = [
    {
      icon: <FaUserMd className="text-2xl" />,
      title: "Expert Therapists",
      desc: "Licensed professionals with specialized training",
    },
    {
      icon: <FaVideo className="text-2xl" />,
      title: "Virtual Sessions",
      desc: "Secure video consultations from anywhere",
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: "Flexible Scheduling",
      desc: "Book sessions at your convenience",
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "100% Confidential",
      desc: "Your privacy is our top priority",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 relative overflow-hidden shadow-xl sm:shadow-2xl mx-2 sm:mx-0"
        >
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
              className="absolute top-4 sm:top-6 right-4 sm:right-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 bg-white/10 rounded-full"
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
              className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-24 xl:h-24 bg-white/10 rounded-full"
            />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-10 lg:mb-12"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full mb-6 sm:mb-8 border border-white/30"
              >
                <FaHeart className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  Start Your Healing Journey
                </span>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 px-2 sm:px-0">
                Ready to Begin Your{" "}
                <span className="text-yellow-300 block sm:inline mt-1 sm:mt-0">
                  Healing Journey
                </span>
                ?
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                Our compassionate team of licensed therapists is here to support
                you every step of the way. Take the first step towards better
                mental health today.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center border border-white/20"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                    {React.cloneElement(feature.icon, {
                      className: "text-sm sm:text-base lg:text-lg",
                    })}
                  </div>
                  <h3 className="text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-purple-100 text-xs sm:text-sm leading-tight">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => navigate("/doctors")}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white text-purple-600 px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 rounded-full text-base sm:text-lg font-semibold shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 w-full xs:w-auto justify-center"
              >
                <FaCalendarAlt className="group-hover:scale-110 transition-transform text-sm sm:text-base" />
                <span>Book an Appointment</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm sm:text-base" />
              </motion.button>

              <motion.button
                onClick={handleAssessmentClick}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 rounded-full text-base sm:text-lg font-semibold border-2 border-white/30 transition-all duration-300 flex items-center gap-2 w-full xs:w-auto justify-center"
              >
                <span>Take Assessment</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm sm:text-base" />
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-8 sm:mt-10 lg:mt-12 text-center"
            >
              <p className="text-purple-100 text-xs sm:text-sm mb-3 sm:mb-4 px-2">
                Trusted by 500+ clients • 98% satisfaction rate • 24/7 support
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 text-purple-100">
                {/* <div className="flex items-center gap-1 sm:gap-2">
                  <FaShieldAlt className="text-green-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm">HIPAA Compliant</span>
                </div> */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <FaUserMd className="text-green-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm">
                    Licensed Therapists
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <FaVideo className="text-green-300 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm">Secure Video Calls</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookAppointmentCTA;
