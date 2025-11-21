const express = require("express")
const userController = require("../controllers/user.Controllers")
const userRouter = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const investmentController = require("../controllers/Investment.controller")


userRouter.post("/register",userController.userRegister)
userRouter.post("/login",userController.login)
userRouter.post("/createInvestment",authMiddleware.isUserLogedIn,investmentController.createInvestment)
userRouter.post("/direct-user",authMiddleware.isUserLogedIn,userController.getDirectUser)





module.exports=userRouter