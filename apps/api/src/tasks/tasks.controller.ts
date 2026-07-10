import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto
  ) {
    const data = await this.tasksService.createTask(user.id, dto);
    return { data };
  }

  @Patch(":taskId")
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId") taskId: string,
    @Body() dto: UpdateTaskDto
  ) {
    const data = await this.tasksService.update(user.id, taskId, dto);
    return { data };
  }

  @Delete(":taskId")
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param("taskId") taskId: string
  ) {
    await this.tasksService.remove(user.id, taskId);
    return { data: { success: true } };
  }
}
