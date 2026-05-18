const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SupportTicket = require("./supportTicket");
const User = require("./user");

const TicketMessage = sequelize.define(
  "TicketMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isAdminResponse: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "ticket_messages",
    timestamps: true,
  }
);

SupportTicket.hasMany(TicketMessage, { foreignKey: "ticketId", onDelete: "CASCADE" });
TicketMessage.belongsTo(SupportTicket, { foreignKey: "ticketId" });
User.hasMany(TicketMessage, { foreignKey: "userId" });
TicketMessage.belongsTo(User, { foreignKey: "userId" });

module.exports = TicketMessage;