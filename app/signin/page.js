"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TopLoader from "../components/TopLoader";
import { useLoading } from "../context/LoadingContext";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setLoading } = useLoading();

  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleVideoEnd = () => {
    setVideoFinished(true);
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoFinished(true);
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!videoFinished) {
    return (
      <div className="w-screen h-screen bg-white flex items-center justify-center relative">
        <video
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          className="sm:w-[70vw] w-full sm:h-[70vh] h-full object-contain"
          style={{ display: "block" }}
        >
          <source src="/introAnimation.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button
          onClick={() => setVideoFinished(true)}
          className="absolute top-8 right-8 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm transition-all z-50 pointer-events-auto cursor-pointer"
        >
          Skip Animation
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-white">
      <TopLoader />
      <div className="text-5xl font-bold border-b px-4 font-inter flex items-center gap-2">
        <div>
          Todo <span className="text-primary">2</span>.
          <span className="text-primary">0</span>
        </div>
        <Image src="/check.png" alt="check icon" width={70} height={70} />
      </div>
      <div className="flex items-center justify-center flex-row h-[50vh] min-xs:w-[600px] w-full">
        <div className="relative z-10 sm:w-[500px] w-[90%] py-10  px-10 flex flex-col justify-center bg-white/20 text-black">
          <h2 className="text-xl font-bold mb-8 text-center">
            Sign In With Google
          </h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm text-gray-700">
            Secure login powered by Google
          </p>
        </div>
        <Image
          width={600}
          height={600}
          priority
          src="/Logo.png"
          alt="signin background"
          className="absolute blur-md w-[500px] h-[500px] object-cover opacity-60"
        />
      </div>
    </div>
  );
};

export default SignIn;
