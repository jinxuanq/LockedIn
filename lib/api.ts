import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "REQUEST_ERROR",
    public details?: unknown,
  ) {
    super(message);
  }
}

export type RouteContext = {
  params: Promise<Record<string, string>>;
};

type RouteHandler = (
  request: NextRequest,
  context: RouteContext,
) => Promise<NextResponse> | NextResponse;

export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          { status: error.status },
        );
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Please correct the highlighted fields.",
              details: error.flatten(),
            },
          },
          { status: 422 },
        );
      }

      console.error("Unhandled API error", error);
      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong. Please try again.",
          },
        },
        { status: 500 },
      );
    }
  };
}

export async function parseJson<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.", "INVALID_JSON");
  }
  return schema.parse(body);
}

export function dataResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}
