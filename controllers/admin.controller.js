// product crud
const Product = require("../models/Product")
const path = require("path")
const { upload } = require("../utils/upload")
const Order = require("../models/Order")
const Customer = require("../models/Customer")
const { sendEmail } = require("../utils/email")

const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})

exports.addProduct = async (req, res) => {
    upload(req, res, async err => {
        if (err) {
            console.log(err)
            return res.status(400).json({ message: "unable to upload" })

        }
        if (req.files) {
            console.log(req.files);

            // const allImages = []
            // for (const item of req.files) {
            //     const { secure_url } = await cloudinary.uploader.upload(item.path)
            //     allImages.push(secure_url)
            // }
            // console.log(allImages);


            //promise all👇


            const allImages = []
            const heros = []
            for (const item of req.files) {
                allImages.push(cloudinary.uploader.upload(item.path))
            }
            const data = await Promise.all(allImages)
            for (const item of data) {
                heros.push(item.secure_url)
            }

            //promise all end
            await Product.create({ ...req.body, hero: heros })
            res.json({ message: "product add success" })

        } else {
            res.status(400).json({ message: "hero image is required" })
        }
        // console.log(req.body);
        // console.log(req.file)//multer.single()
        // console.log(req.files)//multer.array()

    })
}
exports.getProducts = async (req, res) => {
    const result = await Product.find()
    res.json({ message: "product fetch success", result })
}
exports.updateProducts = async (req, res) => {
    upload(req, res, async err => {
        try {
            const allImages = []
            if (req.files && req.files.length > 0) {
                //only upload new image
                for (const item of req.files) {
                    const { secure_url } = await cloudinary.uploader.upload(item.path)
                    allImages.push(secure_url)
                }
            }
            const oldProduct = await Product.findById(req.params.productId)
            // change only data
            if (req.body.remove) {
                const result = oldProduct.hero.filter(item => !req.body.remove.includes(item))
                oldProduct.hero = result
                if (typeof req.body.remove === "string") {// req.files.remove mdhe string ala tr ha code run hota
                    await cloudinary.uploader.destroy(path.basename(req.body.remove, path.extname(req.body.remove)))

                } else { // req.files.remove mdhe array ala tr ha code run hota
                    for (const item of req.body.remove) {
                        await cloudinary.uploader.destroy(path.basename(item, path.extname(item)))

                    }
                }
            }
            await Product.findByIdAndUpdate(req.params.productId, { ...req.body, hero: [...oldProduct.hero, ...allImages] })
            // await Product.findByIdAndUpdate(req.params.productId, req.body)
            res.json({ message: "product update success" })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "something went wrong" })

        }

    })
    /*
    name:""
    hero:["img1","img2",:img3,"img4"]
    
    step 1 delete :"img2","img3"  cloudinary req.body.remove
    step 2 upload new image cloudinary req.files 
    step 3 update database findByAndUpdate() hero:["img1","new image","img4"]*/
    // upload(req, res, async err => {
    //     if (err) {
    //         console.log(err);
    //         return res.status(400).json({ message: "unable to upload" })

    //     }
    //     // console.log(req.body);
    //     // console.log(req.files);
    //     if (req.body.remove) {
    //         //remove old image
    //         await cloudinary.uploader.destroy(path.basename(req.body.remove))
    //     }
    //     const heros = []
    //     if (req.files) {
    //         //upload new image
    //         const allImages = []
    //         for (const item of req.files) {
    //             allImages.push(cloudinary.uploader.upload(item.path))
    //         }
    //         const data = await Promise.all(allImages)
    //         for (const item of data) {
    //             heros.push(item.secure_url)
    //         }
    //     }
    //     await Product.findByIdAndUpdate(req.params.productId, { ...req.body, hero: heros })
    // })
}
exports.deleteProducts = async (req, res) => {
    const result = await Product.findById(req.params.productId)
    //steep 1 cloudinary/aws s3
    for (const item of result.hero) {
        await cloudinary.uploader.destroy(path.basename(item, path.extname(item)))//cludinary vr pn delete karych asle
    }
    // step 2 database
    await Product.findByIdAndDelete(req.params.productId)
    res.json({ message: "product delete success" })
}

exports.fetchAdminOrders = async (req, res) => {
    const total = await Order.countDocuments()
    const { skip, limit } = req.query
    const result = await Order
        .find()
        .skip(skip)
        .limit(limit)// constroll kar saktey hai
        .populate("customer", "name")
        .populate("products", "-__V")
    res.json({ message: "order fetch success", result, total })
}
exports.adminUpdateOrderStatus = async (req, res) => {
    await Order.findByIdAndUpdate(req.params.pid, { status: req.body.status })

    const x = await Order.findById(req.params.pid)
    const result = await Customer.findById(x.customer)
    if (req.body.status !== "placed") {
        await sendEmail({
            to: result.email,
            subject: "our Order Status Has Been Updated",
            message: `Your Order Status:Now${req.body.status}`
        })
    }
    res.json({ message: "order status update success" })
}

exports.adminBlockUnblockUser = async (req, res) => {
    try {
        await Customer.findByIdAndUpdate(req.params.uid, { isActive: req.body.isActive }) //isactive:false =bloc only
        res.json({ message: "user block success" })
    } catch (error) {
        res.status(400).json({ message: "unable to fetch" })
    }
}
exports.adminUserFetch = async (req, res) => {
    try {
        const total = await Customer.countDocuments()
        const { skip, limit } = req.query
        const result = await Customer.find().skip(skip).limit(limit)
        res.json({ message: "user fetch success", result, total })
    } catch (error) {
        res.status(400).json({ message: "unable to fetch" })
    }
}
//string as a consider array

//controlle-route-api