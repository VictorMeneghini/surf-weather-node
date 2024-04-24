import "./util/module-alias";

import { Server } from "@overnightjs/core";
import { ForecastController } from "@src/controller/forecast";
import express, { Application } from "express";
import * as database from "./database";
import { BeachesController } from "./controller/beaches";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup()
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info("Server Started :: PORT", this.port)
    })
  }

  private setupExpress(): void {
    this.app.use(express.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesControlller = new BeachesController()
    this.addControllers([forecastController, beachesControlller]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect()
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
