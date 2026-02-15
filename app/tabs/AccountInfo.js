"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useLoading } from "../context/LoadingContext";
import { useSession } from "next-auth/react";

const profileImages = [
  "/p1.png",
  "/p2.png",
  "/p3.png",
  "/p4.png",
  "/p5.png",
  "/p6.png",
];

const AccountInfo = () => {
  const { data: session, status, update } = useSession();
  const { loading, setLoading } = useLoading();

  const [selectedImage, setSelectedImage] = useState(profileImages[0]);

  const user = session?.user;

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Populate form when session loads
  useEffect(() => {
    if (status === "authenticated" && user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
      });

      setSelectedImage(user.profileImage || profileImages[0]);
    }
  }, [status, user, reset]);

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) {
    return <div className="p-10 text-center">Not authenticated</div>;
  }

  // =============================
  // UPDATE PROFILE
  // =============================
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const updatedData = {
        ...data,
        profileImage: selectedImage,
      };

      const response = await axios.put("/api/auth/update", updatedData);

      if (response.data.user) {
        await update({
          ...session,
          user: {
            ...session.user,
            ...response.data.user,
          },
        });
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to update profile";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex justify-center items-center relative shadow-dark bg-white p-12 rounded-2xl overflow-hidden">
      <div className="rounded-xl w-full h-full">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary pb-2">
          Account Information
        </h2>

        {/* PROFILE IMAGE */}
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

          <div className="flex gap-2 flex-wrap justify-center">
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
                className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 ${
                  selectedImage === img ? "border-primary" : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-white rounded-md py-4"
        >
          <div>
            <label className="block font-semibold text-sm">First Name</label>
            <input
              type="text"
              {...register("firstName", {
                required: "First name is required",
              })}
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
              {...register("lastName", {
                required: "Last name is required",
              })}
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
              {...register("username", {
                required: "Username is required",
              })}
              className="w-full border p-2 rounded"
            />
            {errors.username && (
              <p className="text-primary text-sm">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-sm">
              Email (Google Account)
            </label>
            <input
              type="email"
              {...register("email")}
              disabled
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Update Info
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
    </div>
  );
};

export default AccountInfo;
