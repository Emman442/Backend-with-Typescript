
import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import globalErrorHandler from "./controllers/errorController"
import userRouter from "./routes/userRoutes"
import sequelize from "./db/database";
const dotenv = require("dotenv")
import path from "path"


dotenv.config()


const app: Express = express();
app.use(morgan("dev"));
app.use(express.json());




app.use(express.static(path.resolve(__dirname, "dist")));

const connecttoDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database Connected Successfully!!");
  } catch (error) {
    console.log("Error Connecting to DB...: ", error);
  }
};

async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("Database & tables created!");
  } catch (error) {
    console.error("Error creating database & tables:", error);
  }
}
connecttoDB();
syncDatabase();

app.use(globalErrorHandler)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/verify", (req: Request, res: Response) => {
  res.render("verificationEmail");
});

interface UserBasicInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  otp: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserBasicInfo | null;
    }
  }
}





//Routes
app.use("/api/v1/user", userRouter);


app.listen(8000, () => {
  console.log("Server Listening on port 8000");
});
