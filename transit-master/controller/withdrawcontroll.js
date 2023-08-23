var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
var payments = db.payments
var users = db.users
payments.belongsTo(users, {
    foreignKey: "transporter_id", as: "TransporterName"
});
module.exports = {
    withdraw: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const fiind_user = await db.payments.findAll({
                include: [
                {
                    model: db.users,
                    as: "TransporterName",
                    attributes: [ "name"],
                }, 
            ],
            where:{
                type:2
            }
            
             })
            res.render("withdraw/req_withdraw", { fiind_user,session: req.session,msg: req.flash('msg'),title:'withdraw_active' })
            console.log(">...............................",fiind_user);
            return
            
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    withdrawstatus: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>..........",req.body.id);
        // return
        

        var check = await db.payments.update({
            withdraw_status: req.body.status,
        }, {
            where: {
                id: req.body.id,
            },
        });
        

        if(req.body.status==1){
        req.flash('msg',"Accepted")
        res.redirect('/withdraw')}

        if(req.body.status==2){
            req.flash('msg', "Rejected")
            res.redirect('/withdraw')}
        if(req.body.status==0){
                req.flash('msg', "Pending")
                res.redirect('/withdraw')}
        }
         
    
    
}