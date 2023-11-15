export interface ITaskCreationFields{
    name:string,
    description:string,
    boardId:string,
    priority:string,
    dueDate?:Date
}
export interface ITaskUpdateFields{
    taskId:string,
    name:string,
    description:string,
    priority:string,
    dueDate?:Date,
    status:string
}

export interface ITaskUpdateObject{
    name?:string,
    description?:string,
    priority?:string,
    dueDate?:Date,
    status?:string
}