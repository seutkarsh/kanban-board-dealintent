export interface ITeamListing {
  name: string;
  description: string;
}

export interface ITeamCreationFields {
  creatorId: string;
  name: string;
  description: string;
}

export interface IAddMemberFields{
  userId:string,
  role:string
}

export interface IUpdateTeamFields{
  teamId:string;
  name?: string;
  description?:string
}

export interface ITeamUpdateObject{
  name?:string,
  description?:string
}