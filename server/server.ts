import express, { Application, Request, Response } from "express";
import sequelize from "./sequelizeConnector";
import {initModels,User,Birth_date,Join_date,Order,Destination,Transportation,Departure,Product,Pickup,Sender,Recipient} from "./models/DB/init-models";
import UserController = require("./controllers/UserController");

initModels(sequelize);

const cors = require("cors");
const http = require("http");
const io = require("socket.io");
const app: Application = express();
const port: Number = 9000;
const httpServer = http.createServer(app).listen(9001);
const bodyParser = require("body-parser");
const { Sequelize, DataTypes, Op } = require("sequelize");
const crypto = require("crypto");

const socketServer = io(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
require("dotenv").config();
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json());

let roomName = "testroom";

let sockets: Array<Object> = [];
socketServer.on("connect", (socket: any) => {
  sockets.push(socket);
  socket.join(roomName);
  socket.on("sendMessage", (message: MessageObejct, done: Function) => {
    socket.to(roomName).emit("sendMessage", message.data);
    console.log(message.data);
    done();
  });
});

interface MessageObejct {
  data: String;
}

app.get("/", UserController.home);
app.get("/deleteAssociateOrder",UserController.deleteAssociateOrder);
app.post("/deleteAssociateOrderProcess", UserController.deleteAssociateOrderProcess);
app.get("/checkJoin", UserController.checkJoin);
app.post("/orderlist", async (req: Request, res: Response) => {
    let id: number  = parseInt(req.body.id);

    console.log(id)
    
    Order.hasOne(Destination, { foreignKey: "id" });
    Order.hasOne(Departure, { foreignKey: "id" });
    Order.hasOne(Recipient, { foreignKey: "id" });
    Order.hasOne(Sender, { foreignKey: "id" });

    let instance = await Order.findOne({
      where: { id: id },
      attributes: ["id", "DETAIL"],
      include: [
        {
          model: Destination,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
        {
          model: Departure,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
        {
          model: Recipient,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
        {
          model: Sender,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
      ],
    })
    
    res.send(instance);
  });

  app.get(
    "/CreateAssociatedOrdertableTable",
    async (req: Request, res: Response) => {
     
    }
  ),
  app.post("/register", async (req: Request, res: Response) => {
    try {
      const secret = process.env.cryptoKey;
      const userInstance = req.body.User;
      const userBirthDate = req.body.Birthday;
      //NOTE : 전화번호를 기반으로 암호화한 id 사용
      const hashed = crypto
        .createHmac("sha256", secret)
        .update(userInstance.contact)
        .digest("hex");
      userInstance.id = hashed;
      userBirthDate.id = hashed;

      await User.create(userInstance);
      await Birth_date.create(userBirthDate);
      await Join_date.create({
        id: hashed,
        timeStamp: Math.floor(Date.now() / 100),
      });
      return res.send({ msg: "done" });
    } catch (error) {
      res.send(error);
    }
  });
  app.post("/request", async (req: Request, res: Response) => {
    try {
      const data = req.body

      console.log(data)
      // 사용자의 아이디를 찾아서 ID_REQ에 집어 넣어야함 
      let userId = await User.findOne({
        attributes : ['id'],
        where: { wallet_address: data.userWalletAddress },
      });
      if (userId){
        console.log(userId)
        data.Order.ID_REQ = userId.dataValues.id;
        (async () => {
          await Order.create(data.Order)
          Transportation.create(data.Transportation)
          Destination.create(data.Destination)
          Departure.create(data.Departure)
          Product.create(data.Product)
          Sender.create(data.Sender)
          Recipient.create(data.Recipient)
        }) ()
        res.send("done")
      }
      res.send("empty")
      

      return res.send({ msg: data });
    } catch (error) {
      // res.send(error);
    }
  });

app.listen(port, () => {console.log(`App is listening on port ${port} !`);});
