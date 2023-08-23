var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
module.exports = {

    package: async (req, res) => {
        try {


            res.render("package/add", { session: req.session, msg: req.flash('msg'), title: 'vechiles_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    add_Package: async (req, res) => {
        try {
            var create_package= await db.prefrence_package.create({
                name: req.body.name,
                order: [['name', 'desc'],]
            })
            req.flash('msg', "vehicle added successfully ")
            res.redirect("/list_Package")
        } catch (error) {
            console.log(">.>>>>>>>>>>>>>>>", error)



        }

    },
    list_Package: async (req, res) => {
        try {
            const list_package = await db.prefrence_package.findAll({
                order: [['name', 'desc'],]

            })

            res.render("package/view", { list_package, session: req.session, msg: req.flash('msg'), title: 'list_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    edit_Package: async (req, res) => {
        try {
            var edit_package = await db.prefrence_package.findOne({
                where: {
                    id: req.params.id,
                }
            })
            
            

            res.render("package/edit", { edit_package, session: req.session, msg: req.flash('msg'), title: 'vechiles_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_Package: async (req, res) => {
        try {
            var data_vehicle = await db.prefrence_package.update({
                name: req.body.name
            }, {
                where: {
                    id: req.params.id
                }
            })
            req.flash('msg', "vehicle updated successfully ")
            res.redirect("/list_Package")
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    // delete: async (req, res) => {
    //     try {
    //         model = req.body.model
    //         if (model) {
    //             req.flash('msg', `Deleted Successfully`)
    //         }
    //         await db[model].destroy({
    //             where: {
    //                 id: req.body.id,
    //             }
    //         })
    //         res.send('1')
    //     } catch (error) {
    //         console.log(">>>>>>>>>>>>>>>>>", error)
    //     }
    // },


}

