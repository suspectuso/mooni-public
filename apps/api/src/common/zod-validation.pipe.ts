import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodSchema } from 'zod'

/** Валидирует вход zod-схемой из @mooni/shared. */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: result.error.issues,
      })
    }
    return result.data
  }
}
