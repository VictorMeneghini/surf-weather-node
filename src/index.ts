import { SetupServer } from "./server"
import config from "config"

(async (): Promise<void> => {
  const PORT: number = config.get("App.port")
  const server = new SetupServer(PORT)

  await server.init()
  server.start()
})()