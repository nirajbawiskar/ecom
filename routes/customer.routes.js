const { palceOrder, fetchCustomerOrders } = require("../controllers/customer.controller")

const router = require("express").Router()
router
    .post("/place-order", palceOrder)
    .get("/order-history", fetchCustomerOrders)

module.exports = router