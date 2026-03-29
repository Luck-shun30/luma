import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthRequiredError } from "@/lib/auth/session";

export function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "The request payload is invalid.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong.";
}

export function toApiErrorResponse(error: unknown) {
  const status =
    error instanceof AuthRequiredError
      ? 401
      : error instanceof ZodError
        ? 400
        : 500;

  return NextResponse.json(
    {
      error: getErrorMessage(error),
    },
    {
      status,
    },
  );
}
