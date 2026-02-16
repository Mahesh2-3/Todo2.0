"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const DeleteAccount = ({ setdeleteOpen }) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (confirmationText.trim() !== "delete my account") {
      setErrorMsg('You must type exactly: "delete my account"');
      return;
    }

    // 🚨 Force Google re-authentication
    await signIn("google", {
      callbackUrl: "/delete-account",
      prompt: "login", // forces account selection again
    });
  };

  return (
    <div className="w-full h-full bg-black/10 z-[9999] fixed inset-0 backdrop-blur-sm flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl relative shadow-lg w-full max-w-md"
      >
        <button
          onClick={() => setdeleteOpen(false)}
          className="absolute top-4 right-4 cursor-pointer text-xl"
        >
          ✕
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Delete Your Account
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Type: <span className="text-red-500">delete my account</span>
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder='Type "delete my account"'
          />
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition duration-200"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default DeleteAccount;
