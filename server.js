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
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUploader({
  useTempFiles: true,
  tempFileDir: '/tmp/',  // Temporary directory for storing files
  limits: { fileSize: 50 * 1024 * 1024 }  // Set file size limit if needed (5MB example)
}))
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
  res.send("Welcome to Groceria Stores!");
});


app.listen(port, () => {
  console.log("App is currently Up & Running, server is listening to port:", port);
});