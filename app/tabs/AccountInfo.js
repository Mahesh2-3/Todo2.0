"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/Authcontext";
import { IoArrowBack } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useLoading } from "../context/LoadingContext";

const profileImages = ["/p1.png", "/p2.png", "/p3.png", "/p4.png", "/p5.png", "/p6.png"];

const AccountInfo = () => {
  const { user, login } = useAuth();
  const { loading, setLoading } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(user?.profileImage || profileImages[0]);

  const isPreviewUser = user?.username === "john.whitaker87";

  const {
    register,
    watch,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        username: user?.username || "",
        email: user?.email || "",
      });
      setSelectedImage(user?.profileImage || profileImages[0]);
    } else {
      reset({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updatedData = {
        ...data,
        profileImage: selectedImage,
      };

      const response = await axios.put(`/api/auth/update`, updatedData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const updatedUserWithToken = {
        ...response.data.user,
        token: user.token,
        profileImage: selectedImage,
      };

      login(updatedUserWithToken);
      toast.success("Profile updated successfully");
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to update profile";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (data) => {
    setLoading(true);
    try {
      await axios.put(`/api/auth/change-password`, data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      toast.success("Password changed successfully");
      setIsOpen(false);
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to change password";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex justify-center items-center relative shadow-dark bg-white p-12 rounded-2xl overflow-hidden">
      {/* PREVIEW MODE BADGE & MESSAGE */}
      {isPreviewUser && (
        <>
          {/* Top-left badge */}
          <div className="absolute z-10 text-white font-semibold text-xs px-3 py-1 bg-primary bg-opacity-70 rounded top-4 right-4 shadow">
            Preview mode
          </div>

          {/* Centered info */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-black/70 text-white px-6 py-4 text-center text-sm sm:text-base rounded-xl shadow-lg">
              Preview mode doesn’t allow account editing
            </div>
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <div
        className={`rounded-xl w-full h-full ${isPreviewUser ? "pointer-events-none backdrop-blur-sm opacity-60 select-none" : ""
          }`}
      >
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">
          {isOpen ? "Change Password" : "Account Information"}
        </h2>

        {/* Main Profile Image */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="w-32 h-32">
            <Image
              src={selectedImage}
              alt="User"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          {/* Thumbnail Image Selection */}
          <div className={`${isOpen ? "hidden" : "flex"} gap-2 flex-wrap justify-center`}>
            {profileImages.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Option ${index + 1}`}
                width={48}
                height={48}
                onClick={() => {
                  if (loading) return;
                  setSelectedImage(img);
                }}
                className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 ${selectedImage === img
                  ? "border-primary"
                  : "border-gray-300"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(isOpen ? onPasswordChange : onSubmit)}
          className="space-y-6 bg-white rounded-md py-4"
        >
          {isOpen ? (
            <>
              <div>
                <label className="block font-semibold text-sm">Old Password</label>
                <input
                  type="password"
                  {...register("oldPassword", { required: "Old password is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.oldPassword && (
                  <p className="text-primary text-sm">{errors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm">New Password</label>
                <input
                  type="password"
                  {...register("newPassword", { required: "New password is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.newPassword && (
                  <p className="text-primary text-sm">{errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm">Confirm Password</label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watch("newPassword") || "Passwords do not match",
                  })}
                  className="w-full border p-2 rounded"
                />
                {errors.confirmPassword && (
                  <p className="text-primary text-sm">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
                  Update Password
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  className="bg-primary flex items-center gap-2 text-white px-4 py-2 rounded"
                >
                  <IoArrowBack />
                  Go Back
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-sm">First Name</label>
                <input
                  type="text"
                  {...register("firstName", { required: "First name is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.firstName && (
                  <p className="text-primary text-sm">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm">Last Name</label>
                <input
                  type="text"
                  {...register("lastName", { required: "Last name is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.lastName && (
                  <p className="text-primary text-sm">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm">Username</label>
                <input
                  type="text"
                  {...register("username", { required: "Username is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.username && (
                  <p className="text-primary text-sm">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full border p-2 rounded"
                />
                {errors.email && (
                  <p className="text-primary text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
                  Update Info
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  disabled={loading}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  Change Password
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={true} />
    </div>
  );
};

export default AccountInfo;
