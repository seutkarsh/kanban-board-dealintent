import winston from "winston";
import config from "../config";

const transports = [];

transports.push(
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.errors({ stack: true }),
			winston.format.json(),
			winston.format.metadata(),
		),
	}),
);

//production environment

if (process.env.NODE_ENV == "production") {
}

//logger instance
const logger = winston.createLogger({
	level: config.logs.level,
	levels: winston.config.npm.levels,
	transports,
	exitOnError: true,
	silent: false,
});

export default logger;
