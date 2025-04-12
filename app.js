const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const DB = process.env.DATABASE;
const SESSION_DB = process.env.SESSION_DB;

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MozgoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));

const store = new MongoStore({
  uri: SESSION_DB,
  collection: "mySessions",
});

app.use(session({
  secret: "mySecretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  store,
}));


app.set("view engine", "ejs");
app.set(path.join(__dirname, "uploads"));
app.set(path.join(__dirname, "public"));
app.use(require("connect-flash")());
app.use(require("nocache")());
app.use(require("cookie-parser")())
app.use(bodyParser.json());;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use("/", require("./Router/index"));
app.use("/category", require("./Router/category"));
app.use("/brand", require("./Router/brand"));
app.use("/unit", require("./Router/unit"));
app.use("/supplier", require("./Router/supplier"));
app.use("/product", require("./Router/product"));
app.use("/coupon", require("./Router/coupon"));
app.use("/coustomer", require("./Router/Coustomer"));
app.use("/account", require("./Router/account"));
app.use("/wallet", require("./Router/walletbalance"));
app.use("/user", require("./Router/pos"));
app.use("/userrole", require("./Router/userRole"));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));