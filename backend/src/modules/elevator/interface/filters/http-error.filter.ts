import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';

@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    if (error.message.toLowerCase().includes('not found')) {
      const exception = new NotFoundException(error.message);
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    const exception = new BadRequestException(error.message);
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
