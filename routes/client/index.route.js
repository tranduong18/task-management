const taskRoute = require("./task.route");
const userRoute = require("./user.route");

const authMiddleware = require("../../middlewares/client/auth.middleware");

module.exports = (app) => {
    app.use("/tasks", authMiddleware.requireAuth, taskRoute);

    app.use("/users", userRoute);
}