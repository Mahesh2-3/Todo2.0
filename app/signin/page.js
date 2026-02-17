"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TopLoader from "../components/TopLoader";
import { useLoading } from "../context/LoadingContext";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  if (status === "loading") return <TopLoader />;

  return (
    <div className="w-[100vw] h-screen flex flex-col justify-center items-center bg-white">
      <TopLoader />
      <div className="text-5xl font-bold">Todo 2.0</div>
      {/* <div className="flex h-[600px] w-[90%] max-w-[600px] relative rounded-2xl overflow-hidden"> */}
      <div className="flex items-center justify-center flex-row h-[50vh]">
        <div className="relative z-10 w-full px-10 flex flex-col justify-center bg-white/20 text-black">
          <h2 className="text-3xl font-bold mb-8 text-center">
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
          src="/signin.png"
          alt="signin background"
          className="max-md:absolute max-md:blur-md w-[500px] h-[500px] object-cover opacity-60"
        />
        {/* </div> */}
      </div>
    </div>
  );
};

export default SignIn;
