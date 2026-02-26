import { AdminContext } from "@/context/AdminContext";
import React, { useContext, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { Loader2, SquarePen, Trash } from "lucide-react";
import EditDoctorForm from "./EditDoctorForm";
import axios from "axios";
import { toast } from "react-toastify";
const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } =
    useContext(AdminContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [id, setId] = useState("");

  useEffect(() => {
    if (aToken) {
      const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 100));
      const dataFetch = getAllDoctors();
      Promise.all([minLoadingTime, dataFetch]).then(() => setIsLoading(false));
    }
  }, [aToken]);

  const fetchDoctorById = async (id) => {
    try {
      const token = localStorage.getItem("aToken");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/doctor/${id}`,
        {
          headers: {
            atoken: token,
          },
        }
      );

      setData(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(response.message);
    }
  };

  const DeleteDoctorById = async (id) => {
    try {
      const token = localStorage.getItem("aToken");
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/delete/${id}`,
        {
          headers: {
            atoken: token,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDoctorById(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="size-14 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="m-2 w-full sm:w-[80vw] flex flex-col items-center sm:items-start justify-center pb-2 gap-4 sm:p-4 bg-gray-50 rounded">
      <h1 className="text-2xl mt-3 sm:mt-0 sm:text-3xl font-semibold px-1 tracking-wide text-primary">
        All Doctors
      </h1>

      <div className="w-full flex flex-row items-center justify-center sm:justify-start flex-wrap gap-4 p-1 sm:max-h-[81.5vh] sm:overflow-y-scroll doctorlist-scrollbar">
        {doctors.map((item, index) => (
          <motion.div
            className="border border-primary/50 rounded-lg w-[160px] sm:w-56 overflow-hidden group hover:scale-[102%] transition-all duration-200 ease-in bg-white shadow-sm hover:shadow-md"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: index * 0.05 }}
          >
            {/* Fixed aspect ratio image container */}
            <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-primary/10 flex items-center justify-center group">
              {/* Image */}
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                src={item.image}
                alt="doctor image"
              />

              {/* Icons container */}
              <div className="absolute top-3 right-3 flex gap-2">
                {/* Edit Icon */}
                <div className="bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white transition">
                  <SquarePen
                    onClick={() => {
                      setId(item._id);
                      setIsOpen(true);
                    }}
                    className="w-5 h-5 cursor-pointer text-blue-600"
                  />
                </div>

                {/* Delete Icon */}
                <div className="bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white transition">
                  <Trash
                    onClick={() => {
                      DeleteDoctorById(item._id);
                    }}
                    className="w-5 h-5 cursor-pointer text-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="px-3 py-3 flex flex-col items-stretch justify-center">
              <p
                className="text-neutral-800 text-sm sm:text-base font-medium truncate"
                title={item.name}
              >
                {item.name}
              </p>
              <p
                className="text-zinc-600 text-xs sm:text-sm truncate mt-1"
                title={item.speciality}
              >
                {item.speciality}
              </p>
              <div className="flex items-center justify-start mt-3 gap-2">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <input
                        onChange={() => changeAvailability(item._id)}
                        className="size-4 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-150 ease-in-out accent-primary"
                        type="checkbox"
                        checked={item.available}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="px-3 py-2.5 mb-1 shadow-xl shadow-black/20 bg-primary text-white border-none rounded-[6px] text-sm text-center capitalize"
                    >
                      Click to change <br /> Doctor's availability
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  {item.available ? "Available" : "Unavailable"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-[850px] mx-4">
            {/* Form */}
            <EditDoctorForm
              data={data}
              setIsOpen={setIsOpen}
              getAllDoctors={getAllDoctors}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
