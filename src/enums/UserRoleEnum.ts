const UserRoleEnum = {
    STUDENT: "STUDENT",
    TEACHER: "TEACHER",
    ADMIN: "ADMIN",
    DEV_ADMIN: "DEV_ADMIN",
} as const;

export type UserRoleEnum = typeof UserRoleEnum[keyof typeof UserRoleEnum];

export default UserRoleEnum;
