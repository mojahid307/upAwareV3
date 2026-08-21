import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Factory that returns Express middleware to validate a specific part of the
 * request against a Zod schema.
 *
 * Usage:
 *   router.post("/", validate(createPostSchema, "body"), handler);
 *   router.get("/", validate(querySchema, "query"), handler);
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace the raw input with the parsed (and potentially transformed) data.
      (req as any)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        res.status(400).json({ error: message, code: "VALIDATION_ERROR" });
        return;
      }
      next(err);
    }
  };
}
