import {Sequelize} from "sequelize"



const sequelize = new Sequelize('users', 'postgres','Emmanuel2002', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432
});

export default sequelize