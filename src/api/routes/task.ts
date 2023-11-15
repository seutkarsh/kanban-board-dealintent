import { Router, Request, Response } from "express";
import { Container } from "typedi";
import { TaskService } from "../../services/TaskService/TaskService";
import { ResponseWrapper } from "../responses/responseWrapper";
import { ITaskSchema } from "../../models/Schemas/task";
import Logger from "../../loaders/logger";
import {
  ITaskCreationFields,
  ITaskUpdateFields,
} from "../../services/TaskService/ITaskService";

export default (router: Router) => {
  const taskService = Container.get(TaskService);

  router.post("/getTasks", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITaskSchema[]>();
    try {
      const boardId: string = req.body.boardId;
      const data = await taskService.getTasksByBoardId(boardId, req.user.id);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/createTask", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITaskSchema>();
    try {
      const taskFields: ITaskCreationFields = {
        name: req.body.name,
        description: req.body.description,
        boardId: req.body.boardId,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
      };
      const data: ITaskSchema = await taskService.createTask(
        taskFields,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.put("/task", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITaskSchema>();
    try {
      const taskFields: ITaskUpdateFields = {
        taskId: req.body.taskId,
        name: req.body.name,
        description: req.body.description,
        priority: req.body.priority,
        status: req.body.status,
        dueDate: req.body.dueDate,
      };
      const data: ITaskSchema = await taskService.updateTask(
        taskFields,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.delete("/task", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITaskSchema>();
    try {
      const taskId: string = req.body.taskId;
      const data: ITaskSchema = await taskService.deleteTask(
        taskId,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });
};
