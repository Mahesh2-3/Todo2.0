"use client";

import { useState } from "react";
import axios from "axios";
import { signOut } from "next-auth/react";

const DeleteAccount = ({ setdeleteOpen }) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (confirmationText.trim() !== "delete my account") {
      setErrorMsg('You must type exactly: "delete my account"');
      return;
    }

    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`/api/auth/delete-account`, {
        password,
      });

      if (response.data.success) {
        setDeleted(true);
        signOut({ callbackUrl: ".signin" });
      } else {
        setErrorMsg(response.data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (deleted) {
    return (
      <div className="min-h-screen w-full absolute z-[9999] flex items-start justify-center px-4">
        <div className="bg-white p-10 rounded-xl shadow-md text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Deleted
          </h2>
          <p className="text-gray-600">
            Your account has been successfully deleted.
          </p>
        </div>
      </div>
    );
  }

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

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your password"
          />
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition duration-200 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    </div>
  );
};

export default DeleteAccount;
