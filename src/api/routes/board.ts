import { Router, Request, Response } from "express";
import { Container } from "typedi";
import { BoardService } from "../../services/BoardService/BoardService";
import { ResponseWrapper } from "../responses/responseWrapper";
import Logger from "../../loaders/logger";
import {
  IBoard,
  IBoardCreationFields,
} from "../../services/BoardService/IBoardService";
import { IBoardSchema } from "../../models/Schemas/board";

export default (router: Router) => {
  const boardService = Container.get(BoardService);

  router.get("/boards", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IBoard[]>();
    try {
      const data: IBoard[] = await boardService.getAllBoards(req.user.id);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/boards", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IBoard[]>();
    try {
      const teamId: string = req.body.teamId;
      const data: IBoard[] = await boardService.getBoardsByTeam(
        teamId,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/createBoard", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IBoardSchema>();
    try {
      const boardFields: IBoardCreationFields = {
        name: req.body.name,
        description: req.body.description,
        teamId: req.body.teamId,
      };

      const data: IBoardSchema = await boardService.createBoard(
        boardFields,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.delete("/board", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IBoardSchema>();
    try {
      const boardId: string = req.body.boardId;
      const teamId: string = req.body.teamId;

      const data: IBoardSchema = await boardService.deleteBoard(
        boardId,
        teamId,
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
