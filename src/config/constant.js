export const allowedRoutes = {
    user: ["dashboard","transactions"],
    accountant: ["dashboard","transactions","users"],
    admin: ["dashboard","transactions","users", "accountant"],
}