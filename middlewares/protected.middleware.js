const { json } = require("express")
const jwt = require("jsonwebtoken")
const Customer = require("../models/Customer")

exports.adminProtected = async (req, res, next) => {
    const admin = req.cookies.admin
    if (!admin) {
        return res.status(401).json({ message: "no cookie found" })
    }
    jwt.verify(admin, process.env.JWT_SECRET, (err) => {
        if (err) {
            console.log(err);

            return res.status(401).json({ message: "invalid token" })
        }
        next()
    })

}
exports.customerProtected = async (req, res, next) => {
    const customer = req.cookies.customer
    if (!customer) {
        return res.status(401).json({ message: "no cookie found" })
    }
    jwt.verify(customer, process.env.JWT_SECRET, async (err, decode) => {
        if (err) {
            console.log(err);

            return res.status(401).json({ message: "invalid token" })
        }
        const result = await Customer.findById(decode._id)
        if (!result.isActive) {
            return res.status(401).json({ message: "account blocked by admin" })
        }
        // console.log(decode);
        req.loggedInUser = decode._id
        next()//next nanter placeorder ch fanction run zala
    })

}