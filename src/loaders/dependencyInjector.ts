import { Connection } from "mongoose";
import { Container } from "typedi";
import Logger from "./logger";

export default async ({
	mongoDBConnection
}: {
	mongoDBConnection: Connection;
}) => {
	try {
		Container.set("mongoDBConnection", mongoDBConnection);
		//set every model into global container
		(await import("../models")).models.forEach((m) => {
			Container.set(m.name, m.model);
		});

		Logger.info("✌️ Dependency Injector loaded");
	} catch (e) {
		Logger.error(`🔥 Error on dependency injector loader: ${e.stack}`);
	}
};
