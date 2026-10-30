// src/utils/response.ts
import type { Response } from "express";

// Format response sukses: { status, message, data, metadata }
// metadata hanya diisi oleh endpoint yang memakai pagination
export const sendSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown,
  metadata?: Record<string, unknown>,
): void => {
  res.status(status).json({ status: true, message, data, metadata });
};
