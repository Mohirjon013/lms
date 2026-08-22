// update-test.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTestDto } from './create-test.dto';

export class UpdateTestDto extends PartialType(OmitType(CreateTestDto, ['lessonsId'] as const)) {}