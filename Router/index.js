const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
require("dotenv").config();

const {
  User,
  Category,
  Product,
  Account,
  Order,
  UserRole,
  Shop,
} = require("../model/Schema");
const bcrypt = require("bcrypt");
const { isAuth, isAdmin, upload } = require("../Router/Auth");
const { findSourceMap } = require("module");
const { log } = require("console");

router.get("/", (req, res) => {
  res.redirect("/login");
});

///login get router
router.get("/login", async (req, res) => {
  const footer = await Shop.findOne({})

  res.render("login", {
    success: req.flash("success"),
    error: req.flash("error"),
    footer,
  });
});

//// login post router
router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const footer = await Shop.findOne({})

    const user = await User.findOne({ username: userName });

    // check for user name
    if (!user) {
      return res.status(401).render("login", {
        error: `invalid user name`,
        success: "",
        footer,
      });
    }

    //check password
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(401).render("login", {
        error: `invalid Password`,
        success: "",
        footer,
      });
    }

    // genret token
    const token = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.KEY
    );

    // send token vai cookies
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60),
      httpOnly: true,
    });
    // redirect to admin page
    res.status(200).redirect("/admin");
  } catch (error) {
    console.log(error);
  }
});

//  register get router
router.get("/register", isAuth, isAdmin, async (req, res) => {
  const userdata = req.user.id;
  const footer = await Shop.findOne({})


  if (userdata == undefined) {
    res.redirect("/");
  }

  const roles = await UserRole.find({});

  const users = await User.find({});
  res.render("register", {
    success: req.flash("success"),
    errors: req.flash("errors"),
    userdata: userdata,
    role: roles,
    data: users,
    footer,
  });
});

///register Post router
router.post("/register", isAuth, upload.single("img"), async (req, res) => {
  try {
    const roles = await UserRole.find({});
    const users = await User.find({});

    const {
      firstName,
      lastName,
      username,
      password,
      email,
      mobile,
      addres,
      role,
    } = req.body;

    const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }

    const userData = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})


    if (await User.findOne({ username })) {
      req.flash("errors", "This username is already registered. Please choose another.");
      return res.render("register", { userdata: userData, role: roles, data: users, footer });
    }

    if (await User.findOne({ email })) {
      req.flash("errors", "This email is already registered. Please choose another.");
      return res.render("register", { userdata: userData, role: roles, data: users, footer });
    }

    if (await User.findOne({ mobile })) {
      req.flash("errors", "This mobile number is already registered. Please choose another.");
      return res.render("register", { userdata: userData, role: roles, data: users });
    }

    const hashpass = await bcrypt.hash(password, 10);
    const { filename } = req.file;

 
    const resizedPath = path.resolve(req.file.destination, "resized", filename);
    await sharp(req.file.path).resize(200, 200).jpeg({ quality: 90 }).toFile(resizedPath);
    fs.unlinkSync(req.file.path);

    await User.create({
      firstName,
      lastName,
      username,
      password: hashpass,
      email,
      mobile,
      addres,
      role,
      img: filename,
    });

    req.flash("success", `your setting save success fully`);
    res.redirect("back");
    
  } catch (err) {
    console.error(err);
    req.flash("errors", "Something went wrong.");
    res.redirect("back");
  }
});





