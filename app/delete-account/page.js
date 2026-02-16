"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { signOut } from "next-auth/react";

export default function ConfirmDelete() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const deleteAccount = async () => {
      try {
        const res = await axios.post("/api/auth/delete-account");

        if (res.data.success) {
          await signOut({ callbackUrl: "/" });
        } else {
          setError("Failed to delete account.");
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    deleteAccount();
  }, []);

  if (loading) return <div className="p-10 text-center">Deleting...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return null;
}
