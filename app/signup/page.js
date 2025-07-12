"use client";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { PiKeyReturnFill } from "react-icons/pi";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image"; // Make sure Image is imported
import Link from "next/link";
import { useAuth } from "../context/Authcontext";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import TopLoader from "../components/TopLoader";
import { useLoading } from "../context/LoadingContext";

// Dynamically import ToastContainer. This will load it in a separate chunk.
const DynamicToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false } // Essential for client-side libraries like react-toastify
);

const Signup = () => {
  const router = useRouter();
  const { user,login } = useAuth();
  const { setLoading } = useLoading()
  const [isSubmitting, setisSubmitting] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])


  useEffect(() => {
    if (user) {
      router.prefetch("/");
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setisSubmitting(true);
    setLoading(true)
    try {
      await axios.post(`/api/auth/signup`, {
        ...data,
        profileImage: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      toast.error(msg, { position: "top-right", autoClose: 1500, theme: "dark" });
    }
    try {
      const response = await axios.post(
        `/api/auth/signin`,
        {
          username: data.username,
          password: data.password,
        },
        { withCredentials: true }
      );

      login(response.data.user); // ✅ Now this will work
      router.push("/");
    } catch (err) {
      setisSubmitting(false);
      const msg = err.response?.data?.error || "Login failed";
      toast.error(msg, { position: "top-right", autoClose: 1500, theme: "dark" });
    }
     setisSubmitting(false);
     setLoading(false)
  };

  const ErrorMessageBox = ({ message }) => (
    <div className="absolute -top-10 left-2 text-sm text-red-600 bg-white border border-red-400 px-3 py-1 rounded-md shadow-md z-10">
      {message}
      <div className="absolute left-4 top-full w-0 h-0 border-l-8 border-r-8 border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
      <div className="absolute left-[15px] top-[100%] w-0 h-0 border-l-8 border-r-8 border-t-[9px] border-l-transparent border-r-transparent border-t-red-400 translate-y-[1px]" />
    </div>
  );

  return (
    <div className="w-full  h-screen relative flex justify-center items-center px-4 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div></div>
      <TopLoader />
      {/* Use the dynamically imported ToastContainer */}
      <DynamicToastContainer />

      {/* The main content box, ensure it has a higher z-index if needed (though not strictly necessary here due to the -z-10 on the image) */}
      <div className="relative flex flex-col bg-white sm:flex-row w-full max-w-3xl h-[700px] rounded-2xl overflow-hidden shadow-2xl z-10">
        <Image
          width={768}
          height={700}
          priority
          src="/signup.png" // Assuming this is still a separate image for the form box
          alt="signup"
          className="absolute inset-0 w-[90%] h-[90%] m-auto object-contain opacity-60"
        />

        <div className="relative z-10 w-full h-full px-10 sm:px-30 py-10 flex flex-col justify-center backdrop-blur-sm bg-white/10 text-black">
          <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <div className="relative">
              {errors.firstName && <ErrorMessageBox message="First name is required" />}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <PiKeyReturnFill className="mr-2" />
                <input
                  type="text"
                  placeholder="Enter First Name"
                  {...register("firstName", { required: true })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="relative">
              {errors.lastName && <ErrorMessageBox message="Last name is required" />}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <PiKeyReturnFill className="mr-2" />
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  {...register("lastName", { required: true })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Username */}
            <div className="relative">
              {errors.username && <ErrorMessageBox message="Username is required" />}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <FaUser className="mr-2" />
                <input
                  type="text"
                  placeholder="Enter Username"
                  {...register("username", { required: true })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              {errors.email && <ErrorMessageBox message="Email is required" />}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <FaEnvelope className="mr-2" />
                <input
                  type="email"
                  placeholder="Enter Email"
                  {...register("email", { required: true })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              {errors.password && <ErrorMessageBox message="Password is required" />}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <FaLock className="mr-2" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  {...register("password", { required: true })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              {errors.confirmPassword && (
                <ErrorMessageBox message={errors.confirmPassword.message} />
              )}
              <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10">
                <FaLock className="mr-2" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="relative">
              {errors.terms && <ErrorMessageBox message="You must agree to terms" />}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("terms", { required: true })}
                  className="mr-2"
                />
                <label>I agree to all terms</label>
              </div>
            </div>

            {/* Submit Button */}
            {isSubmitting ? <div className="w-full bg-primary py-2 flex justify-center items-center"> <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div> </div> :
              <button
                type="submit"
                className="w-full cursor-pointer bg-primary text-white py-2 font-bold rounded hover:bg-red-700 transition"
              >
                Register
              </button>
            }
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link prefetch={true} onClick={() => setLoading(true)} href="/signin" className="text-blue-700 underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;