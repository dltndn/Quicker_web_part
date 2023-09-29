import { NextFunction, Request, Response } from "express";

import sequelize from "../Maria/Connectors/SequelizeConnector";
import { initModels } from "../Maria/Models/init-models";

import { MulterRequest } from "../routes/order-complete-image";
import { classifyDistance, updateOrder } from "../service/Order";

import {
  findFailImageByOrderId,
  findImageByOrderId,
  saveFailImageToBufferString,
  saveImageToBufferString,
} from "../Mongo/Command/Image";
import { findLocation, saveLocation } from "../Mongo/Command/Location";
import connectMongo from "../Mongo/Connector";
import { averageInstance, locationInstance, orderInstance, roomInstance, userInstance } from "../Maria/Commands";

initModels(sequelize);
export class OrderController {
  async request(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const walletAddress = body.userWalletAddress;
      const user = await userInstance.findId(walletAddress);
      if (user) {
        body.Order.ID_REQ = user.id;
        await orderInstance.create(body);
      } else {
        throw new Error("회원이 아님");
      }
      res.send({ msg: "done" });
    } catch (error) {
      next(error);
    }
  }

  async orderlist(req: Request, res: Response, next: NextFunction) {
    try {
      const orderIds = req.query.orderIds;
      const idList = JSON.parse(`[${orderIds}]`);
      const orders = await orderInstance.findForDetail(idList);
      res.send(orders);
    } catch (error) {
      next(error);
    }
  }

  async order(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.query.orderid;
      if (typeof orderId === "string") {
        const location = await locationInstance.find(parseInt(orderId));
        res.send(location);
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      // @TODO : 리팩토링 보류
      await updateOrder(body);
      res.send({ msg: "done" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getRoomInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const orderNum = query.orderNum;
      let room = null;
      if (typeof orderNum === "string") {
        room = await roomInstance.find(parseInt(orderNum));
      } else if (typeof orderNum === "number") {
        room = await roomInstance.find(orderNum);
      }
      res.send(room);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async postLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const address = body.address;
      const loaction = {
        X: body.X,
        Y: body.Y,
      };
      const connection = await connectMongo("realTimeLocation");
      await saveLocation(connection, address, loaction);
      res.send({ msg: "done" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const address = query.quicker;
      const connection = await connectMongo("realTimeLocation");
      const location = await findLocation(connection, address);
      res.json(location);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getImage(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const orderId = query.orderNum;
      const connection = await connectMongo("orderComplete");
      if (typeof orderId !== "string") {
        throw new Error("TypeError : orderId be string");
      }
      const images = await findImageByOrderId(connection, orderId);
      let image;
      if (images.length === 0) {
        image = null;
      } else {
        image = { imageBuffer: images[0].image };
      }
      res.send(image);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async postImage(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const documentFile = (req as MulterRequest).file;
      const orderNum = body.orderNum;
      const bufferImage = documentFile.buffer;
      const connection = await connectMongo("orderComplete");
      await saveImageToBufferString(connection, orderNum, bufferImage);
      res.send({ msg: "done" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async getFailImage(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const orderId = query.orderNum;
      if (typeof orderId !== "string") {
        throw new Error("TypeError : orderId be string");
      }
      const connection = await connectMongo("orderFail");
      const image = await findFailImageByOrderId(connection, orderId);
      if (image === null || undefined) {
        res.send(null);
      } else {
        res.send({ imageBuffer: image.image, reason: image.reason });
      }
    } catch (error) {
      next(error);
    }
  }

  async postFailImage(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const documentFile = req.file;
      if (documentFile === undefined) {
        throw new Error("File not exist");
      }
      const bufferImage = documentFile.buffer;
      const orderNum = body.orderNum;
      const reason = body.reason;
      const connection = await connectMongo("orderFail");
      await saveFailImageToBufferString(
        connection,
        orderNum,
        bufferImage,
        reason,
      );
      res.send({ msg: "done" });
    } catch (error) {
      next(error);
    }
  }

  async getAverageCost(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const classifiedDistance = await classifyDistance(query);
      const averageCost = await averageInstance.findLastMonthCost(
        classifiedDistance,
      );
      res.send({ distance: averageCost });
    } catch (error) {
      next(error);
    }
  }
}