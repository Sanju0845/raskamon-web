import { AdminContext } from "@/context/AdminContext";
import { AppContext } from "@/context/AppContext";
import React, { useContext, useEffect, useState } from "react";
import {
  X,
  FileText,
  User,
  Calendar,
  Clock,
  DollarSign,
  Video,
  Phone,
  MapPin,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProgressBar from "@/components/ProgressBar";
import { motion, AnimatePresence } from "motion/react";

const AllApointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, currencySymbol } =
    useContext(AppContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // loader progress simulation
  const simulateProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const progressInterval = simulateProgress();

      await getAllAppointments();

      setLoadingProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full flex flex-col items-center p-4 md:p-6 bg-gray-50 rounded-lg">
      {/* Profile Image Popup view */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            draggable="false"
            className="size-[300px] sm:size-[450px] object-cover rounded-2xl border bg-primary select-none motion-preset-expand motion-duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            All Appointments
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {appointments.length} total
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px] flex-col">
              <ProgressBar progress={loadingProgress} />
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <div className="col-span-1 flex items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    #
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Patient
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Age
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date & Time
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Doctor
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Fees
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {appointments.length === 0 && !isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    No appointments found
                  </div>
                ) : (
                  appointments
                    .slice(0)
                    .reverse()
                    .map((item, index) => (
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 hover:bg-gray-50 transition-colors"
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                      >
                        {/* Appointment number */}
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-medium text-gray-600">
                            {index + 1}
                          </span>
                        </div>

                        {/* Patient info */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="relative">
                            <img
                              className="size-10 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              src={item.userData.image}
                              alt="Patient"
                              onClick={() =>
                                setSelectedImage(item.userData.image)
                              }
                            />
                            {item.cancelled && (
                              <div className="absolute inset-0 bg-red-500/10 rounded-lg border border-red-500/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.userData.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.userData.email}
                            </p>
                          </div>
                        </div>

                        {/* Age */}
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm text-gray-600">
                            {!isNaN(Date.parse(item.userData.dob))
                              ? calculateAge(item.userData.dob)
                              : "N/A"}
                          </span>
                        </div>

                        {/* Date & Time */}
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {slotDateFormat(item.slotDate)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              {item.slotTime}
                            </span>
                          </div>
                        </div>

                        {/* Doctor info */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.docData.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.docData.speciality}
                            </p>
                          </div>
                        </div>

                        {/* Fees */}
                        <div className="col-span-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {currencySymbol}
                            {item.amount}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          {item.cancelled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Cancelled
                            </span>
                          ) : item.isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() =>
                                        cancelAppointment(item._id)
                                      }
                                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="size-5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Cancel Appointment
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(item);
                                    setShowDetailsModal(true);
                                  }}
                                  className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                  <FileText className="size-5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </motion.div>
                    ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 p-6 border-b border-gray-200 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Appointment Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {selectedAppointment._id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <div>
                    {selectedAppointment.cancelled ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Cancelled
                      </span>
                    ) : selectedAppointment.isCompleted ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Scheduled
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created:{" "}
                    {new Date(
                      selectedAppointment.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>

                {/* Patient and Doctor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={selectedAppointment.userData.image}
                          alt="Patient"
                          className="size-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border border-gray-200">
                          <User className="size-4 text-blue-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedAppointment.userData.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedAppointment.userData.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">
                          {selectedAppointment.userData.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">
                          {!isNaN(Date.parse(selectedAppointment.userData.dob))
                            ? `${calculateAge(
                                selectedAppointment.userData.dob
                              )} years`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Card */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={selectedAppointment.docData.image}
                          alt="Doctor"
                          className="size-12 rounded-lg object-cover border border-primary/20 bg-primary/10"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full border border-gray-200">
                          <User className="size-4 text-green-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedAppointment.docData.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedAppointment.docData.speciality}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Session</p>
                        <p className="font-medium flex items-center gap-1">
                          {selectedAppointment.sessionType === "Online" ? (
                            <Video className="size-4 text-blue-500" />
                          ) : (
                            <MapPin className="size-4 text-green-500" />
                          )}
                          {selectedAppointment.sessionType}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fees</p>
                        <p className="font-medium">
                          {currencySymbol}
                          {selectedAppointment.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="size-5 text-gray-500" />
                        <h3 className="font-medium text-gray-700">Date</h3>
                      </div>
                      <p className="text-gray-900">
                        {slotDateFormat(selectedAppointment.slotDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="size-5 text-gray-500" />
                        <h3 className="font-medium text-gray-700">Time</h3>
                      </div>
                      <p className="text-gray-900">
                        {selectedAppointment.slotTime}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="size-5 text-gray-500" />
                        <h3 className="font-medium text-gray-700">Payment</h3>
                      </div>
                      <p className="text-gray-900">
                        {selectedAppointment.payment ? (
                          <span className="text-green-600 font-medium">
                            Paid
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Not Paid
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedAppointment.reasonForVisit && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Reason for Visit
                      </h3>
                      <p className="text-gray-900">
                        {selectedAppointment.reasonForVisit}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.briefNotes && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
                      <p className="text-gray-900 whitespace-pre-line">
                        {selectedAppointment.briefNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {selectedAppointment.emergencyContact &&
                  selectedAppointment.emergencyContact.name && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="size-5 text-red-500" />
                        <h3 className="font-medium text-gray-700">
                          Emergency Contact
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {selectedAppointment.emergencyContact.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {selectedAppointment.emergencyContact.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Relationship</p>
                          <p className="font-medium">
                            {selectedAppointment.emergencyContact.relationship}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllApointments;
