import React, { useContext, useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import { Check, SquareCheckBig, Video, Image } from "lucide-react";
import { AdminContext } from "@/context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [docVideo, setDocVideo] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meetEmail, setMeetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [degree, setDegree] = useState("");
  const [language, setLanguage] = useState(""); // new required field
  const [patients, setPatients] = useState(""); // optional
  const [rating, setRating] = useState(""); // optional
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!docImg) {
        toast.error("Image Not Selected");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("image", docImg);
      if (docVideo) formData.append("video", docVideo);

      formData.append("name", name);
      formData.append("email", email);
      formData.append("meetEmail", meetEmail);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append("language", language);

      if (patients) formData.append("patients", Number(patients));
      if (rating) formData.append("rating", Number(rating));

      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }),
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        {
          headers: {
            atoken: aToken,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        toast.success(data.message);

        setDocImg(null);
        setDocVideo(null);
        setName("");
        setEmail("");
        setMeetEmail("");
        setPassword("");
        setExperience("");
        setFees("");
        setAbout("");
        setSpeciality("");
        setDegree("");
        setLanguage("");
        setPatients("");
        setRating("");
        setAddress1("");
        setAddress2("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name &&
      email &&
      meetEmail &&
      password &&
      experience &&
      fees &&
      about &&
      speciality &&
      degree &&
      language &&
      address1 &&
      address2 &&
      docImg
    );
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="m-2 w-full max-w-[800px] flex flex-col items-center sm:items-start justify-center gap-4 p-4 bg-gray-50 rounded"
    >
      <p className="text-2xl sm:text-3xl font-semibold tracking-wide text-primary">
        Doctor Details
      </p>

      <div className="flex flex-col items-center sm:items-start justify-center gap-4 w-full">
        {/* File Upload Section */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Image Upload */}
          <div>
            <label htmlFor="doc-img">
              <div className="min-w-44 p-2.5 rounded border border-gray-300 bg-gray-100 text-gray-500 flex flex-col items-center justify-center gap-2 cursor-crosshair active:scale-[95%] transition-all duration-75 ease-in">
                <div className="relative">
                  <img
                    className="size-32 sm:size-24 rounded-full border border-gray-300 object-cover"
                    src={
                      docImg ? URL.createObjectURL(docImg) : assets.upload_area
                    }
                    alt="Doctor profile"
                  />
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
                    <Image size={16} />
                  </div>
                </div>
                <p className="flex items-center justify-center gap-2">
                  {docImg ? "Image Uploaded" : "Upload Photo"}
                  {docImg && <Check size={18} className="text-primary" />}
                </p>
              </div>
            </label>
            <input
              onChange={(e) => setDocImg(e.target.files[0])}
              type="file"
              id="doc-img"
              accept="image/*"
              hidden
            />
          </div>

          {/* Video Upload */}
          <div>
            <label htmlFor="doc-video">
              <div
                className={`min-w-44 p-2.5 rounded border border-gray-300 ${docVideo ? "bg-gray-100" : "bg-gray-50"
                  } text-gray-500 flex flex-col items-center justify-center gap-2 cursor-crosshair active:scale-[95%] transition-all duration-75 ease-in`}
              >
                <div className="relative">
                  {docVideo ? (
                    <video className="size-32 sm:size-24 rounded border border-gray-300 object-cover">
                      <source
                        src={URL.createObjectURL(docVideo)}
                        type={docVideo.type}
                      />
                    </video>
                  ) : (
                    <div className="size-32 sm:size-24 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
                      <Video size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
                    <Video size={16} />
                  </div>
                </div>
                <p className="flex items-center justify-center gap-2">
                  {docVideo ? "Video Uploaded" : "Upload Intro Video"}
                  {docVideo && <Check size={18} className="text-primary" />}
                </p>
              </div>
            </label>
            <input
              onChange={(e) => setDocVideo(e.target.files[0])}
              type="file"
              id="doc-video"
              accept="video/*"
              hidden
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-start items-start gap-4 sm:gap-20 text-gray-600">
          <div className="flex flex-col items-start justify-center gap-4">
            <div className="flex flex-col items-stretch gap-1">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="text"
                placeholder="Fullname"
                required
              />
            </div>

            <div className="flex flex-col items-stretch gap-1">
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="email"
                placeholder="Email Id"
                required
              />
            </div>
            <input
              value={meetEmail}
              onChange={(e) => setMeetEmail(e.target.value)}
              className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              type="email"
              placeholder="Google Meet Email"
              required
            />

            <div className="flex flex-col items-stretch gap-1">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="password"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
              >
                <option value="" disabled selected>
                  Select
                </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={`${i + 1} Year${i > 0 ? "s" : ""}`}>
                    {i + 1} Year{i > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-stretch gap-1">
              <p>Appointment Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="number"
                placeholder="₹₹"
                required
              />
            </div>
            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="text"
                placeholder="Line 1"
                required
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="text"
                placeholder="Line 2"
                required
              />
            </div>
          </div>

          <div className="flex flex-col items-start justify-center gap-4">
            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
              >
                <option value="" disabled selected>
                  Select
                </option>
                <option value="Psychiatrist">Psychiatrists</option>
                <option value="Counsellor">Counsellor</option>
                <option value="Psychologist">Psychologist</option>
                <option value="Clinical Psychologist">
                  Clinical Psychologist
                </option>
                <option value="Therapist">Therapist</option>
                <option value="Child and Adolescent Psychiatrist">
                  Child & Adolescent Psychiatrist
                </option>
                <option value="Geriatric Psychiatrist">
                  Geriatric Psychiatrist
                </option>
                <option value="Addiction Psychiatrist">
                  Addiction Psychiatrist
                </option>
              </select>
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="text"
                placeholder="Degree"
                required
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Language</p>
              <input
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="text"
                placeholder="Languages Known"
                required
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Patients</p>
              <input
                onChange={(e) => setPatients(e.target.value)}
                value={patients}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="number"
                placeholder="Number of Patients"
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Rating</p>
              <input
                onChange={(e) => setRating(e.target.value)}
                value={rating}
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Rating (0-5)"
              />
            </div>

            <div className="flex flex-col items-stretch gap-1 w-full">
              <p>About</p>
              <textarea
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                placeholder="Write a description to highlight the physician's approach"
                required
                className="px-2.5 py-2 w-[80vw] sm:w-80 placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 h-28 sm:h-[82px] resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end w-[93.6%] mt-4">
        <button
          type="submit"
          // disabled={!isFormValid() || loading}
          className={`py-3 px-5 rounded w-[50vw] sm:w-fit flex items-center justify-center gap-2 transition-all duration-200 ease-in `}
        >
          <span>{loading ? "Adding..." : "Add Doctor"}</span>
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SquareCheckBig size={18} />
          )}
        </button>
      </div>
      <div className="flex justify-center sm:justify-end w-[93.6%] mt-4">
        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className={`py-3 px-5 rounded w-[50vw] sm:w-fit flex items-center justify-center gap-2 transition-all duration-200 ease-in ${!isFormValid() || loading
            ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
            : "bg-primary text-white border border-primary hover:opacity-90 active:scale-[97%]"
            }`}
        >
          <span>{loading ? "Adding..." : "Add Doctor"}</span>
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <SquareCheckBig size={18} />
          )}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
