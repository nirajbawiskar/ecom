const { getProducts, addProduct, updateProducts, deleteProducts, fetchAdminOrders, adminUpdateOrderStatus, adminUserFetch, adminBlockUnblockUser, } = require("../controllers/admin.controller")

const router = require("express").Router()

router
    .get("/product", getProducts)
    .post("/product/add", addProduct)
    .put("/product/update/:productId", updateProducts)
    .delete("/product/delete/:productId", deleteProducts)
    .get("/orders", fetchAdminOrders)
    .put("/order/update/:pid", adminUpdateOrderStatus)
    .get("/user/fetch", adminUserFetch)
    .put("/user/block/:uid", adminBlockUnblockUser)
module.exports = router