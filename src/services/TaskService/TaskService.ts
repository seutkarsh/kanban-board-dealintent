import { Container, Service } from "typedi";
import { BoardService } from "../BoardService/BoardService";
import { TeamService } from "../TeamService/TeamService";
import { ITaskSchema } from "../../models/Schemas/task";
import mongoose, { Model } from "mongoose";
import {
  ITaskCreationFields,
  ITaskUpdateFields,
  ITaskUpdateObject,
} from "./ITaskService";

@Service()
export class TaskService {
  private boardService = Container.get(BoardService);
  private teamService = Container.get(TeamService);
  private taskSchema: Model<ITaskSchema & mongoose.Document> =
    Container.get("TaskSchema");
  async getTasksByBoardId(boardId: string, userId: string) {
    const teamId: string = await this.boardService.getTeamByBoardId(boardId);
    if (!(await this.boardService.checkUserTeamConnection(teamId, userId)))
      throw new Error(TaskServiceErrors.BOARD_NOT_ACCESSIBLE_TO_USER);
    const tasks: ITaskSchema[] = await this.taskSchema.find({ board: boardId });
    return tasks;
  }

  async createTask(taskDetails: ITaskCreationFields, userId: string) {
    const teamId: string = await this.boardService.getTeamByBoardId(
      taskDetails.boardId,
    );
    if (!(await this.boardService.checkUserTeamConnection(teamId, userId)))
      throw new Error(TaskServiceErrors.BOARD_NOT_ACCESSIBLE_TO_USER);
    const task: ITaskSchema = await this.taskSchema.create({
      name: taskDetails.name,
      description: taskDetails.description,
      creator: userId,
      board: taskDetails.boardId,
      team: teamId,
      status: TaskStatus.TO_DO,
      dueDate: taskDetails.dueDate,
      priority: taskDetails.priority,
    });

    await this.boardService.addTask(task.board, task.id);
    return task;
  }

  async updateTask(taskDetails: ITaskUpdateFields, userId: string) {
    const task: ITaskSchema | null = await this.taskSchema.findById(
      taskDetails.taskId,
    );
    if (!task) throw new Error(TaskServiceErrors.TASK_NOT_FOUND);
    if (!(await this.boardService.checkUserTeamConnection(task.team, userId)))
      throw new Error(TaskServiceErrors.BOARD_NOT_ACCESSIBLE_TO_USER);
    const updateObject: ITaskUpdateObject = {};
    if (taskDetails.name) updateObject.name = taskDetails.name;
    if (taskDetails.description)
      updateObject.description = taskDetails.description;
    if (taskDetails.priority) updateObject.priority = taskDetails.priority;
    if (taskDetails.status) updateObject.status = taskDetails.status;
    if (taskDetails.dueDate) updateObject.dueDate = taskDetails.dueDate;

    const updatedTask: ITaskSchema | null =
      await this.taskSchema.findByIdAndUpdate(
        taskDetails.taskId,
        updateObject,
        { new: true, useFindAndModify: false },
      );
    if (!updatedTask) throw new Error(TaskServiceErrors.TASK_NOT_FOUND);

    if (taskDetails.status) {
      await this.boardService.changeStatus(
        updatedTask.board,
        updatedTask.id,
        task.status,
        updatedTask.status,
      );
    }
    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    const task: ITaskSchema | null = await this.taskSchema.findById(taskId);
    if (!task) throw new Error(TaskServiceErrors.TASK_NOT_FOUND);
    if (!(await this.boardService.checkUserTeamConnection(task.team, userId)))
      throw new Error(TaskServiceErrors.BOARD_NOT_ACCESSIBLE_TO_USER);
    const deletedDoc: ITaskSchema | null =
      await this.taskSchema.findByIdAndDelete(taskId);
    if (!deletedDoc) throw new Error(TaskServiceErrors.TASK_NOT_FOUND);
    await this.boardService.deleteTask(
      deletedDoc.board,
      deletedDoc.id,
      deletedDoc.status,
    );
    return deletedDoc;
  }
}

export enum TaskServiceErrors {
  BOARD_NOT_ACCESSIBLE_TO_USER = "User is not a part of this team",
  TASK_NOT_FOUND = "Task not found",
}

export enum TaskStatus {
  IN_PROGRESS = "in-progress",
  "TO_DO" = "to-do",
  "COMPLETED" = "completed",
}
