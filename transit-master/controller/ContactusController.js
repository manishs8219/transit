var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')

module.exports = {
    contactUs: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const contactus = await db.contactus.findAll({
              
            })
            res.render("contactus/contactus", { contactus,session: req.session,msg: req.flash('msg'),title:'contact' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
}