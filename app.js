import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routers/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

// 미들웨어 1
app.use(express.json());

// 미들웨어 2
app.use(express.urlencoded({ extended: true }));

// 미들웨어 3
app.use(express.static("./assets"));

// 미들웨어 4
app.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl, " - ", new Date());
  next();
});

// mongoose 연결
connect();

const router = express.Router();

// 미들웨어  5
app.use("/api", [router, todosRouter]);

router.get("/", (req, res) => {
  return res.json({ message: "연습용 사이트입니다." });
});

// 에러 처리 미들웨어를 등록한다.
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log("네가 원하는 " + PORT + "로 열렸습니다. 확인해보세요.");
});
