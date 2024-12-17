const Customer = require("../models/Customer")
const Order = require("../models/Order")
const Product = require("../models/Product")
const { sendEmail } = require("../utils/email")

exports.palceOrder = async (req, res) => {
    try {
        const orderData = await Order.create({
            customer: req.loggedInUser,
            address: req.body.address,
            city: req.body.city,
            products: req.body.products,
            payment: req.body.payment
        })
        const result = await Customer.findById(req.loggedInUser)
        const allProducts = await Product.find({ _id: { $in: req.body.products } })

        const subTotal = allProducts.reduce((sum, item) => sum + item.price, 0)
        const tax = 18 * subTotal / 100
        const shipping = 100
        const total = subTotal + tax + shipping
        // return { subTotal, tax, shipping, total }

        await sendEmail({
            to: result.email,
            subject: "order Confirmation-tour Order has been Placed",
            message: `
           <h1>Dear ${result.name},</h1>
            <p>Thank you for shopping with us! We're excited to let you know that your order has been successfully placed. Here's a summary of your order details:</p>
                 
                 
                 <p>Order Number: ${orderData._id}</p>
                 <p>Order Date: ${new Date()}</p>
                 <p> Items Ordered:</p>
                 ${allProducts.map(item => `<p>${item.name}x${item.price}</p>`)}
                 <p>Total Amount:<strong>र${total}</strong></p>
                 [Item Name 1] x [Quantity]
                 [Item Name 2] x [Quantity]
                 Total Amount: ₹[Total Amount]
                 
                 <p>You can expect your order to be delivered by [Delivery Date]. Well send you another
                  email with tracking information as soon as your order is shipped.</p>
                
                 <p>If you have any questions or need assistance, feel free to contact us at [Customer Support Email] or call [Customer Support Number].            
                 Thank you for choosing [Your Company Name]. We hope to serve you again soon!</p>
                 
                 <p>Warm regards,</p>`
        })
        res.json({ message: "order place success" })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "unable to place order" })
    }
}
exports.fetchCustomerOrders = async (req, res) => {
    try {
        // console.log(req.loggedInUser);
        const result = await Order
            .find({ customer: req.loggedInUser })
            .populate("customer", "_id name")
            .populate("products", "-qty -__V")
        res.json({ message: "order fetch success", result })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "unable to place order" })
    }
}