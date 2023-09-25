import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express, { Application } from "express";

import { insertAverageCostPerMonth } from "./middlewares/cron-job";
import { customMorgan } from "./middlewares/custom-morgan";
import { createLogFolder } from "./middlewares/createLogFolder";

const loader = {
  init : async (app: Application) => {

    insertAverageCostPerMonth
    await createLogFolder()

    app.use(customMorgan())
    app.use(compression());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json());
  
    return app;
  }
} 

export default loader