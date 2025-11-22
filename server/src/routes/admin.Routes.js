const express = require("express")
const adminRoutes = express.Router()
const adminController = require("../controllers/admin.Controller")

adminRoutes.post("/login",adminController.loginAdmin)
adminRoutes.post("/register",adminController.registerAdmin)

module.exports= adminRoutes