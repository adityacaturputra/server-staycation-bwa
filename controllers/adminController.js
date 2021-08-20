const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path')
const ObjectId = mongoose.Types.ObjectId


module.exports = {
    viewDashboard: (req, res) => {
        res.render('admin/dashboard/view_dashboard', { title: "Staycation | Dashboard" })
    },
    viewCategory: async (req, res) => {
        try {
            const category = await Category.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus }
            res.render('admin/category/view_category', { category, alert, title: "Staycation | Category" })
        } catch (error) {
            console.log(error)
            res.redirect('/admin/category')
        }
    },
    addCategory: async (req, res) => {
        try {
            const { name } = req.body
            await Category.create({ name })
            req.flash('alertMessage', 'Success add category')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category')
        } catch (error) {
            console.log(error)
            req.flash('alertMessage', `Failed add category: ${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/category')
        }
    },
    editCategory: async (req, res) => {
        try {
            const { id, name } = req.body;
            const category = await Category.findOne({ _id: id })
            category.name = name
            await category.save()
            req.flash('alertMessage', 'Success update category')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category')
        } catch (error) {
            req.flash('alertMessage', `Failed update category: ${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/category')
        }
    },
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ _id: id })
            await category.remove()
            req.flash('alertMessage', 'Success delete category')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/category')
        } catch (error) {
            req.flash('alertMessage', `Failed delete category: ${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/category')
        }
    },

    viewBank: async (req, res) => {
        try {
            const bank = await Bank.find();
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus }
            res.render('admin/bank/view_bank', { bank, alert, title: "Staycation | Bank" })
        } catch (error) {
            req.flash('alertMessage', `${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/category')
        }
    },
    addBank: async (req, res) => {
        try {
            const { name, nameBank, nomorRekening } = req.body
            await Bank.create({ name, nameBank, nomorRekening, imageUrl: `images/${req.file.filename}` })
            req.flash('alertMessage', 'Success add bank')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/bank')
        } catch (error) {
            console.log(error)
            req.flash('alertMessage', `Failed add bank: ${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/bank')
        }
    },
    editBank: async (req, res) => {
        try {
            const { id, name, nameBank, nomorRekening } = req.body
            const bank = await Bank.findOne({ _id: id })
            if (!req.file) {
                bank.name = name
                bank.nameBank = nameBank
                bank.nomorRekening = nomorRekening
                await bank.save();
            } else {
                await fs.unlink(path.join(`public/${bank.imageUrl}`))
                bank.name = name
                bank.nameBank = nameBank
                bank.nomorRekening = nomorRekening
                bank.imageUrl = `images/${req.file.filename}`
                await bank.save();
            }
            req.flash('alertMessage', 'Success update bank')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/bank')
        } catch (error) {
            req.flash('alertMessage', `Failed update bank: ${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/bank')
        }
    },
    deleteBank: async (req, res) => {
        try {
            const { id } = req.params
            const bank = await Bank.findOne({ _id: id })
            await fs.unlink(path.join(`public/${bank.imageUrl}`))
            await bank.remove()
            req.flash('alertMessage', 'Success delete bank')
            req.flash('alertStatus', 'success')
            res.redirect('/admin/bank')
        } catch (error) {
            req.flash('alertMessage', `Failed delete bank: ${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/bank')
        }
    },
    viewItem: async (req, res) => {
        try {
            const item = await Item.find()
                .populate({ path: 'imageId', select: 'id imageUrl' })
                .populate({ path: 'categoryId', select: 'id name' })
            const category = await Category.find()
            const alertMessage = req.flash('alertMessage');
            const alertStatus = req.flash('alertStatus');
            const alert = { message: alertMessage, status: alertStatus }
            res.render('admin/item/view_item', { title: "Staycation | Item", category, item, alert })
        } catch (error) {
            req.flash('alertMessage', `Failed view: ${error.message}`)
            req.flash('alertStatus', 'danger')
            console.log(error)
            res.redirect('/admin/item')
        }
    },
    addItem: async (req, res) => {
        try {
            const { categoryId, title, price, city, about } = req.body
            if (req.files.length > 0) {
                const category = await Category.findById(categoryId)
                console.log(category)
                const newItem = {
                    categoryId: category._id,
                    title,
                    description: about,
                    price,
                    city
                }
                const item = await Item.create(newItem)
                category.itemId.push({ _id: item._id })
                await category.save();
                for (let i = 0; i < req.files.length; i++) {
                    const imageSave = await Image.create({ imageUrl: `images/${req.files[i].filename}` })
                    item.imageId.push({ _id: imageSave._id })
                }
                item.save()
                req.flash('alertMessage', 'Success add item')
                req.flash('alertStatus', 'success')
                res.redirect('/admin/item')
            }
        } catch (error) {
            console.log(error)
            req.flash('alertMessage', `Failed add item: ${error.message}`)
            req.flash('alertStatus', 'danger')
            res.redirect('/admin/item')
        }
    },
    viewBooking: (req, res) => {
        res.render('admin/booking/view_booking', { title: "Staycation | Booking" })
    }
}