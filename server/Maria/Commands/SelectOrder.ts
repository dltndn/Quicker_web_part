import { Transportation, Sender, Recipient, Destination, Departure, Product, Order} from "../Models/init-models";
const { Op } = require("sequelize");

export default {
  receiverPhoneNumber: (orderId: number) => {
    return Recipient.findOne({
      attributes: ["id", "PHONE"],
      where: { id: orderId },
    });
  },

  location: (orderId: number) => {
    Order.hasOne(Destination, { foreignKey: "id" });
    Order.hasOne(Departure, { foreignKey: "id" });
    return Order.findOne({
      attributes: ["id"],
      where: { id: orderId },
      include: [
        {
          model: Destination,
          attributes: { exclude: ["id", "DETAIL"] },
          required: true,
        },
        {
          model: Departure,
          attributes: { exclude: ["ID", "id", "DETAIL"] },
          required: true,
        },
      ],
      raw: true,
      nest: true,
    });
  },

  allLocation: (orderIds: number []) => {
    Order.hasOne(Destination, { foreignKey: "id" });
    Order.hasOne(Departure, { foreignKey: "id" });
    return Order.findAll({
      attributes: ["id"],
      where: { id: orderIds },
      include: [
        {
          model: Destination,
          attributes: { exclude: ["id", "DETAIL"] },
          required: true,
        },
        {
          model: Departure,
          attributes: { exclude: ["ID", "id", "DETAIL"] },
          required: true,
        },
      ],
      raw: true,
      nest: true,
    });
  },

  // 검색페이지의 오더 리스트 목록
  getRequests: (userId: string) => {
    Order.hasOne(Transportation, { foreignKey: "id" });
    Order.hasOne(Destination, { foreignKey: "id" });
    Order.hasOne(Departure, { foreignKey: "id" });
    Order.hasOne(Product, { foreignKey: "id" });
    return Order.findAll({
      attributes: ["id", "PAYMENT", "DETAIL"],
      where: {
        [Op.and]: [
          {
            ID_REQ: {
              [Op.ne]: userId,
            },
          },
          {
            ID_DVRY: {
              [Op.eq]: "",
            },
          },
        ],
      },
      include: [
        {
          model: Transportation,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
        {
          model: Destination,
          attributes: { exclude: ["id"] },
          required: true,
        },
        {
          model: Departure,
          attributes: { exclude: ["ID", "id"] },
          required: true,
        },
        {
          model: Product,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
      ],
      raw: true,
      nest: true,
    });
  },

  getOrderlist: (orderIds: number[]) => {
    Order.hasOne(Destination, { foreignKey: "id" });
    Order.hasOne(Departure, { foreignKey: "id" });
    Order.hasOne(Recipient, { foreignKey: "id" });
    Order.hasOne(Sender, { foreignKey: "id" });
    Order.hasOne(Product, { foreignKey: "id" });
    return Order.findAll({
      where: { id: orderIds },
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
        {
          model: Product,
          attributes: { exclude: ["ID", "id"] },
          required: false,
        },
      ],
      raw: true,
      nest: true,
    });
  },
};
