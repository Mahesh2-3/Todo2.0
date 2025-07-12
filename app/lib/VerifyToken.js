import jwt from "jsonwebtoken";

export const verifyToken = (req) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);
  return decoded.id;
};
