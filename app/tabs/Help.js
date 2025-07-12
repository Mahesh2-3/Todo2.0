"use client";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import emailjs from "emailjs-com";
import { useForm } from "react-hook-form";
import { useLoading } from "../context/LoadingContext";

const Help = () => {
  const [selectedOption, setSelectedOption] = useState("report");
  const [rating, setRating] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sparkleIndex, setSparkleIndex] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { loading, setLoading } = useLoading();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setRating(0);
  };

  const handleStarClick = (star) => {
    if (rating === star) {
      setRating(star - 1);
    } else {
      setRating(star);
    }
    setSparkleIndex(star);
    setTimeout(() => setSparkleIndex(null), 500);
  };

  const onSubmit = async (data) => {
    if (!data.userName || !data.userEmail || !data.message) return;
    setLoading(true);
    setIsSending(true);
    const date = new Date().toLocaleString();

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAIL_SERVICEID,
        process.env.NEXT_PUBLIC_EMAIL_TEMPLATE1,
        {
          from_name: data.userName,
          to_name: "Mahesh",
          from_email: data.userEmail,
          to_email: "maheshkarna32@gmail.com",
          subject: selectedOption === "report" ? "Report" : "Feedback",
          message: data.message + (rating ? "\nRating: " + rating + "/5" : ""),
        },
        process.env.NEXT_PUBLIC_EMAIL_PUBLICKEY
      );

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAIL_SERVICEID,
        process.env.NEXT_PUBLIC_EMAIL_TEMPLATE2,
        {
          from_name: "Mahesh",
          to_name: data.userName,
          from_email: "maheshkarna32@gmail.com",
          to_email: data.userEmail,
          subject: selectedOption === "report" ? "Report" : "Feedback",
          date: date,
          message:
            selectedOption === "report"
              ? "Thank you for reporting a problem. We've received your message and will look into it as soon as possible."
              : "We really appreciate you taking the time to share your feedback with us! ❤️",
          subject_matter: data.message + (rating ? "\nRating: " + rating + "/5" : ""),
          message2:
            selectedOption === "report"
              ? "If we need more details, we'll contact you at this email: " + data.userEmail
              : "Feedback like yours helps us improve and build better experiences for everyone.",
        },
        process.env.NEXT_PUBLIC_EMAIL_PUBLICKEY
      );

      setIsSubmitted(true);
      reset();
      setRating(0);
    } catch (err) {
      console.error("EmailJS Error:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl sm:text-6xl mb-4">✓</div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {selectedOption === "report" ? "Report Submitted" : "Thank You!"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {selectedOption === "report"
              ? "We've received your report and will look into it soon."
              : "Your feedback means a lot to us!"}
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="bg-primary text-sm sm:text-base cursor-pointer text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-dark sm:px-12 py-10 px-4 h-full max-w-[890px] m-auto w-full">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
        {selectedOption === "report" ? "Report an Issue" : "Share Feedback"}
      </h1>
      <p className="text-sm sm:text-base text-center text-gray-600 mb-8">
        {selectedOption === "report"
          ? "Help us improve by reporting problems you encounter"
          : "We'd love to hear your thoughts about our service"}
      </p>

      {/* Option Selector */}
      <div className="flex space-x-4 mb-8 justify-center">
        <button
          className={`px-6 py-3 text-sm sm:text-base cursor-pointer rounded-lg font-semibold transition-colors ${
            selectedOption === "report"
              ? "bg-primary text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleOptionChange("report")}
        >
          Report a Problem
        </button>
        <button
          className={`px-6 py-3 text-sm sm:text-base cursor-pointer rounded-lg font-semibold transition-colors ${
            selectedOption === "feedback"
              ? "bg-primary text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          onClick={() => handleOptionChange("feedback")}
        >
          Feedback
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-sm sm:text-base">
        {/* User Name */}
        <div>
          <label htmlFor="userName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="userName"
            {...register("userName", { required: "Name is required" })}
            placeholder="John Doe"
            className={`w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.userName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.userName && (
            <p className="mt-1 text-xs text-red-500">{errors.userName.message}</p>
          )}
        </div>

        {/* User Email */}
        <div>
          <label htmlFor="userEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Your Email <span className="text-red-500">*</span>
          </label>
          <input
            id="userEmail"
            type="email"
            {...register("userEmail", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            placeholder="your@email.com"
            className={`w-full border rounded-lg p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.userEmail ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.userEmail && (
            <p className="mt-1 text-xs text-red-500">{errors.userEmail.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            {selectedOption === "report" ? "Describe the issue" : "Your feedback"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            {...register("message", {
              required: "This field is required",
              minLength: {
                value: 5,
                message: "Message must be at least 5 characters",
              },
            })}
            rows={3}
            placeholder={
              selectedOption === "report"
                ? "Please describe the problem in detail..."
                : "What do you like or what can we improve?"
            }
            className={`w-full border rounded-lg p-3 sm:p-4 focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
          )}
        </div>

        {/* Stars for Feedback */}
        {selectedOption === "feedback" && (
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </p>
            <div className="flex gap-2 mb-4 relative">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="relative">
                  <FaStar
                    size={24}
                    className={`cursor-pointer transition-all ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    } ${star === sparkleIndex ? "scale-125" : ""}`}
                    onClick={() => handleStarClick(star)}
                  />
                  {star === sparkleIndex && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                      <div className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-yellow-400 opacity-75"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSending}
            className={`bg-primary text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base ${
              isSending ? "opacity-70 cursor-not-allowed" : "hover:bg-primary-dark"
            }`}
          >
            {isSending ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Help;
