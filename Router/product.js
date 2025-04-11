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
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
var csv = require("fast-csv");
const { parse } = require("fast-csv");
var Excel = require("exceljs");
const { log } = require("console");

// add product get router
router.get("/add", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const findrole = userdata.role;
    const userrole = await UserRole.find({ titel: findrole });

    if (userrole[0].product.includes("add")) {
      const brand = await Brand.find({});
      const unit = await Unit.find({});
      const category = await Category.find({ status: "active" });
      const supp = await Supplier.find({});

      res.render("product", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        brand: brand,
        unit: unit,
        category: category,
        supp: supp,
        footer,
      });
    } else {
      req.flash("errors", "You do not have permission to add product.");
      return res.redirect("/product/list");
    }
  } catch (error) {
    console.log(error);
  }
});
// add Product post router

router.get("/subcate", async (req, res) => {
  if (req.query.cat) {
    const subcatfind = await Category.findOne({ catName: req.query.cat });
    console.log(subcatfind);

    const subCategoryNames = subcatfind.subcatNames.map(
      (sub) => sub.subcatname
    );

    console.log(subCategoryNames);

    return res.send({
      subcat: subCategoryNames,
    });
  } else {
    res.redirect("back");
  }
});

router.post("/addproduct", upload.single("proimg"), async (req, res) => {
  try {
    const { filename: image } = req.file;
    const {
      Name,
      proCode,
      brand,
      quantity,
      unitType,
      unitValue,
      category,
      SubCategory,
      sellingPrice,
      purchasePrice,
      discountType,
      discount,
      tax,
      supplier,
    } = req.body;
    const productImage = req.file.filename;

    const proname = await Product.findOne({ Name: Name });
    if (proname) {
      fs.unlinkSync(req.file.path);
      req.flash("errors", `${Name} alredy added please choose onother`);
      return res.redirect("/product/add");
    }

    const pcode = await Product.findOne({ proCode: proCode });
    if (pcode) {
      fs.unlinkSync(req.file.path);
      req.flash(
        "errors",
        ` Same Product Code Faund.......${proCode} alredy added please choose onother`
      );
      return res.redirect("/product/add");
    }

    await sharp(req.file.path)
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(path.resolve(req.file.destination, "resized", image));

    fs.unlinkSync(req.file.path);

    const newProduct = await Product.create({
      Name,
      proCode,
      brand,
      quantity,
      unitType,
      unitValue,
      category,
      SubCategory,
      sellingPrice,
      purchasePrice,
      discountType,
      discount,
      tax,
      supplier,
      productImage,
    });
    const supp = await Supplier.findOne({ suppName: supplier });
    supp.productList = supp.productList.concat({
      productName: newProduct.Name,
    });
    await supp.save();

    //******************* Add Supplier payabale Amount********************** */
    var totalAmount = parseInt(purchasePrice) * parseInt(quantity);
    //****** save new Order detail in supplier data */
    const supplierdata = await Supplier.findOne({ suppName: supplier });
    supplierdata.orderList = supplierdata.orderList.concat({
      productName: Name,
      productQuntity: quantity,
      productPrice: purchasePrice,
      totalAmount: totalAmount,
      date: Date.now(),
    });

    var id = supplierdata._id;
    await supplierdata.save();

    //**********  Add balance in Paybale account************/

    const payableAccoountdetail = await Account.aggregate([
      { $match: { accTitel: { $eq: "Payable" } } },
      {
        $project: {
          debet: { $sum: "$transaction.debit" },
          credit: { $sum: "$transaction.credit" },
        },
      },
    ]);
    var payTotal =
      parseInt(payableAccoountdetail[0].credit) -
      parseInt(payableAccoountdetail[0].debet);
    var payableAccoount = await Account.findOne({ accTitel: "Payable" });

    payableAccoount.transaction = payableAccoount.transaction.concat({
      walletName: id,
      type: "Payable",
      amount: totalAmount,
      description: "New Product Added",
      debit: 0,
      credit: totalAmount,
      balance: parseInt(payTotal) + parseInt(totalAmount),
      date: Date.now(),
    });
    await payableAccoount.save();

    req.flash("success", `${Name}  added success fully !!!!!`);
    return res.redirect("/product/list");
  } catch (error) {
    console.log(error);
  }
});

// update Product get router
router.get("/update/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const findrole = userdata.role;
    const userrole = await UserRole.find({ titel: findrole });

    if (userrole[0].product.includes("update")) {
      const userdata = await User.findOne({ _id: req.user.id });
      const brand = await Brand.find({});
      const unit = await Unit.find({});
      const category = await Category.find({});
      const supp = await Supplier.find({});
      const product = await Product.findOne({ _id: req.params.id });

      res.render("updateProduct", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        pro: product,
        brand: brand,
        unit: unit,
        category: category,
        supp: supp,
        footer,
      });
    } else {
      req.flash("errors", "You do not have permission to update product.");
      return res.redirect("/product/list");
    }
  } catch (error) {
    console.log(error);
  }
});

