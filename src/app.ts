import express, { Express } from "express";
import loaders from "./loaders";
import config from "./config/index";
import Logger from "./loaders/logger";
import "reflect-metadata";

async function startServer() {
    const app: Express = express();
    await loaders(app);
    return app.listen(config.port, () => {
        Logger.info(`
		################################################
		        Starting Kanban Board API
		################################################

		👉  Server Listening on Port: ${config.port}
		👉  Logging Level: ${config.logs.level}

		################################################
		`);
    });
}

startServer()
    .then(() => {
        Logger.info("Server Start Complete");
    })
    .catch((e) => {
        Logger.error(`Server Failed to Start because ${e.stack}`);
    });
