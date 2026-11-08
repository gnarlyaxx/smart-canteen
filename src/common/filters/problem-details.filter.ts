import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorMetadata {
  slug: string;
  title: string;
}

const STATUS_ERROR_MAP: Record<number, ErrorMetadata> = {
  [HttpStatus.BAD_REQUEST]: {
    slug: 'bad-request',
    title: 'Bad Request',
  },
  [HttpStatus.NOT_FOUND]: {
    slug: 'not-found',
    title: 'Not Found',
  },
  [HttpStatus.CONFLICT]: {
    slug: 'conflict',
    title: 'Conflict',
  },
  [HttpStatus.PRECONDITION_FAILED]: {
    slug: 'precondition-failed',
    title: 'Precondition Failed',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    slug: 'unprocessable-entity',
    title: 'Unprocessable Entity',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    slug: 'internal-server-error',
    title: 'Internal Server Error',
  },
};

@Catch()
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let detail = 'Terjadi kesalahan internal pada server';
    let customSlug: string | undefined;
    let customTitle: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        detail = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(resObj.message)) {
          detail = resObj.message.join('; ');
        } else if (typeof resObj.message === 'string') {
          detail = resObj.message;
        } else if (typeof resObj.detail === 'string') {
          detail = resObj.detail;
        }

        if (typeof resObj.slug === 'string') {
          customSlug = resObj.slug;
        }
        if (typeof resObj.title === 'string') {
          customTitle = resObj.title;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      const driverError = (
        exception as QueryFailedError & {
          driverError?: { code?: string; errno?: number; message?: string };
        }
      ).driverError;
      const errorMsg = exception.message || '';

      if (
        driverError?.code === '23505' ||
        errorMsg.includes('UNIQUE constraint failed') ||
        errorMsg.includes('duplicate key value')
      ) {
        status = HttpStatus.CONFLICT;
        detail = 'Data dengan nilai unik tersebut sudah terdaftar';
      } else if (
        driverError?.code === '23503' ||
        errorMsg.includes('FOREIGN KEY constraint failed')
      ) {
        status = HttpStatus.BAD_REQUEST;
        detail = 'Referensi relasi data (foreign key) tidak valid';
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const mapped = STATUS_ERROR_MAP[status] ?? {
      slug: 'internal-server-error',
      title: 'Internal Server Error',
    };

    const slug = customSlug ?? mapped.slug;
    const title = customTitle ?? mapped.title;

    response
      .status(status)
      .header('Content-Type', 'application/problem+json')
      .json({
        type: `https://smartcanteen.ac.id/errors/${slug}`,
        title,
        status,
        detail,
        instance: request.originalUrl || request.url,
      });
  }
}
