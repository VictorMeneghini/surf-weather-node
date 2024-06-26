import config, { IConfig } from "config"
import mongoose, { connection } from "mongoose"

const dbConfig: IConfig = config.get("App.database")

export const connect = async (): Promise<void> => {
  await mongoose.connect(dbConfig.get("mongoUrl"))
}

export const close = async (): Promise<void> => {
  await mongoose.disconnect();
}