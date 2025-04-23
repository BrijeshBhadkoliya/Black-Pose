const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { isAuth, isAdmin, upload } = require("../Router/Auth");
const { User, Category, Brand, UserRole, Shop } = require("../model/Schema");
const { log } = require("console");

//add brand get router
router.get("/add", isAuth, async (req, res) => {
  try {
   
    const userdata = await User.findOne({ _id: req.user.id });

      const rol = await UserRole.findOne({ titel: userdata.role });
      const footer = await Shop.findOne({})


      const brandList = await Brand.find({});

      res.render("brand", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        role: rol,
        data: brandList,
        footer: footer,
      });
   
  } catch (error) {
    console.log(eoor);
  }
});

// add brand post router
router.post("/brand-add", upload.single("braImg"), async (req, res) => {
  try {
      const brandName = req.body.braName;
      const brandImg = req.file.filename;
      const brandList = await Brand.findOne({ brandName: brandName });
 
      const fields = {
        braName:"Brand Name"
      }
      const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => fields[key] || key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

      if (brandList) {
        fs.unlinkSync(req.file.path);
        req.flash("errors", `${brandName} alredy added please choose onother`);
        return res.redirect("/brand/add");
      }

      //*****resized image */
      const { filename: image } = req.file;
      await sharp(req.file.path).toFile(path.resolve(req.file.destination, "resized", image));

      fs.unlinkSync(req.file.path);
      const newbrand = await Brand.create({ brandName, brandImg });

      req.flash("success", `${brandName} Add success fuly`);
      res.redirect("/brand/add");
  } catch (error) {
    console.log(error);
  }
});

// update brand get router
router.get("/updatebrand/:id", isAuth, async (req, res) => {
  try {
    const footer = await Shop.findOne({})

    const userdata = await User.findOne({ _id: req.user.id });
    const brand = await Brand.findById({ _id: req.params.id });
    res.render("updateBrand", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: brand,
      footer: footer,
    });
  } catch (error) {
    console.log(error);
  }
});

//update brand post router
router.post(
  "/brand-update/:id",
  isAuth,
  upload.single("braImg"),
  async (req, res) => {
    try {
      var brand = await Brand.findOne({ _id: req.params.id });
      brand.brandName = req.body.braName;

      const fields = {
        braName:"Brand Name"
      }
      const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => fields[key] || key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

      if (req.file) {
        if (brand?.brandImg) {
          const oldImagePath = path.join(__dirname, '../public/uploads/resized/', brand.brandImg);
            
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
        await sharp(req.file.path).toFile(path.resolve(req.file.destination, "resized", image));

        fs.unlinkSync(req.file.path);

        brand.brandImg = req.file.filename;
      }

      const brandList = await Brand.findOne({
        brandName: req.body.braName,
        _id: { $ne: req.params.id },
      });

      if (brandList) {
        req.flash(
          "errors",
          `${req.body.braName} alredy added please choose onother`
        );
        return res.redirect("/brand/add");
      }
      await brand.save();
      req.flash("success", `${req.body.braName} update success fuly`);
      res.redirect("/brand/add");
    } catch (error) {
      console.log(error);
    }
  }
); 
//delet brand
router.get("/delbrand/:id", isAuth, async (req, res) => {
  try {
     const brand = await Brand.findById(req.params.id)
        if (brand?.brandImg) {
          const oldImagePath = path.join(__dirname, '../public/uploads/resized/', brand.brandImg);
            
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
    const del = await Brand.findByIdAndDelete(req.params.id);
      req.flash("success", `${del.brandName} Delet success fuly`);
      res.redirect("/brand/add");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
