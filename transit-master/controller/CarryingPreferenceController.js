var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
const helper = require('../helper/helpers');
const carrying_preference = db.carrying_preference
const category =db.category

carrying_preference.belongsTo(category, {
    foreignKey: "category_id",
});

module.exports = {
    getPrefernce: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')
            var view = await db.category.findAll()
            res.render("preference/addpreference", {view, session: req.session,msg: req.flash('msg'),title:'addprefrence' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },

    postPrefernce: async (req, res) => {
     console.log(">>>>>>>>>>>>>>>>>>>>>>>............",req.files);
     
     
        
        
        try {
             if (!req.session.user) return res.redirect('/get_login')
             if (req.files && req.files.image) {
              var images = helper.fileUpload(req.files.image, 'images')
            }
            req.body.image =images
            
            await db.carrying_preference.create({
                preference:req.body.preference,
                image: req.body.image,
                category_id:req.body.category_id
            })
            req.flash('msg', "Vehicle added successfully ")
            res.redirect('/preferenceList')
        
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },

    preferenceList: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const preferencelist = await db.carrying_preference.findAll({
                include:[{
                    model:db.category
                }]
              }
              
            )
            res.render("preference/preferencelist", {preferencelist,msg: req.flash('msg'), session: req.session,title:'preferencelist' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },

    preferenceStatus: async (req, res) => {
        var check = await db.carrying_preference.update({
            status: req.body.value,
        }, {
            where: {
                id: req.body.id,
            },
        });
        if (check) {
            req.flash('msg', "Prefernce Status-Updated ")
            res.send(false)
        }
    },

    editPreference: async (req, res) => {
        try {
            var editpreference = await db.carrying_preference.findOne({
                where: {
                    id: req.params.id,
                }
            })
            
            

            res.render("preference/editpreference", { editpreference, session: req.session, msg: req.flash('msg'), title: 'vechiles_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    updatePreference: async (req, res) => {
        try {
            var preference = await db.carrying_preference.update({
                preference: req.body.preference
            }, {
                where: {
                    id: req.params.id
                }
            })
            req.flash('msg', "vehicle updated successfully ")
            res.redirect("/preferencelist")
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