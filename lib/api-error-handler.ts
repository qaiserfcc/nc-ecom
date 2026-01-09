import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  details?: any
}

export class AppError extends Error {
  statusCode: number
  code?: string
  details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error)

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Handle database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return NextResponse.json(
          {
            error: 'This record already exists',
            code: 'DUPLICATE_ENTRY',
            details: error.detail,
          },
          { status: 409 }
        )
      case '23503': // Foreign key violation
        return NextResponse.json(
          {
            error: 'Referenced record does not exist',
            code: 'FOREIGN_KEY_VIOLATION',
            details: error.detail,
          },
          { status: 400 }
        )
      case '23502': // Not null violation
        return NextResponse.json(
          {
            error: 'Required field is missing',
            code: 'MISSING_REQUIRED_FIELD',
            details: error.detail,
          },
          { status: 400 }
        )
      case '22P02': // Invalid text representation
        return NextResponse.json(
          {
            error: 'Invalid data format',
            code: 'INVALID_FORMAT',
            details: error.message,
          },
          { status: 400 }
        )
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors || error.message,
      },
      { status: 400 }
    )
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return NextResponse.json(
      {
        error: 'Authentication failed',
        code: 'INVALID_TOKEN',
        details: error.message,
      },
      { status: 401 }
    )
  }

  // Generic server error
  return NextResponse.json(
    {
      error: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    { status: error.statusCode || 500 }
  )
}

// Helper functions for common errors
export const ApiErrors = {
  unauthorized: (message = 'Unauthorized access') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Access forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (resource = 'Resource', message?: string) =>
    new AppError(message || `${resource} not found`, 404, 'NOT_FOUND'),
  
  badRequest: (message = 'Invalid request', details?: any) =>
    new AppError(message, 400, 'BAD_REQUEST', details),
  
  conflict: (message = 'Resource already exists') =>
    new AppError(message, 409, 'CONFLICT'),
  
  serverError: (message = 'Internal server error') =>
    new AppError(message, 500, 'SERVER_ERROR'),
}
