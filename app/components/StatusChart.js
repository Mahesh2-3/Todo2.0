"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const StatusChart = ({ label, value, color }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="sm:w-[100px] @min-xs:w-[80px] w-[50px] sm:h-[100px] @min-xs:h-[80px] h-[50px]">
        <CircularProgressbar
          strokeWidth={10}
          value={value || 0}
          text={`${Math.round(value) || 0}%`}
          styles={buildStyles({
            pathColor: color,
            trailColor: "#e5e7eb",
            textColor: "#000",
            textSize: "22px",
          })}
        />
      </div>
      <div className="flex items-center gap-1 @min-xs:text-sm text-xs">
        <span
          className={`w-2 h-2 rounded-full inline-block`}
          style={{ backgroundColor: color }}
        ></span>
        {label}
      </div>
    </div>
  );
};

export default StatusChart;
