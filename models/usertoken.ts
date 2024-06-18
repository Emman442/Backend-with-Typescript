import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../db/database";

class UserToken extends Model {
  public id!: number;
  public token!: string;
  public userId!: number;


  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  
  static associate(models: any) {
    // define association here if needed
  }
}

UserToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    
  },
  {
    sequelize,
    modelName: "UserToken",
    tableName: "UserTokens", // Optional: If you want to specify table name explicitly
    timestamps: true, // Optional: If you want Sequelize to manage createdAt and updatedAt fields
    
    
  }
);

export default UserToken;