//update Product post router
router.post(
  "/updateproduct/:id",
  isAuth,
  upload.single("proimg"),
  async (req, res) => {
    try {
      const {
        Name,
        proCode,
        brand,
        quantity,
        unitType,
        unitValue,
        category,
        SubCategory,
        sellingPrice,
        purchasePrice,
        discountType,
        discount,
        tax,
        supplier,
      } = req.body;

      const proname = await Product.findOne({
        Name: Name,
        _id: { $ne: req.params.id },
      });
      if (proname) {
        req.flash("errors", `${Name} alredy added please choose onother`);
        return res.redirect("/product/list");
      }

      const pcode = await Product.findOne({
        proCode: proCode,
        _id: { $ne: req.params.id },
      });
      if (pcode) {
        req.flash(
          "errors",
          ` Same Product Code Faund.......${proCode} alredy added please choose onother`
        );
        return res.redirect("/product/list");
      }
      const pro = await Product.findById(req.params.id);

      pro.Name = Name;
      pro.proCode = proCode;
      pro.brand = brand;
      pro.quantity = quantity;
      pro.unitType = unitType;
      pro.unitValue = unitValue;
      pro.category = category;
      pro.SubCategory = SubCategory;
      pro.sellingPrice = sellingPrice;
      pro.purchasePrice = purchasePrice;
      pro.discountType = discountType;
      pro.discount = discount;
      pro.tax = tax;
      pro.supplier = supplier;

      if (req.file) {
        const { filename: image } = req.file;
        await sharp(req.file.path)
          .resize(200, 200)
          .jpeg({ quality: 90 })
          .toFile(path.resolve(req.file.destination, "resized", image));

        fs.unlinkSync(req.file.path);
        pro.productImage = req.file.filename;
      }

      await pro.save();
      req.flash("success", `${Name} update success fuly`);
      res.redirect("/product/list");
    } catch (error) {
      console.log(error);
    }
  }
);

