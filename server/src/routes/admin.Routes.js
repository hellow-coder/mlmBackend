const express = require("express")
const adminRoutes = express.Router()
const adminController = require("../controllers/admin.Controller")
const authMiddleware = require("../middleware/authMiddleware")
adminRoutes.post("/login",adminController.loginAdmin)
adminRoutes.post("/register",adminController.registerAdmin)

adminRoutes.get("/get-all-users",authMiddleware.isAdmin,adminController.getAllUsers)
adminRoutes.post("/admin-topup",authMiddleware.isAdmin,adminController.adminTopup)
adminRoutes.post("/get-user-for-topup",authMiddleware.isAdmin,adminController.getUserForTopup)
adminRoutes.get("/get-topup-history",authMiddleware.isAdmin,adminController.getTopupHistory)
adminRoutes.get("/block-user/:userId",authMiddleware.isAdmin,adminController.blockUser)

module.exports= adminRoutes