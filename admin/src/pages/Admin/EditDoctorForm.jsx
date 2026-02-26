import React, { useContext, useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import { Check, SquareCheckBig, Video, Image } from "lucide-react";
import { AdminContext } from "@/context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const EditDoctorForm = ({ setIsOpen, data, getAllDoctors }) => {
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
  const [language, setLanguage] = useState("");
  const [patients, setPatients] = useState("");
  const [rating, setRating] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);
  // Prefill the form with doctor data
  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setExperience(data.experience || "");
      setFees(data.fees || "");
      setAbout(data.about || "");
      setSpeciality(data.speciality || "");
      setDegree(data.degree || "");
      setAddress1(data.address?.line1 || "");
      setAddress2(data.address?.line2 || "");
      setLanguage(data?.languageSpoken || "");
      setPatients(data?.patients || "");
      setMeetEmail(data?.meetEmail || "");
      setRating(data?.rating || "");
      setDocImg(null); // User can replace image
      setDocVideo(null); // User can replace video
    }
  }, [data]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      if (docImg) formData.append("image", docImg);
      if (docVideo) formData.append("video", docVideo);

      formData.append("name", name);
      formData.append("email", email);
      if (password) formData.append("password", password); // only if updated
      formData.append("experience", experience);
      formData.append("fees", Number(fees));
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }),
      );
      formData.append("meetEmail", meetEmail);
      formData.append("language", language);
      if (patients) formData.append("patients", Number(patients));
      if (rating) formData.append("rating", Number(rating));

      const { data: response } = await axios.put(
        backendUrl + `/api/admin/update/doctor/${data._id}`,
        formData,
        {
          headers: {
            atoken: aToken, // lowercase for backend auth
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.success) {
        await getAllDoctors(); // refresh the context doctors state
        setIsOpen(false);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name &&
      email &&
      experience &&
      fees &&
      about &&
      speciality &&
      degree &&
      address1 &&
      address2
    );
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="relative h-[70vh] flex flex-col bg-gray-50 rounded"
    >
      {/* Title */}
      <p className="text-2xl p-4 sm:text-3xl font-semibold tracking-wide text-primary">
        Doctor Details
      </p>

      {/* Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        type="button"
        className="absolute top-4 right-4 sm:right-6 text-white bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition"
      >
        ✕
      </button>

      <div className="flex-1 overflow-y-auto p-4">
        {/* File Upload Section */}
        <div className="flex flex-col sm:flex-row gap-4 w-full flex-wrap justify-center sm:justify-start">
          {/* Image Upload */}
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="doc-img">
              <div className="p-2.5 rounded border border-gray-300 bg-gray-100 text-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-[95%]">
                <div className="relative">
                  <img
                    className="w-32 h-32 sm:w-24 sm:h-24 rounded-full border border-gray-300 object-cover"
                    src={
                      docImg
                        ? URL.createObjectURL(docImg)
                        : data.image || assets.upload_area
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
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="doc-video">
              <div
                className={`p-2.5 rounded border border-gray-300 ${
                  docVideo ? "bg-gray-100" : "bg-gray-50"
                } text-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-[95%]`}
              >
                <div className="relative">
                  {docVideo ? (
                    <video className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 object-cover">
                      <source
                        src={URL.createObjectURL(docVideo)}
                        type={docVideo.type}
                      />
                    </video>
                  ) : data.video ? (
                    <video className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 object-cover">
                      <source src={data.video} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
                      <Video size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
                    <Video size={16} />
                  </div>
                </div>
                <p className="flex items-center justify-center gap-2">
                  {docVideo || data.video
                    ? "Video Uploaded"
                    : "Upload Intro Video"}
                  {(docVideo || data.video) && (
                    <Check size={18} className="text-primary" />
                  )}
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

        {/* Form Fields */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-4 sm:gap-8 flex-wrap">
          {/* Left Column */}
          <div className="flex flex-col flex-1 gap-4 min-w-[250px]">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <p>Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Fullname"
                required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <p>Email</p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Id"
                required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
              <input
                value={meetEmail}
                onChange={(e) => setMeetEmail(e.target.value)}
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="email"
                placeholder="Google Meet Email"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <p>Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Leave blank to keep existing"
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1">
              <p>Experience</p>
              <select
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
              >
                <option value="" disabled>
                  Select
                </option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={`${i + 1} Year${i > 0 ? "s" : ""}`}>
                    {i + 1} Year{i > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fees */}
            <div className="flex flex-col gap-1">
              <p>Appointment Fees</p>
              <input
                onChange={(e) => setFees(e.target.value)}
                value={fees}
                type="number"
                placeholder="₹₹"
                required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
            </div>
            {/* Address */}
            <div className="flex flex-col gap-1">
              <p>Address</p>
              <input
                onChange={(e) => setAddress1(e.target.value)}
                value={address1}
                type="text"
                placeholder="Line 1"
                // required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
              <input
                onChange={(e) => setAddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="Line 2"
                // required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col flex-1 gap-4 min-w-[250px]">
            {/* Speciality */}
            <div className="flex flex-col gap-1">
              <p>Speciality</p>
              <select
                onChange={(e) => setSpeciality(e.target.value)}
                value={speciality}
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Psychiatrist">Psychiatrists</option>
                <option value="Clinical Psychologists">
                  Clinical Psychologist
                </option>
                <option value="Therapists">Therapist</option>
                <option value="Child and Adolescent Psychiatrists">
                  Child & Adolescent Psychiatrists
                </option>
                <option value="Geriatric Psychiatrists">
                  Geriatric Psychiatrists
                </option>
                <option value="Addiction Psychiatrist">
                  Addiction Psychiatrist
                </option>
              </select>
            </div>

            {/* Degree */}
            <div className="flex flex-col gap-1">
              <p>Education</p>
              <input
                onChange={(e) => setDegree(e.target.value)}
                value={degree}
                type="text"
                placeholder="Degree"
                required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Language</p>
              <input
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
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
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="number"
                placeholder="Number of Patients"
              />
            </div>

            <div className="flex flex-col w-full items-stretch gap-1">
              <p>Rating</p>
              <input
                onChange={(e) => setRating(e.target.value)}
                value={rating}
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Rating (0-5)"
              />
            </div>

            {/* About */}
            <div className="flex flex-col gap-1">
              <p>About</p>
              <textarea
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                placeholder="Write a description to highlight the physician's approach"
                required
                className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 h-28 sm:h-32 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center sm:justify-end w-full mt-4">
          <button
            type="submit"
            className={`py-3 px-5 rounded w-[50vw] sm:w-fit flex items-center justify-center gap-2 transition-all duration-200 ease-in bg-primary text-white border border-primary hover:opacity-90 active:scale-[97%]`}
          >
            <span>{loading ? "Updating..." : "Update Doctor"}</span>
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SquareCheckBig size={18} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditDoctorForm;
// import React, { useContext, useState, useEffect } from "react";
// import { assets } from "@/assets/assets";
// import { Check, SquareCheckBig, Video, Image } from "lucide-react";
// import { AdminContext } from "@/context/AdminContext";
// import { toast } from "react-toastify";
// import axios from "axios";

// const EditDoctorForm = ({ setIsOpen, data, getAllDoctors }) => {
//   const [docImg, setDocImg] = useState(null);
//   const [docVideo, setDocVideo] = useState(null);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [experience, setExperience] = useState("");
//   const [fees, setFees] = useState("");
//   const [about, setAbout] = useState("");
//   const [speciality, setSpeciality] = useState("");
//   const [degree, setDegree] = useState("");
//   const [language, setLanguage] = useState("");
//   const [patients, setPatients] = useState("");
//   const [rating, setRating] = useState("");
//   const [address1, setAddress1] = useState("");
//   const [address2, setAddress2] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { backendUrl, aToken } = useContext(AdminContext);

//   // Prefill the form with doctor data
//   useEffect(() => {
//     if (data) {
//       setName(data.name || "");
//       setEmail(data.email || "");
//       setExperience(data.experience || "");
//       setFees(data.fees || "");
//       setAbout(data.about || "");
//       setSpeciality(data.speciality || "");
//       setDegree(data.degree || "");
//       setLanguage(data.languageSpoken || "");
//       setPatients(data.patients || "");
//       setRating(data.rating || "");
//       setAddress1(data.address?.line1 || "");
//       setAddress2(data.address?.line2 || "");
//       setDocImg(null); // User can replace image
//       setDocVideo(null); // User can replace video
//     }
//   }, [data]);

//   const onSubmitHandler = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     try {
//       const formData = new FormData();

//       if (docImg) formData.append("image", docImg);
//       if (docVideo) formData.append("video", docVideo);

//       formData.append("name", name);
//       formData.append("email", email);
//       if (password) formData.append("password", password);
//       formData.append("experience", experience);
//       formData.append("fees", Number(fees));
//       formData.append("about", about);
//       formData.append("speciality", speciality);
//       formData.append("degree", degree);
//       formData.append("language", language);
//       if (patients) formData.append("patients", Number(patients));
//       if (rating) formData.append("rating", Number(rating));
//       formData.append(
//         "address",
//         JSON.stringify({ line1: address1, line2: address2 })
//       );

//       const { data: response } = await axios.put(
//         backendUrl + `/api/admin/update/doctor/${data._id}`,
//         formData,
//         {
//           headers: {
//             atoken: aToken,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (response.success) {
//         await getAllDoctors();
//         setIsOpen(false);
//         toast.success(response.message);
//       } else {
//         toast.error(response.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFormValid = () => {
//     return (
//       name &&
//       email &&
//       experience &&
//       fees &&
//       about &&
//       speciality &&
//       degree &&
//       language &&
//       address1 &&
//       address2
//     );
//   };

//   return (
//     <form
//       onSubmit={onSubmitHandler}
//       className="relative m-2 w-full max-w-[800px] max-h-[80vh] h-full overflow-x-auto flex flex-col items-center sm:items-start justify-center gap-4 p-4 bg-gray-50 rounded  overflow-y-auto"
//     >
//       <p className="text-2xl sm:text-3xl font-semibold tracking-wide text-primary">
//         Doctor Details
//       </p>

//       <button
//         onClick={() => setIsOpen(false)}
//         type="button"
//         className="absolute top-4 right-4 sm:right-6 text-white bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition"
//       >
//         ✕
//       </button>

//       <div className="flex flex-col max-sm:mt-[60rem] max-md:mt-[45rem]  mt-20 items-center sm:items-start justify-center gap-4 w-full">
//         {/* File Upload Section */}
//         <div className="flex flex-col sm:flex-row gap-4 w-full flex-wrap justify-center sm:justify-start">
//           {/* Image Upload */}
//           <div className="flex-1 min-w-[150px]">
//             <label htmlFor="doc-img">
//               <div className="p-2.5 rounded border border-gray-300 bg-gray-100 text-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-[95%]">
//                 <div className="relative">
//                   <img
//                     className="w-32 h-32 sm:w-24 sm:h-24 rounded-full border border-gray-300 object-cover"
//                     src={
//                       docImg
//                         ? URL.createObjectURL(docImg)
//                         : data.image || assets.upload_area
//                     }
//                     alt="Doctor profile"
//                   />
//                   <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
//                     <Image size={16} />
//                   </div>
//                 </div>
//                 <p className="flex items-center justify-center gap-2">
//                   {docImg ? "Image Uploaded" : "Upload Photo"}
//                   {docImg && <Check size={18} className="text-primary" />}
//                 </p>
//               </div>
//             </label>
//             <input
//               onChange={(e) => setDocImg(e.target.files[0])}
//               type="file"
//               id="doc-img"
//               accept="image/*"
//               hidden
//             />
//           </div>

//           {/* Video Upload */}
//           <div className="flex-1 min-w-[150px]">
//             <label htmlFor="doc-video">
//               <div
//                 className={`p-2.5 rounded border border-gray-300 ${
//                   docVideo ? "bg-gray-100" : "bg-gray-50"
//                 } text-gray-500 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-75 active:scale-[95%]`}
//               >
//                 <div className="relative">
//                   {docVideo ? (
//                     <video className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 object-cover">
//                       <source
//                         src={URL.createObjectURL(docVideo)}
//                         type={docVideo.type}
//                       />
//                     </video>
//                   ) : data.video ? (
//                     <video className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 object-cover">
//                       <source src={data.video} type="video/mp4" />
//                     </video>
//                   ) : (
//                     <div className="w-32 h-32 sm:w-24 sm:h-24 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
//                       <Video size={32} className="text-gray-400" />
//                     </div>
//                   )}
//                   <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
//                     <Video size={16} />
//                   </div>
//                 </div>
//                 <p className="flex items-center justify-center gap-2">
//                   {docVideo || data.video
//                     ? "Video Uploaded"
//                     : "Upload Intro Video"}
//                   {(docVideo || data.video) && (
//                     <Check size={18} className="text-primary" />
//                   )}
//                 </p>
//               </div>
//             </label>
//             <input
//               onChange={(e) => setDocVideo(e.target.files[0])}
//               type="file"
//               id="doc-video"
//               accept="video/*"
//               hidden
//             />
//           </div>
//         </div>

//         {/* Form Fields */}
//         <div className="flex flex-col md:flex-row w-full justify-between gap-4 sm:gap-8 flex-wrap">
//           {/* Left Column */}
//           <div className="flex flex-col flex-1 gap-4 min-w-[250px]">
//             <div className="flex flex-col gap-1">
//               <p>Name</p>
//               <input
//                 onChange={(e) => setName(e.target.value)}
//                 value={name}
//                 type="text"
//                 placeholder="Fullname"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Email</p>
//               <input
//                 onChange={(e) => setEmail(e.target.value)}
//                 value={email}
//                 type="email"
//                 placeholder="Email Id"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Password</p>
//               <input
//                 onChange={(e) => setPassword(e.target.value)}
//                 value={password}
//                 type="password"
//                 placeholder="Leave blank to keep existing"
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Experience</p>
//               <select
//                 onChange={(e) => setExperience(e.target.value)}
//                 value={experience}
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
//               >
//                 <option value="" disabled>
//                   Select
//                 </option>
//                 {Array.from({ length: 10 }, (_, i) => (
//                   <option key={i} value={`${i + 1} Year${i > 0 ? "s" : ""}`}>
//                     {i + 1} Year{i > 0 ? "s" : ""}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Appointment Fees</p>
//               <input
//                 onChange={(e) => setFees(e.target.value)}
//                 value={fees}
//                 type="number"
//                 placeholder="₹₹"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Patients</p>
//               <input
//                 onChange={(e) => setPatients(e.target.value)}
//                 value={patients}
//                 type="number"
//                 min="0"
//                 placeholder="Number of Patients"
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Rating</p>
//               <input
//                 onChange={(e) => setRating(e.target.value)}
//                 value={rating}
//                 type="number"
//                 min="0"
//                 max="5"
//                 step="0.1"
//                 placeholder="Rating (0-5)"
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="flex flex-col flex-1 gap-4 min-w-[250px]">
//             <div className="flex flex-col gap-1">
//               <p>Speciality</p>
//               <select
//                 onChange={(e) => setSpeciality(e.target.value)}
//                 value={speciality}
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 appearance-none"
//               >
//                 <option value="" disabled>
//                   Select
//                 </option>
//                 <option value="Psychiatrist">Psychiatrists</option>
//                 <option value="Counsellor">Counsellor</option>
//                 <option value="Psychologist">Psychologist</option>
//                 <option value="Clinical Psychologists">
//                   Clinical Psychologist
//                 </option>
//                 <option value="Therapists">Therapist</option>
//                 <option value="Child and Adolescent Psychiatrists">
//                   Child & Adolescent Psychiatrists
//                 </option>
//                 <option value="Geriatric Psychiatrists">
//                   Geriatric Psychiatrists
//                 </option>
//                 <option value="Addiction Psychiatrist">
//                   Addiction Psychiatrist
//                 </option>
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Education</p>
//               <input
//                 onChange={(e) => setDegree(e.target.value)}
//                 value={degree}
//                 type="text"
//                 placeholder="Degree"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <p>Language</p>
//               <input
//                 onChange={(e) => setLanguage(e.target.value)}
//                 value={language}
//                 type="text"
//                 placeholder="Languages Spoken"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <p>About</p>
//               <textarea
//                 onChange={(e) => setAbout(e.target.value)}
//                 value={about}
//                 placeholder="Write a description to highlight the physician's approach"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100 h-28 sm:h-32 resize-none"
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <p>Address</p>
//               <input
//                 onChange={(e) => setAddress1(e.target.value)}
//                 value={address1}
//                 type="text"
//                 placeholder="Line 1"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//               <input
//                 onChange={(e) => setAddress2(e.target.value)}
//                 value={address2}
//                 type="text"
//                 placeholder="Line 2"
//                 required
//                 className="px-2.5 py-2 w-full placeholder:text-gray-400 tracking-wide font-normal rounded border border-gray-300 bg-gray-100"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submit */}
//         <div className="flex justify-center sm:justify-end w-full mt-4">
//           <button
//             type="submit"
//             disabled={!isFormValid() || loading}
//             className={`py-3 px-5 rounded w-[50vw] sm:w-fit flex items-center justify-center gap-2 transition-all duration-200 ease-in ${
//               !isFormValid() || loading
//                 ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
//                 : "bg-primary text-white border border-primary hover:opacity-90 active:scale-[97%]"
//             }`}
//           >
//             <span>{loading ? "Updating..." : "Update Doctor"}</span>
//             {loading ? (
//               <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
//             ) : (
//               <SquareCheckBig size={18} />
//             )}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// };

// export default EditDoctorForm;
