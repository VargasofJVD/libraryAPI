import { PartialType } from '@nestjs/swagger';
import { CreateApprovalRequestDto } from './create-approval-request.dto';

export class UpdateApprovalRequestDto extends PartialType(CreateApprovalRequestDto) {}
