"use client";
import { useForm } from "react-hook-form";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/Authcontext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import TopLoader from "../components/TopLoader";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineInfoCircle } from "react-icons/ai";

const SignIn = () => {
  const router = useRouter();
  const { user, login } = useAuth();
  const { setLoading } = useLoading();
  const [Loading, setloading] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const handleAutoFill = () => {
    setValue("username", "john.whitaker87");
    setValue("password", "J@ckRabbit#87!");
    setShowInfo(false);
  };
const onSubmit = async (data) => {
  setisSubmitting(true);
  try {
    const response = await axios.post(
      `/api/auth/signin`,
      {
        username: data.username,
        password: data.password,
      },
      {
        withCredentials: true,
      }
    );

    if (!response.data.user) {
      throw new Error("No user data received");
    }

    login(response.data.user);
    router.push("/"); // just await push instead of .then()
  } catch (err) {
    console.error("Login error:", err);
    const msg = err.response?.data?.error || err.message || "Login failed";
    toast.error(msg, {
      position: "top-right",
      autoClose: 1500,
      theme: "dark",
    });
  } finally {
    setisSubmitting(false);
  }
};

  return (
    <div className="w-[100vw] h-screen bg-contain flex justify-center items-center">
      <TopLoader />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="flex h-[700px] w-[90%] bg-white max-w-[700px] relative rounded-2xl shadow-2xl">
        <Image
          width={700}
          height={700}
          priority
          src="/signin.png"
          alt="signin background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        <div className="relative z-10 w-full sm:px-20 px-10 flex flex-col justify-center backdrop-blur-sm bg-white/10 text-black">
          <button
            className="absolute z-[100] top-4 right-4 cursor-pointer text-xl"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <AiOutlineInfoCircle size={25} />
          </button>

          {showInfo && (
            <span
              onClick={handleAutoFill}
              className="absolute z-[100] top-12 -right-4 text-center underline cursor-pointer w-[140px] text-xs"
            >
              Click to login this website to see preview
            </span>
          )}

          <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10 backdrop-blur-sm">
              <FaUser className="text-black mr-2" />
              <input
                type="text"
                placeholder="Enter Username"
                {...register("username", { required: true })}
                className="w-full bg-transparent text-black outline-none"
              />
            </div>
            {errors.username && (
              <p className="text-red-300 text-sm">Username is required</p>
            )}

            <div className="flex items-center border border-black rounded px-3 py-2 bg-white/10 backdrop-blur-sm relative">
              <FaLock className="text-black mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                {...register("password", { required: true })}
                className="w-full bg-transparent text-black outline-none pr-8"
              />
              <div
                className="absolute right-3 cursor-pointer text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.password && (
              <p className="text-red-300 text-sm">Password is required</p>
            )}

            <button
              type="submit"
              disabled={Loading}
              className="w-full bg-primary cursor-pointer text-white flex justify-center items-center font-bold py-2 h-[45px] rounded hover:bg-red-700 transition"
            >
              {isSubmitting ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            New to {" "}
            <span className="font-semibold">
              <span className="text-primary">To</span>-Do
            </span>
            ? {" "}
            <Link
              href="/signup"
              onClick={() => setLoading(true)}
              className="text-blue-700 cursor-pointer font-bold text-md underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;