// Product List router
router.get("/list", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const productSpliyer = await Product.aggregate([
      {
        $lookup: {
          from: "orders",
          let: {
            serch: "$Name",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$serch", "$item.productName"],
                },
              },
            },
            {
              $project: {
                item: 1,
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
        $match: {
          $expr: {
            $eq: ["$order.item.productName", "$Name"],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          Name: {
            $first: "$Name",
          },
          proCode: {
            $first: "$proCode",
          },
          brand: {
            $first: "$brand",
          },
          quantity: {
            $first: "$quantity",
          },
          unitType: {
            $first: "$unitType",
          },
          unitValue: {
            $first: "$unitValue",
          },
          category: {
            $first: "$category",
          },
          purchasePrice: {
            $first: "$purchasePrice",
          },
          sellingPrice: {
            $first: "$sellingPrice",
          },
          productImage: {
            $first: "$productImage",
          },
          supplier: {
            $first: "$supplier",
          },
          order: {
            $sum: "$order.item.productCount",
          },
        },
      },
    ]);

    res.render("productList", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      data: productSpliyer,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

//delet Product
router.get("/delet/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });

    const findrole = userdata.role;
    const userrole = await UserRole.find({ titel: findrole });

    if (userrole[0].product.includes("delet")) {
      const del = await Product.findByIdAndDelete(req.params.id);

      const supplier = await Supplier.findOne({ suppName: del.supplier });

      supplier.productList.forEach((data, index) => {
        if (data.productName == del.Name) {
          supplier.productList.splice(index, 1);
        }
      });

      await supplier.save();

      req.flash("success", `${del.Name} Delet success fuly`);
      res.redirect("/product/list");
    } else {
      req.flash("errors", "You do not have permission to delet product.");
      return res.redirect("/product/list");
    }
  } catch (error) {
    console.log(error);
  }
});

//bulkimport get
router.get("/bulkimport", isAuth, async (req, res) => {
  const userdata = await User.findOne({ _id: req.user.id });
  const footer = await User.findOne({});

  res.render("bulkImport", {
    success: req.flash("success"),
    errors: req.flash("errors"),
    userdata: userdata,
    footer,
  });
});

//download Demo formate
router.get("/download_formet", isAuth, (req, res) => {
  res.download("public/images/data.csv");
});

//post upload csv product
router.post(
  "/uploadcsv",
  uploadcsv.single("impCSV"),
  async function (req, res) {
    var pathf = req.file.path;
    console.log(path);

    const rows = [];
    var filename = path.join(__dirname, "../public/uploads/product.csv");
    const fs = require("fs");
    if (fs.existsSync(filename)) {
      console.log("File exists");
      fs.createReadStream(filename)
        .pipe(parse({ headers: true }))
        .on("error", (error) => console.error(error))
        .on("data", async (row) => {
          //each row can be written to db
          var Name = row.name;
          var proCode = row.product_code;
          var brand = row.brand;
          var quantity = row.quantity;
          var unitType = row.unit_type;
          var unitValue = row.unit_value;
          var category = row.category_Name;
          var SubCategory = row.sub_category_Name;
          var sellingPrice = row.selling_price;
          var purchasePrice = row.purchase_price;
          var discountType = row.discount_type;
          var discount = row.discount;
          var tax = row.tax;
          var supplier = row.supplier_Name;

          var porduc = await Product.create({
            Name,
            proCode,
            brand,
            quantity,
            unitType,
            unitValue,
            category,
            SubCategory,
            sellingPrice,
            purchasePrice,
            discountType,
            discount,
            tax,
            supplier,
          });
          rows.push(row);
        })
        .on("end", (rowCount) => {
          setTimeout(() => {
            fs.unlinkSync(pathf);
          }, "3000");
        });
    } else {
      console.error("File does not exist");
    }

    res.redirect("back");
  }
);

//**************download exle file************ */

router.get("/export-Bulk", async (req, res) => {
  try {
    const data = await Product.find({});

    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet("orderList");

    worksheet.columns = [
      { header: "name", key: "Name", width: 35 },
      { header: "product_code", key: "proCode", width: 35 },
      { header: "unit_type", key: "unitType", width: 20 },
      { header: "unit_value", key: "unitValue", width: 20 },
      { header: "brand", key: "brand", width: 20 },
      { header: "category_Name", key: "category", width: 20 },
      { header: "sub_category_Name", key: "SubCategory", width: 20 },
      { header: "purchase_price", key: "purchasePrice", width: 20 },
      { header: "selling_price", key: "sellingPrice", width: 20 },
      { header: "discount_type", key: "discountType", width: 20 },
      { header: "discount", key: "discount", width: 20 },
      { header: "tax", key: "tax", width: 20 },
      { header: "quantity", key: "quantity", width: 20 },
      { header: "supplier_Name", key: "supplier", width: 20 },
    ];

    data.forEach(function (row) {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "orderList.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end;
    });
  } catch (error) {
    console.log(error);
  }
});

//limited product list
router.get("/limited", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const findrole = userdata.role;
    const userrole = await UserRole.find({ titel: findrole });

    if (userrole[0].limit_product_list.includes("views")) {
      const userdata = await User.findOne({ _id: req.user.id });
      const proList = await Product.find({ quantity: { $lte: 50 } });
      res.render("limitProduct", {
        success: req.flash("success"),
        errors: req.flash("errors"),
        userdata: userdata,
        data: proList,
        footer,
      });
    } else {
      req.flash(
        "errors",
        "You do not have permission to view limit Products list."
      );
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/subcat", async (req, res) => {
  const data = await Category.findOne({ catName: req.body.cat_id });
  res.status(201).json(data);
});

// product Quntity increase by + butten
router.post("/quantity", isAuth, async (req, res) => {
  const userdata = await User.findOne({ _id: req.user.id });
  const footer = await Shop.findOne({});

  const findrole = userdata.role;
  const userrole = await UserRole.find({ titel: findrole });

  if (userrole[0].limit_product_list.includes("views")) {
    var qunt = req.body.quantity;
    var date = req.body.date;
    console.log(qunt);

    //****** save new product Quntity */
    const product = await Product.findById(req.body.editqun);
    console.log(product);

    product.quantity = parseInt(product.quantity) + parseInt(qunt);
    await product.save();

    var totalAmount = parseInt(product.purchasePrice) * parseInt(qunt);

    //****** save new Order detail in supplier data */
    const supplier = await Supplier.findOne({ suppName: product.supplier });
    supplier.orderList = supplier.orderList.concat({
      productName: product.Name,
      productQuntity: qunt,
      productPrice: product.purchasePrice,
      totalAmount: totalAmount,
      date: new Date(date),
    });

    var id = supplier._id;
    await supplier.save();

    //********** Add  total purchase amount in Payable account*****/
    //**********  Add balance in Paybale account************/

    const payableAccoountdetail = await Account.aggregate([
      { $match: { accTitel: { $eq: "Payable" } } },
      {
        $project: {
          debet: { $sum: "$transaction.debit" },
          credit: { $sum: "$transaction.credit" },
        },
      },
    ]);
    var payTotal =
      parseInt(payableAccoountdetail[0].credit) -
      parseInt(payableAccoountdetail[0].debet);
    var payableAccoount = await Account.findOne({ accTitel: "Payable" });

    payableAccoount.transaction = payableAccoount.transaction.concat({
      walletName: id,
      type: "Payable",
      amount: totalAmount,
      description: "New Product Purchase",
      debit: 0,
      credit: totalAmount,
      balance: parseInt(payTotal) + parseInt(totalAmount),
      date: new Date(date),
    });
    await payableAccoount.save();

    res.redirect("back");
  } else {
    req.flash(
      "errors",
      "You do not have permission to update limit Products list quantity."
    );
    return res.redirect("back");
  }
});

// print data get router
router.get("/printdata/:id", isAuth, async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.user.id });
    const footer = await Shop.findOne({});

    const product = await Product.findById(req.params.id);

    res.render("printProduct", {
      success: req.flash("success"),
      errors: req.flash("errors"),
      userdata: userdata,
      pro: product,
      footer,
    });
  } catch (error) {
    console.log(error);
  }
});

// make thermal printer barcode data
router.post("/barcode/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
