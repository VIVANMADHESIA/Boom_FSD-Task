import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}
