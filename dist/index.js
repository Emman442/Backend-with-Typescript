"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const database_1 = __importDefault(require("./db/database"));
const dotenv = require("dotenv");
const path_1 = __importDefault(require("path"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.resolve(__dirname, "dist")));
const connecttoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.authenticate();
        console.log("Database Connected Successfully!!");
    }
    catch (error) {
        console.log("Error Connecting to DB...: ", error);
    }
});
function syncDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database_1.default.sync();
            console.log("Database & tables created!");
        }
        catch (error) {
            console.error("Error creating database & tables:", error);
        }
    });
}
connecttoDB();
syncDatabase();
app.use(errorController_1.default);
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.get("/verify", (req, res) => {
    res.render("verificationEmail");
});
//Routes
app.use("/api/v1/user", userRoutes_1.default);
app.listen(8000, () => {
    console.log("Server Listening on port 8000");
});
