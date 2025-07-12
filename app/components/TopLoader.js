// components/TopLoader.jsx
import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";

const TopLoader = () => {
  const { loading } = useLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
      }, 100);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // hide after loading finishes
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "4px",
        width: `${progress}%`,
        backgroundColor: "#FF6767", // blue color for animation
        transition: "width 0.2s ease-out",
        zIndex: 9999,
        boxShadow: "0 0 5px #FF6767",
        opacity: progress === 0 ? 0 : 1,
      }}
    />
  );
};

export default TopLoader;
