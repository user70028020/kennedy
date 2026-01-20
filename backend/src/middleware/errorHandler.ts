import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Custom app errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
}

export function createError(message: string, statusCode: number, code?: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