// admin get router
router.get("/admin", isAuth, async (req, res) => {
  const userdata = await User.findOne({ _id: req.user.id });
  const footer = await Shop.findOne({})

  const moment = require("moment");
  const accountList = await Account.aggregate([
    {
      $project: {
        accTitel: 1,
        debit: {
          $sum: "$transaction.debit",
        },
        credit: {
          $sum: "$transaction.credit",
        },
      },
    },
  ]);

  const income = await Account.aggregate([
    [
      {
        $unwind: {
          path: "$transaction",
        },
      },
      {
        $match: {
          "transaction.type": {
            $eq: "Income",
          },
        },
      },
      {
        $group: {
          _id: "$transaction.type",
          credit: {
            $sum: {
              $add: ["$transaction.credit"],
            },
          },
        },
      },
    ],
  ]);

 

   const expense = await Account.aggregate([
    {
      $unwind: {
        path: "$transaction",
      },
    },
    {
      $match: {
        "transaction.type": {
          $eq: "Expense",
        },
      },
    },
    {
      $group: {
        _id: "$transaction.type",
        debit: {
          $sum: {
            $add: "$transaction.debit",
          },
        },
      },
    },
  ]);
  const payable = await Account.aggregate([
    {
      $match: {
        accTitel: {
          $eq: "Payable",
        },
      },
    },
    {
      $project: {
        credit: {
          $sum: "$transaction.credit",
        },
        debit: {
          $sum: "$transaction.debit",
        },
      },
    },
  ]);

  const recivebale = await Account.aggregate([
    {
      $match: {
        accTitel: {
          $eq: "Receivable",
        },
      },
    },
    {
      $project: {
        credit: {
          $sum: "$transaction.credit",
        },
        debit: {
          $sum: "$transaction.debit",
        },
      },
    },
  ]);
  const productLimit = await Product.aggregate([
    {
      $match: {
        quantity: {
          $lte: 50,
        },
      },
    },
    {
      $lookup: {
        let: {
          searchId: "$Name",
        },
        from: "orders",
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$$searchId", "$item.productName"],
              },
            },
          },
          {
            $project: {
              _id: 0,
              item: 1,
              selling: {
                $sum: "$item.productCount",
              },
            },
          },
        ],
        as: "order",
      },
    },
    {
      $unwind: {
        path: "$order",
      },
    },
    {
      $unwind: {
        path: "$order.item",
      },
    },
    {
      $group: {
        _id: "$Name",
        quntity: {
          $first: "$quantity",
        },
        order: {
          $sum: "$order.selling",
        },
      },
    },
  ]);

  const currentYear = moment().year();

  const chartdata = await Account.aggregate([
    { $unwind: "$transaction" },
    {
      $match: {
        "transaction.type": { $nin: ["Transfer", "Payable", "Recivebal"] },
        $expr: { $eq: [{ $year: "$transaction.date" }, currentYear] },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$transaction.date" } },
        income: {
          $sum: {
            $cond: [
              { $eq: ["$transaction.type", "Income"] },
              "$transaction.credit",
              0,
            ],
          },
        },
        expense: {
          $sum: {
            $cond: [
              { $eq: ["$transaction.type", "Expense"] },
              "$transaction.debit",
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        month: "$_id.month",
        income: 1,
        expense: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);

  const fullIncome = Array(12).fill(0);
  const fullExpense = Array(12).fill(0);

  chartdata.forEach((item) => {
    const idx = item.month - 1;
    fullIncome[idx] = item.income;
    fullExpense[idx] = item.expense;
  });

  // Weekly Revenue

  const startOfWeek = moment().startOf("week").toDate();
  const endOfWeek = moment().endOf("week").toDate();

  const weeklyRevenue = await Account.aggregate([
    { $unwind: "$transaction" },
    {
      $match: {
        "transaction.date": { $gte: startOfWeek, $lte: endOfWeek },
        "transaction.type": { $in: ["Income", "Expense"] },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfWeek: "$transaction.date" },
          type: "$transaction.type",
        },
        total: {
          $sum: {
            $cond: [
              { $eq: ["$transaction.type", "Income"] },
              "$transaction.credit",
              "$transaction.debit",
            ],
          },
        },
      },
    },
  ]);

  const weeklyIncome = Array(7).fill(0);
  const weeklyExpense = Array(7).fill(0);

  weeklyRevenue.forEach((entry) => {
    const dayIndex = entry._id.day - 1;
    if (entry._id.type === "Income") {
      weeklyIncome[dayIndex] = entry.total;
    } else {
      weeklyExpense[dayIndex] = entry.total;
    }
  });

  let weeklyRevenueTotal = 0;

  weeklyRevenue.forEach((val) => {
    if (val._id.type === "Income") {
      weeklyRevenueTotal += val.total;
    } else if (val._id.type === "Expense") {
      weeklyRevenueTotal -= val.total;
    }
  });

  res.render("admin", {
    success: req.flash("success"),
    errors: req.flash("errors"),
    userdata: userdata,
    porLim: productLimit,
    accountList: accountList,
    income: income[0],
    expense: expense[0],
    payable: payable[0],
    recivebale: recivebale[0],
    chartdata: chartdata,
    incomedata: fullIncome,
    expenses: fullExpense,
    footer: footer,
    weeklyRev: Math.floor(weeklyRevenueTotal),
  });
});

//logout get router
router.get("/logout", isAuth, async (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/login");
});

//profile setting get router
router.get("/profile", isAuth, async (req, res) => {
  const data = await User.findOne({ _id: req.user.id });
  const footer = await Shop.findOne({})
  res.render("profile", {
    success: req.flash("success"),
    errors: req.flash("errors"),
    userdata: data,
    data: data,
    footer: footer,
  });
});

//home page and shop seting POST router
router.post("/update/:id", upload.single("Profile"), async (req, res) => {
  try {
    const data = await User.findById(req.params.id);
    const { firstName, lastName, mobile, email } = req.body;

    const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

    if (req.file) {
      if (data?.img) {
        const oldImagePath = path.join(
          __dirname,
          "../public/uploads/resized/",
          data.img
        );
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }

      //*****resized image */
      const { filename: image } = req.file;
      await sharp(req.file.path)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(path.resolve(req.file.destination, "resized", image));

      fs.unlinkSync(req.file.path);

      data.img = req.file.filename;
      data.firstName = firstName;
      data.lastName = lastName;
      data.mobile = mobile;
      data.email = email;
    } else {
      data.firstName = firstName;
      data.lastName = lastName;
      data.mobile = mobile;
      data.email = email;
    }

    await data.save();

    req.flash("success", `your setting save success fully`);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
});

//update password
router.post("/updatep/:id", upload.single("Profile"), async (req, res) => {
  try {
    const { password, cpassword } = req.body;

    const data = await User.findById(req.params.id);
    if (password !== cpassword) {
      req.flash("errors", `both password must be same`);
      return res.redirect("back");
    }
    const hashpass = await bcrypt.hash(password, 10);
    data.password = hashpass;
    await data.save();

    req.flash("success", `your setting save success fully`);
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
});

// chart data get router
router.get("/chart", async (req, res) => {
  const chartdata = await Account.aggregate([
    {
      $unwind: {
        path: "$transaction",
      },
    },
    {
      $match: {
        $and: [
          {
            "transaction.type": {
              $ne: "Transfer",
            },
          },
          {
            "transaction.type": {
              $ne: "Payable",
            },
          },
          {
            "transaction.type": {
              $ne: "Recivebal",
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: "$transaction.type",
        debit: {
          $sum: "$transaction.debit",
        },
        credit: {
          $sum: "$transaction.credit",
        },
        Week: {
          $week: "$transaction.date",
        },
      },
    },
    {
      $group: {
        _id: "$Week",
        income: {
          $sum: "$credit",
        },
        expens: {
          $sum: "$debit",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  res.status(200).json(chartdata);
});
//get roll detail router and footer
router.get("/role", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const rol = await UserRole.findOne({ titel: userdata.role });
    const footer = await Shop.findOne({})

    res.status(201).json({
      status: "success",
      data: rol,
      footer: footer,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/validate", (req, res) => {
  res.render("validate");
});

module.exports = router;
