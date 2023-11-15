import { Container, Service } from "typedi";
import { UserService } from "../UserService/UserService";
import {IBoard, IBoardCreationFields} from "./IBoardService";
import { TeamService } from "../TeamService/TeamService";
import { IBoardSchema } from "../../models/Schemas/board";
import mongoose, { Model } from "mongoose";
import { ITeamSchema } from "../../models/Schemas/team";

@Service()
export class BoardService {
  private userService = Container.get(UserService);
  private teamService = Container.get(TeamService);
  private boardSchema: Model<IBoardSchema & mongoose.Document> =
    Container.get("BoardSchema");
  async getAllBoards(userId: string):Promise<IBoard[]> {
    const boards: IBoard[] = [];
    const teams:string[] = await this.userService.getTeamsByUserId(userId);
    const boardIds: string[] = await this.teamService.getBoardsByTeamId(teams);
    return await this.prepareBoardListing(boardIds)
  }

  async getBoardsByTeam(teamId:string,userId:string):Promise<IBoard[]>{
      const boards: IBoard[] = [];
      if(! await this.checkUserTeamConnection(teamId,userId)) throw new Error(BoardServiceErrors.TEAM_NOT_ACCESSIBLE_BY_USER)
      const boardIds: string[] = await this.teamService.getBoardsByTeamId([teamId]);
      return await this.prepareBoardListing(boardIds)
  }

  async createBoard(boardDetails:IBoardCreationFields,userId:string):Promise<IBoardSchema>{
      if(! await this.checkUserTeamConnection(boardDetails.teamId,userId)) throw new Error(BoardServiceErrors.TEAM_NOT_ACCESSIBLE_BY_USER)
      const board :IBoardSchema = await this.boardSchema.create({name:boardDetails.name,description:boardDetails.description,team:boardDetails.teamId,creator:userId})
      return board
  }

  async deleteBoard(boardId:string,teamId:string,userId:string){
      if(! await this.checkUserTeamConnection(teamId,userId)) throw new Error(BoardServiceErrors.TEAM_NOT_ACCESSIBLE_BY_USER)
      if(!await this.teamService.isTeamAdminByTeamId(teamId,userId)) throw new Error(BoardServiceErrors.ONLY_ADMINS_CAN_DELETE_BOARD)
      const deletedDoc:IBoardSchema  | null= await this.boardSchema.findByIdAndDelete(boardId)
      if(!deletedDoc) throw new Error(BoardServiceErrors.BOARD_NOT_FOUND)
      return deletedDoc
  }

  async getTeamByBoardId(boardId:string){
      const board:IBoardSchema | null= await this.boardSchema.findById(boardId)
      if(!board) throw new Error(BoardServiceErrors.BOARD_NOT_FOUND)
      return board.team
  }

  private async prepareBoardListing(boardIds: string[]):Promise<IBoard[]> {
    const boards: IBoardSchema[] = await this.boardSchema.find({
      id: { $in: boardIds },
    });
    return boards.map((board) => {
      return { id: board.id, name: board.name, description: board.description };
    });


  }
     async checkUserTeamConnection(teamId :string,userId:string){
        const teams = await this.userService.getTeamsByUserId(userId);
        return !teams.includes(teamId)
    }
}

export enum BoardServiceErrors{
    TEAM_NOT_ACCESSIBLE_BY_USER = "User is not a part of this team",
    ONLY_ADMINS_CAN_DELETE_BOARD = "Only admins can delete a board",
    BOARD_NOT_FOUND = "Board Not Found"
}
