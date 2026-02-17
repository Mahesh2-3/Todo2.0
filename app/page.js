"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "./components/Navbar";
import TopLoader from "./components/TopLoader";
import dynamic from "next/dynamic";

const Body = dynamic(() => import("./components/Body"), { ssr: false });
const Notifications = dynamic(() => import("./components/Notifications"), {
  ssr: false,
});

const Home = () => {
  const [NotificationsOn, setNotificationsOn] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <TopLoader />;
  }

  if (!session?.user) return null;

  return (
    <div className="w-screen font-inter min-h-screen overflow-y-auto hide-scrollbar">
      <TopLoader />
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>{" "}
      <div className="2xl:w-[1500px] w-full relative h-screen flex flex-col justify-between overflow-y-auto mx-auto hide-scrollbar">
        <Navbar notifi={() => setNotificationsOn(!NotificationsOn)} />
        <Body />
        {NotificationsOn && (
          <div
            className="fixed z-20 inset-0 flex justify-center bg-transparent backdrop-blur-xs shadow-dark items-center"
            onClick={() => setNotificationsOn(false)}
          >
            <div
              className="rounded-lg p-6 max-w-[90%] max-h-[90%] overflow-auto "
              onClick={(e) => e.stopPropagation()}
            >
              <Notifications />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
