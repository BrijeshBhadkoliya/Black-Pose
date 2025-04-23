const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { isAuth, isAdmin, upload } = require("../Router/Auth");
const { User, Category, UserRole,Shop } = require("../model/Schema");

// category get router
router.get("/list", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    const catList = await Category.find({});

    res.render("category", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: catList,
      footer:footer
    });
  } catch (error) {
    console.log(error);
  }
});
// add category post router
router.post("/catlist-add", upload.single("catImg"), async (req, res) => {
  try {
         const catName = req.body.catName;
         const catImg = req.file.filename;
         const catList = await Category.findOne({ catName: catName });

         const fields = {
          catName:"Categorey Name"
        }
        const missingF = Object.entries(req.body)
        .filter(([key, val]) => val.trim() === "")
        .map(([key]) => fields[key] || key);
      
      if (missingF.length > 0) {
        req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
        return res.redirect("back");
      }
       
        
    
        if (catList) {
          fs.unlinkSync(req.file.path);
          req.flash("errors", `${catName} alredy added please choose onother`);
          return res.redirect("/category/list");
        }
    
        //*****resized image */
        const { filename: image } = req.file;
        await sharp(req.file.path)
          .resize(200, 200)
          .jpeg({ quality: 90 })
          .toFile(path.resolve(req.file.destination, "resized", image));
    
        fs.unlinkSync(req.file.path);
    
        const newCat = await Category.create({ catName, catImg });
    
        req.flash("success", `${catName} Add success fuly`);
        res.redirect("/category/list");
  } catch (error) {
    console.log(error);
  }
});
// cat status switchry
router.get("/updateCatstatus/:id", isAuth, async (req, res) => {
  try {
    const cat = await Category.findOne({ _id: req.params.id });

    cat.status == "active"
      ? (cat.status = "deactive")
      : (cat.status = "active");

    await cat.save();
    res.status(200).json({
      success: "category status update !!!!!",
    });
  } catch (error) {
    console.log(error);
  }
});
// update category get router
router.get("/updateCategory/:id", isAuth, async (req, res) => {
  try {
    const cat = await Category.findOne({ _id: req.params.id });
    const footer = await Shop.findOne({})
    const userdata = await User.findOne({ _id: req.user.id });
      
      res.render("updateCategory", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        data: cat,
        footer:footer
      });
  } catch (error) {
    console.log(error);
  }
});
//update category post router
router.post(
  "/updateCat/:id",
  isAuth,
  upload.single("catImg"),
  async (req, res) => {
    try {
      var cat = await Category.findOne({ _id: req.params.id });
      cat.catName = req.body.catName;

      const fields = {
        catName:"Categorey Name"
      }
      const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => fields[key] || key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

      if (req.file) {
        if (cat?.catImg) {
                const oldImagePath = path.join(__dirname, '../public/uploads/resized/', cat.catImg);
                   
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
 
        cat.catImg = req.file.filename;
      } 

      const catList = await Category.findOne({
        catName: req.body.catName,
        _id: { $ne: req.params.id },
      });

      if (catList) {
        req.flash(
          "errors",
          `${req.body.catName} alredy added please choose onother`
        );
        return res.redirect("/category/list");
      }
      await cat.save();
      req.flash("success", `${req.body.catName} update success fully`);
      res.redirect("/category/list");
    } catch (error) {
      console.log(error);
    }
  }
);
//delet category
router.get("/delcat/:id", isAuth, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (cat?.catImg) {
      const oldImagePath = path.join(__dirname, '../public/uploads/resized/', cat.catImg);
        
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }
    const del = await Category.findByIdAndDelete(req.params.id);
      req.flash("success", `${del.catName} Delet success fuly`);
      res.redirect("/category/list");
  } catch (error) {
    console.log(error);
  }
});

///************** SUB CATEGORY ROUTER************ */

// add sub category get router
router.get("/subCategory", isAuth, async (req, res) => {
  try {

    const userdata = await User.findOne({ _id: req.user.id });
    const catList = await Category.find({});
    const footer = await Shop.findOne({})

    res.render("subCategory", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: catList,
      footer
    });

  } catch (error) {
    console.log(error);
  }
});

// add sub category post router
router.post("/subcatlist-add", upload.single("catImg"), async (req, res) => {
  try {
    const subcatName = req.body.subcatName;
    const catList = await Category.findById({ _id: req.body.mainCat });
    var xyz = "";
    const subCat = await Category.aggregate([{ $unwind: "$subcatNames" }]);

    const fields = {
      mainCatL:"Categorey Name",
      subcatName:"SubCategorey Name"
    }
    const missingF = Object.entries(req.body)
    .filter(([key, val]) => val.trim() === "")
    .map(([key]) => fields[key] || key);
  
  if (missingF.length > 0) {
    req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
    return res.redirect("back");
  }

    subCat.forEach(function (data) {
      if (data.subcatNames.subcatname == subcatName) {
        xyz = "true";
      }
    });

    if (xyz == "true") {
      req.flash("errors", `${subcatName} alredy added please choose onother`);
      return res.redirect("/category/subCategory");
    }

    catList.subcatNames = catList.subcatNames.concat({
      subcatname: subcatName,
    });

    await catList.save();

    req.flash("success", `${subcatName} Add success fuly`);
    res.redirect("/category/subCategory");
  } catch (error) {
    console.log(error);
  }
});

// update sub category get router
router.get("/updateSubCategory/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({})

    var data = {
      subcatnam: "",
      id: req.params.id,
    };
    const cat = await Category.findOne({ _id: req.params.id.split("+")[1] });
    cat.subcatNames.forEach((subcat, i) => {
      if (subcat._id.toString() == req.params.id.split("+")[0]) {
        data.subcatnam = subcat.subcatname;
      }
    });
    res.render("updateSubCat", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: data,
      footer
    });
  } catch (error) {
    console.log(error);
  }
});

//update sub category post router
router.post(
  "/updatesubCat/:id",
  isAuth,
  upload.single("catImg"),
  async (req, res) => {
    try {
      const cat = await Category.findOne({ _id: req.params.id.split("+")[1] });

      cat.subcatNames.forEach((subcat, i) => {
        if (subcat._id.toString() == req.params.id.split("+")[0]) {
          subcat.subcatname = req.body.subcatName;
        }
      });

      const fields = {
        subcatName:"SubCategorey Name"
      }
      const missingF = Object.entries(req.body)
      .filter(([key, val]) => val.trim() === "")
      .map(([key]) => fields[key] || key);
    
    if (missingF.length > 0) {
      req.flash("errors", `Missing fields: ${missingF.join(", ")}`);
      return res.redirect("back");
    }

      await cat.save();
      req.flash("success", `${req.body.catName} update success fuly`);
      res.redirect("/category/subCategory");
    } catch (error) {
      console.log(error);
    }
  }
);

//delet category
router.get("/delsubcat/:id", isAuth, async (req, res) => {
  try {
    var del = "";
    const cat = await Category.findOne({ _id: req.params.id.split("+")[1] });
    cat.subcatNames.forEach((subcat, i) => {
      if (subcat._id.toString() == req.params.id.split("+")[0]) {
        del = cat.subcatNames.splice(i, 1);
      }
    });
    await cat.save();

    req.flash("success", `${del.subcatname} Delet success fuly`);
    res.redirect("/category/subCategory");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
