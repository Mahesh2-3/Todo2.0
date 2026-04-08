"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLoading } from "../context/LoadingContext";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setLoading } = useLoading();

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

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-(--bg-main)">
        <div className="w-16 h-16 border-4 border-(--border-color) border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-(--bg-main)">
      <TopLoader />
      <div className="text-5xl font-bold border-b border-(--border-color) px-4 font-inter text-(--text-main) flex items-center gap-2">
        <div>
          Todo <span className="text-primary">2</span>.
          <span className="text-primary">0</span>
        </div>
        <Image src="/check.png" alt="check icon" width={70} height={70} />
      </div>
      <div className="flex items-center justify-center flex-row h-[50vh] min-xs:w-[600px] w-full">
        <div className="relative z-10 sm:w-[500px] w-[90%] py-10 px-10 flex flex-col justify-center bg-(--bg-card) shadow-xl rounded-2xl p-8 border border-(--border-color) text-(--text-main)">
          <h2 className="text-xl font-bold mb-8 text-center text-(--text-main)">
            Sign In With Google
          </h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-(--bg-main) text-(--text-main) font-semibold py-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border border-(--border-color)"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm text-(--text-muted)">
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
