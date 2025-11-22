const express = require("express")
const userController = require("../controllers/user.Controllers")
const userRouter = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const investmentController = require("../controllers/Investment.controller")


userRouter.post("/register",userController.userRegister)
userRouter.post("/login",userController.login)
userRouter.post("/create-investment",authMiddleware.isUserLogedIn,investmentController.createInvestment)
userRouter.get("/direct-user",authMiddleware.isUserLogedIn,userController.getDirectUser)
userRouter.get("/get-profile",authMiddleware.isUserLogedIn,userController.getProfile)
userRouter.get("/get-investment-history",authMiddleware.isUserLogedIn,investmentController.investmentHistory)
userRouter.get("/roi-test",userController.getRoi)
userRouter.get("/get-directreferralIncome-history",authMiddleware.isUserLogedIn,userController.directreferralIncomeHistory)
userRouter.get("/get-levelincome-history",authMiddleware.isUserLogedIn,investmentController.levelIncomeHistory)






module.exports=userRouter