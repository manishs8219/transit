var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
module.exports = {
    users: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const fiind_user = await db.users.findAll({
                where:{
                    role:1
                }
            })
            res.render("users/users", { fiind_user,session: req.session,msg: req.flash('msg'),title:'user_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    view: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const view_user = await db.users.findOne({
                where: {
                    id: req.params.id
                }
            })
        
            
            res.render("users/view", { view_user,session: req.session,msg: req.flash('msg'),title:'user_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    // delete:async(req,res)=>{
    //    var delete_user = await db.users.destroy({
    //            where:{
    //                id:req.params.id
    //            }
    //        })
    //    //res.send('1')
    //    res.redirect("/users")
    // },
    userstatus: async (req, res) => {
        var check = await db.users.update({
            type: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        if (check) {
            req.flash('msg', "User Status-Updated ")
            res.send(false)
        }
    },
    
    transport_view:async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const view_user = await db.users.findOne({
                where: {
                    id: req.params.id
                }
            })
          //  console.log(">>>>>>>>>>>>>>>>",view_user)
            
            
            res.render("transporter/viewtransport", { view_user,session: req.session,msg: req.flash('msg') ,title:'transporter_active'})
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
transport_users: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const transport_user = await db.users.findAll({
                where:{
                    role:2
                }
            })
            res.render("transporter/transportusers", { transport_user,session: req.session,msg: req.flash('msg'),title:'transporter_active'  })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    status: async (req, res) => {
        var check = await db.users.update({
            type: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        if (check) {
            req.flash('msg', "Transport User Status-Updated ")
            res.send(false)
        }
    },
    delete: async (req, res) => {
        try {
            model = req.body.model
            console.log("??????????????????????????????<<<<<<<<<<<<<<<<",model);
            
            
          if (model) {
                req.flash('msg', `Deleted Successfully`)
            }
            await db[model].destroy({
                where: {
                    id: req.body.id,
                }
            })
            res.send('1')
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>", error)
        }
    },
   
}