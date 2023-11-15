import { Container, Service } from "typedi";
import mongoose, { Model } from "mongoose";
import { ITeamMember, ITeamSchema } from "../../models/Schemas/team";
import {
  IAddMemberFields,
  ITeamCreationFields,
  ITeamListing,
  ITeamUpdateObject,
  IUpdateTeamFields,
} from "./ITeamService";
import { UserService } from "../UserService/UserService";

@Service()
export class TeamService {
  private teamSchema: Model<ITeamSchema & mongoose.Document> =
    Container.get("TeamSchema");
  private userService = Container.get(UserService);
  async getTeams(userId: string): Promise<ITeamListing[]> {
    const teams: ITeamSchema[] = await this.teamSchema.find({
      members: { $elemMatch: { userId: userId } },
    });

    return this.prepareTeamListing(teams);
  }

  async createTeam(teamDetails: ITeamCreationFields) {
    //validations

    const team: ITeamSchema = await this.teamSchema.create({
      name: teamDetails.name,
      description: teamDetails.description,
      creator: teamDetails.creatorId,
      members: [{ userId: teamDetails.creatorId, role: TeamRoles.ADMIN }],
    });

    await this.userService.addTeam(team.id, team.creator);

    return team;
  }

  async addMembers(
    members: IAddMemberFields[],
    teamId: string,
    userId: string,
  ): Promise<ITeamSchema> {
    //validation

    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    if (!this.isTeamAdmin(teamDetails, userId))
      throw new Error(TeamServiceErrors.ONLY_ADMIN_CAN_UPDATE_MEMBERS);
    const team: ITeamSchema | null = await this.teamSchema.findByIdAndUpdate(
      teamId,
      { $push: { members: { $each: members } } },
      { new: true, useFindAndModify: false },
    );
    if (!team) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);

    for(let i=0;i<members.length;i++){
      await this.userService.addTeam(team.id, members[i].userId);
    }
    return team;
  }

  async updateTeam(updateFields: IUpdateTeamFields, userId: string) {
    const existingTeam: ITeamSchema | null = await this.teamSchema.findById(
      updateFields.teamId,
    );
    if (!existingTeam) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);

    if (!this.isTeamAdmin(existingTeam, userId))
      throw new Error(TeamServiceErrors.ONLY_ADMIN_CAN_UPDATE_MEMBERS);

    const updateObject: ITeamUpdateObject = {};
    if (updateFields.name) updateObject.name = updateFields.name;
    if (updateFields.description)
      updateObject.description = updateFields.description;

    const updatedTeam: ITeamSchema | null =
      await this.teamSchema.findByIdAndUpdate(
        updateFields.teamId,
        updateObject,
        { new: true, useFindAndModify: false },
      );

    if (!updatedTeam) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    return updatedTeam;
  }

  async removeMembers(
    members: IAddMemberFields[],
    teamId: string,
    userId: string,
  ) {
    //validation

    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    if (!this.isTeamAdmin(teamDetails, userId))
      throw new Error(TeamServiceErrors.ONLY_ADMIN_CAN_UPDATE_MEMBERS);
    const team: ITeamSchema | null = await this.teamSchema.findByIdAndUpdate(
      teamId,
      { $pull: { members: { $in: members } } },
      { new: true, useFindAndModify: false, multi: true },
    );
    if (!team) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    for(let i=0;i<members.length;i++){
      await this.userService.removeTeam(team.id, members[i].userId);
    }
    return team;
  }

  async updateRole(
    teamId: string,
    memberId: string,
    role: string,
    userId: string,
  ) {
    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    if (!this.isTeamAdmin(teamDetails, userId))
      throw new Error(TeamServiceErrors.ONLY_ADMIN_CAN_UPDATE_MEMBERS);
    const newMembersArray: ITeamMember[] = teamDetails.members.map((member) => {
      if (member.userId == memberId) member.role = role;
      return member;
    });
    const team: ITeamSchema | null = await this.teamSchema.findByIdAndUpdate(
      teamId,
      { $set: { members: newMembersArray } },

      { new: true, useFindAndModify: false },
    );
    if (!team) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    return team;
  }

  async deleteTeam(teamId: string, userId: string) {
    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    if (!this.isTeamAdmin(teamDetails, userId))
      throw new Error(TeamServiceErrors.ONLY_ADMIN_CAN_UPDATE_MEMBERS);
    const deletedDoc = await this.teamSchema.findByIdAndDelete(teamId);
    if (!deletedDoc) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);

    for(let i=0;i<deletedDoc.members.length;i++){
      await this.userService.removeTeam(deletedDoc.id, deletedDoc.members[i].userId);
    }
    return deletedDoc;
  }

  async leaveTeam(teamId: string, userId: string) {
    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    if (!this.isAnotherAdminAvailable(teamDetails, userId))
      throw new Error(TeamServiceErrors.AT_LEAST_ONE_ADMIN_NEEDED);

    const newMembersArray: ITeamMember[] = teamDetails.members.filter(
      (member) => {
        if (member.userId != userId) return member;
      },
    );
    const team: ITeamSchema | null = await this.teamSchema.findByIdAndUpdate(
      teamId,
      { $set: { members: newMembersArray } },

      { new: true, useFindAndModify: false },
    );
    if (!team) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);

    await this.userService.removeTeam(team.id, userId);
    return team;
  }

  async getBoardsByTeamId(teams: string[]): Promise<string[]> {
    const boards: string[] = [];
    const teamDocs: ITeamSchema[] | null = await this.teamSchema.find({
      id: { $in: teams },
    });
    teamDocs?.forEach((team) => {
      boards.concat(...team.boards);
    });
    return boards;
  }

  async addBoard(boardId:string,teamId:string){
    await this.teamSchema.findByIdAndUpdate(teamId,{$push:{boards:boardId}})
  }

  async removeBoard(boardId:string,teamId:string){
    await this.teamSchema.findByIdAndUpdate(teamId,{$pull:{boards:boardId}})
  }
  private prepareTeamListing(teams: ITeamSchema[]): ITeamListing[] {
    const teamListing: ITeamListing[] = [];

    teams.forEach((team) => {
      teamListing.push({ name: team.name, description: team.description });
    });

    return teamListing;
  }

  private isTeamAdmin(team: ITeamSchema, userId: string) {
    return team.members.some((member) => {
      return member.userId == userId && member.role == TeamRoles.ADMIN;
    });
  }

  private isAnotherAdminAvailable(team: ITeamSchema, userId: string): boolean {
    return team.members.some((member) => {
      return member.userId != userId && member.role == TeamRoles.ADMIN;
    });
  }
  async isTeamAdminByTeamId(teamId: string, userId: string) {
    const teamDetails: ITeamSchema | null =
      await this.teamSchema.findById(teamId);
    if (!teamDetails) throw new Error(TeamServiceErrors.TEAM_NOT_FOUND);
    return this.isTeamAdmin(teamDetails, userId);
  }
}

export enum TeamRoles {
  VIEWER = "viewer",
  MEMBER = "member",
  ADMIN = "admin",
}

export enum TeamServiceErrors {
  TEAM_NOT_FOUND = "Team Not Found",
  ONLY_ADMIN_CAN_UPDATE_MEMBERS = "Only Admin Can Update Members",
  AT_LEAST_ONE_ADMIN_NEEDED = "There should be at least one admin present, change someone's role to admin before leaving",
}
