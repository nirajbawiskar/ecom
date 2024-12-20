const { registerAdmin, logoutAdmin, loginAdmin, registerCustomer, loginCustomer, logoutCustomer } = require("../controllers/auth.controller")

const router = require("express").Router()
//http://localhost:5000/api/auth/admin/register
router
    .post("/admin/register", registerAdmin)
    .post("/admin/login", loginAdmin)
    .post("/admin/logout", logoutAdmin)
    .post("/customer/register", registerCustomer)
    .post("/customer/login", loginCustomer)
    .post("/customer/logout", logoutCustomer)
module.exports = router