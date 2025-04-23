const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isAuth, isAdmin, upload } = require("../Router/Auth");
const { Unit, User, Shop } = require("../model/Schema");

//add brand get router
router.get("/unit", isAuth, async (req, res) => {
  try {
    const unitList = await Unit.find({});
    const userdata = await User.findOne({ _id: req.user.id });
    const footer =await Shop.findOne({})

    res.render("unit", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: unitList,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});
// add brand post router
router.post("/unit-add", async (req, res) => {
  try {
    const unit = req.body.unit;


    const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }



    const unitList = await Unit.findOne({ unit: unit });

    if (unitList) {
      req.flash("errors", `${unit} alredy added please choose onother`);
      return res.redirect("/unit/unit");
    }
    const newunit = await Unit.create({ unit });

    req.flash("success", `${unit} Add success fuly`);
    res.redirect("/unit/unit");
  } catch (error) {
    console.log(error);
  }
});
// update brand get router
router.get("/updateunit/:id", isAuth, async (req, res) => {
  try {
    const unit = await Unit.findById({ _id: req.params.id });
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    res.render("updateUnit", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: unit,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});
//update brand post router
router.post("/unit-update", isAuth, async (req, res) => {
  try {
    const unitName = await Unit.findOne({ unit: req.body.unit });


    const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }


    if (unitName) {
      req.flash(
        "errors",
        `${req.body.unit} alredy added please choose onother`
      );
      return res.redirect("/unit/unit");
    }

    var unitList = await Unit.findByIdAndUpdate(req.body.editid, {
      unit: req.body.unit,
    });

    // unitList.unit= req.body.unit;

    // await brand.save();
    req.flash("success", `${req.body.unit} update success fuly`);
    res.redirect("/unit/unit");
  } catch (error) {
    console.log(error);
  }
});
//delet brand
router.get("/delunit/:id", isAuth, async (req, res) => {
  try {
    const del = await Unit.findByIdAndDelete(req.params.id);
    req.flash("success", `${del.unit} Delet success fuly`);
    res.redirect("/unit/unit");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
