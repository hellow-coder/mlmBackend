const express = require("express")
const userController = require("../controllers/user.Controllers")
const userRouter = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const investmentController = require("../controllers/Investment.controller")
const upload = require("../middleware/upload")


userRouter.post("/register",userController.userRegister)
userRouter.post("/login",userController.login)
userRouter.post("/create-investment",authMiddleware.isUserLogedIn,investmentController.createInvestment)
userRouter.get("/direct-user",authMiddleware.isUserLogedIn,userController.getDirectUser)
userRouter.get("/get-profile",authMiddleware.isUserLogedIn,userController.getProfile)
userRouter.get("/get-investment-history",authMiddleware.isUserLogedIn,investmentController.investmentHistory)
userRouter.get("/roi-test",userController.getRoi)
userRouter.get("/get-directreferralIncome-history",authMiddleware.isUserLogedIn,userController.directreferralIncomeHistory)
userRouter.get("/get-roi-history/:investmentId",authMiddleware.isUserLogedIn,investmentController.roiHistory)
userRouter.get("/get-roi-history",authMiddleware.isUserLogedIn,investmentController.roiHistory)
userRouter.get("/get-level-team",authMiddleware.isUserLogedIn,userController.getLevelUsers)
userRouter.post("/raise-ticket",authMiddleware.isUserLogedIn, upload.array('files', 5),userController.raiseTicket)
userRouter.get("/get-raise-ticket-history",authMiddleware.isUserLogedIn,userController.getRaiseTicketHistory)
userRouter.delete("/delete-raise-ticket/:ticketId",authMiddleware.isUserLogedIn,userController.deleteRaiseTicket)

userRouter.get("/get-levelincome-history",authMiddleware.isUserLogedIn,investmentController.levelIncomeHistory)






module.exports=userRouter