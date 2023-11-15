import { Router, Request, Response } from "express";
import { Container } from "typedi";
import { TeamService } from "../../services/Team Service/TeamService";
import {
  IAddMemberFields,
  ITeamCreationFields,
  ITeamListing,
  IUpdateTeamFields,
} from "../../services/Team Service/ITeamService";
import Logger from "../../loaders/logger";
import { ResponseWrapper } from "../responses/responseWrapper";
import { ITeamSchema } from "../../models/Schemas/team";

export default (router: Router) => {
  const teamService = Container.get(TeamService);

  router.get("/teams", async (req: Request, res: Response): Promise<void> => {
    const response = new ResponseWrapper<ITeamListing[]>();
    try {
      const userId = req.user.id;
      const data: ITeamListing[] = await teamService.getTeams(userId);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
  });

  router.post("/createTeam", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITeamSchema>();
    try {
      const teamCreationDetails: ITeamCreationFields = {
        creatorId: req.user.id,
        name: req.body.name,
        description: req.body.description,
      };

      const data: ITeamSchema =
        await teamService.createTeam(teamCreationDetails);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/addMembers", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITeamSchema>();
    try {
      const addMemberDetails: IAddMemberFields[] = req.body.members;
      const teamId: string = req.body.teamId;
      const data: ITeamSchema = await teamService.addMembers(
        addMemberDetails,
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

  router.put("/team", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITeamSchema>();
    try {
      const updateFields: IUpdateTeamFields = {
        teamId: req.body.teamId,
        name: req.body.name,
        description: req.body.description,
      };
      const data: ITeamSchema = await teamService.updateTeam(
        updateFields,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/removeMembers", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<ITeamSchema>();
    try {
      const removeMemberDetails: IAddMemberFields[] = req.body.members;
      const teamId: string = req.body.teamId;
      const data: ITeamSchema = await teamService.removeMembers(
        removeMemberDetails,
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

  router.post("/changeRole", async (req: Request, res: Response) => {
    const response = new ResponseWrapper();
    try {
      const teamId: string = req.body.teamId;
      const memberId: string = req.body.memberId;
      const role: string = req.body.role;

      const data = await teamService.updateRole(
        teamId,
        memberId,
        role,
        req.user.id,
      );
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.delete("/team", async (req:Request, res:Response)=>{
    const response = new ResponseWrapper();
    try{
      const teamId: string = req.body.teamId;
      const data:ITeamSchema = await teamService.deleteTeam(teamId,req.user.id)
      response.setData(data);
    }catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response)
  })

  router.post("/leaveTeam", async (req:Request, res:Response)=>{
    const response = new ResponseWrapper();
    try{
      const teamId: string = req.body.teamId;
      const data:ITeamSchema = await teamService.leaveTeam(teamId,req.user.id)
      response.setData(data);
    }catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response)
  })
};
