export const UserRolesEnum = {
    ADMIN: "admin" ,
    PROJECT_ADMIN: "proj ect_admin" ,
    MEMBER: "member"
}
export const AvailableUserRole = Object. values(UserRolesEnum);

export const TaskStatusEnum = {
    TODO:"todo" ,
    IN_PROGRESS : "in_progress",
    DONE : "done"
}

export const CookieOptions = {
    httpOnly : true,
    secure: true,
} 

export const AvailableTaskStatus = Object.values(TaskStatusEnum);