import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalRequestsService } from './approval-requests.service';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Approval Requests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approval-requests')
export class ApprovalRequestsController {
  constructor(private readonly approvalRequestsService: ApprovalRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new approval request' })
  @ApiResponse({ status: 201, description: 'Approval request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createApprovalRequestDto: CreateApprovalRequestDto, @Request() req) {
    // Ensure user can only create requests for themselves (unless admin)
    if (req.user.role !== UserRole.ADMIN) {
      createApprovalRequestDto.userId = req.user.id;
    }
    return this.approvalRequestsService.create(createApprovalRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all approval requests with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'requestType', required: false, type: String, description: 'Filter by request type' })
  @ApiResponse({ status: 200, description: 'Approval requests retrieved successfully' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('requestType') requestType?: string,
  ) {
    return this.approvalRequestsService.findAll(page, limit, status, requestType);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current user\'s approval requests' })
  @ApiResponse({ status: 200, description: 'User requests retrieved successfully' })
  findMyRequests(@Request() req) {
    return this.approvalRequestsService.findByUser(req.user.id);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all pending approval requests (Admin only)' })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully' })
  findPendingRequests() {
    return this.approvalRequestsService.findByStatus('pending');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval request by ID' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Approval request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  findOne(@Param('id') id: string) {
    return this.approvalRequestsService.findOne(+id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve an approval request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 400, description: 'Request is not pending' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  approve(
    @Param('id') id: string,
    @Body() body: { adminNotes?: string },
    @Request() req,
  ) {
    return this.approvalRequestsService.approve(+id, req.user.id, body.adminNotes);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject an approval request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Request rejected successfully' })
  @ApiResponse({ status: 400, description: 'Request is not pending' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  reject(
    @Param('id') id: string,
    @Body() body: { adminNotes?: string },
    @Request() req,
  ) {
    return this.approvalRequestsService.reject(+id, req.user.id, body.adminNotes);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update approval request (only if pending)' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Approval request updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update processed request' })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  async update(@Param('id') id: string, @Body() updateApprovalRequestDto: UpdateApprovalRequestDto, @Request() req) {
    // Ensure user can only update their own requests (unless admin)
    if (req.user.role !== UserRole.ADMIN) {
      const request = await this.approvalRequestsService.findOne(+id);
      if (request && request.userId !== req.user.id) {
        throw new Error('You can only update your own requests');
      }
    }
    return this.approvalRequestsService.update(+id, updateApprovalRequestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete approval request (only if pending)' })
  @ApiParam({ name: 'id', description: 'Approval request ID' })
  @ApiResponse({ status: 200, description: 'Approval request deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete processed request' })
  @ApiResponse({ status: 400, description: 'Approval request not found' })
  async remove(@Param('id') id: string, @Request() req) {
    // Ensure user can only delete their own requests (unless admin)
    if (req.user.role !== UserRole.ADMIN) {
      const request = await this.approvalRequestsService.findOne(+id);
      if (request && request.userId !== req.user.id) {
        throw new Error('You can only delete your own requests');
      }
    }
    return this.approvalRequestsService.remove(+id);
  }
}
