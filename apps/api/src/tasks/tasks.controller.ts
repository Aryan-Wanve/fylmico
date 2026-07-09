import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser
} from "../common/guards/jwt-auth.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
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
}
