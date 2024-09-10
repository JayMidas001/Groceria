const express = require("express");
require("./config/dbConfig");
require(`dotenv`).config()
const port = process.env.port || 1188;
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const merchantRouter = require("./routers/merchantRouter");
const fileUploader = require("express-fileupload");
const cartRouter = require("./routers/cartRouter");
const keepServerAlive = require(`./helpers/keepServerAlive`)

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(fileUploader({ useTempFiles: true }));
app.use(cors({ origin: "*", credentials: true}));
app.use(morgan("dev"));

app.use("/api/v1", userRouter);
app.use("/api/v1", merchantRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", cartRouter);

keepServerAlive();


app.get('/1', (req, res) => {
    res.send('Server is alive!');
});

app.get("/", (req, res) => {
  res.send("Welcome to Groceria!");
});

app.listen(port, () => {
  console.log("App is currently Up & Running, server is listening to port:", port);
});