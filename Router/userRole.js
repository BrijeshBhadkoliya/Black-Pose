const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isAuth, isAdmin, upload, uploadcsv } = require("../Router/Auth");
const {
  User,
  Category,
  Brand,
  Unit,
  Supplier,
  Product,
  Account,
  UserRole,
  Shop,
} = require("../model/Schema");
const path =require("path")
const fs=  require("fs")
const sharp =require('sharp')
// add user and user List
router.get("/list", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const users = await User.find({});
    const role = await UserRole.find({});
    const footer =await Shop.findOne({});

    res.render("register", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: users,
      role: role,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

// user role
router.get("/userRoles", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const data = await UserRole.find({});
    const footer = await Shop.findOne({});

    res.render("userRoles", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: data,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

//add role Post Router
router.post("/addRole", async (req, res) => {
  try {
    var {
      titel,
      category,
      brand,
      product,
      limit_product_list,
      coupon,
      account,
      income,
      expense,
      coustomer,
      supplier,
      setting,
    } = req.body;

    typeof category == "string" ? (category = [category]) : "";
    typeof brand == "string" ? (brand = [brand]) : "";
    typeof product == "string" ? (product = [product]) : "";

    typeof limit_product_list == "string"
      ? (limit_product_list = [limit_product_list])
      : "";
    typeof coupon == "string" ? (coupon = [coupon]) : "";
    typeof account == "string" ? (account = [account]) : "";
    typeof income == "string" ? (income = [income]) : "";
    typeof expense == "string" ? (expense = [expense]) : "";
    typeof coustomer == "string" ? (coustomer = [coustomer]) : "";
    typeof supplier == "string" ? (supplier = [supplier]) : "";
    typeof setting == "string" ? (setting = [setting]) : "";

    const data = new UserRole({
      titel,
      category,
      brand,
      product,
      limit_product_list,
      coupon,
      account,
      income,
      expense,
      coustomer,
      supplier,
      setting,
    });
    await data.save();

    res.redirect("/userrole/userRoles");
  } catch (error) {
    console.log(error);
  }
});

//update coustomer
router.get("/update/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer =await Shop.findOne({});

    const users = await User.findById(req.params.id);
    const role = await UserRole.find({});

    res.render("updateUser", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: users,
      role: role,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/deletlist/:id", isAuth, async (req, res) => {
  try {
    const imgDlet = await User.findById(req.params.id)

    if(imgDlet?.img) {
      const oldImagePath = path.join(__dirname, '../public/uploads/resized/', imgDlet.img);
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }
    const users = await User.findByIdAndDelete(req.params.id);
    req.flash("success", `${users.username} delet success fully`);
    res.redirect("/userrole/list");
  } catch (error) {
    console.log(error);
  }
});





// update user
router.post("/userupdate", isAuth, upload.single("img"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobile,
      addres,
      username,
      userid,
      role,
    } = req.body;
    
    const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

    const roles = await UserRole.find({});
    const users = await User.find({});
    const userData = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    if (req.file) {
      const imgDlet = await User.findById(userid)
      if(imgDlet?.img) {
              const oldImagePath = path.join(__dirname, '../public/uploads/resized/', imgDlet.img);
              try {
                if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);    
                }
              } catch (err) {
                console.error("Error deleting old image:", err);
              }
            }

            const { filename } = req.file;

           
            const resizedPath = path.resolve(req.file.destination, "resized", filename);
            await sharp(req.file.path).resize(200, 200).jpeg({ quality: 90 }).toFile(resizedPath);
            fs.unlinkSync(req.file.path); 
      
            const data = await User.findByIdAndUpdate(userid, {
            ...req.body,
            img: filename,
      });
      req.flash("success", `${data.username} update success fully`);
      res.redirect("/userrole/list")
    
    } else {
      const data = await User.findByIdAndUpdate(userid, {
        ...req.body,
      });
      req.flash("success", `${data.username} update success fully`);
      res.redirect("/userrole/list")
    }
  } catch (error) {
    console.log(error);
  }
});






// update user role get router
router.get("/roleupdate/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    const role = await UserRole.findById(req.params.id);

    res.render("updateRole", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      role: role,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

// update user role post router
router.post("/updaterole/:id", async (req, res) => {
  try {
    const data = await UserRole.findByIdAndUpdate(req.params.id, req.body);

    res.redirect("/userrole/userRoles");
  } catch (error) {
    console.log(error);
  }
});

//remove user role
router.get("/delet/:id", isAuth, async (req, res) => {
  try {
    const data = await UserRole.findByIdAndDelete(req.params.id);

    res.redirect("/userrole/userRoles");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
