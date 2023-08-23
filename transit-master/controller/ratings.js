var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path');
var sequelize = require('sequelize');

const ratings = db.ratings
const users = db.users

ratings.belongsTo(users, {
    foreignKey: "user_id",
});
ratings.belongsTo(users, {
    foreignKey: "transporter_id", as: "transporterName"
});


module.exports = {
    transporter_ratings: async (req, res) => {
        try {
            var ratings = await db.ratings.findAll({
                include: [{
                    model: db.users
                },
                {
                    model: db.users,
                    as: "transporterName"
                }],
                Order: [
                    ['id', 'Desc']
                ],

                raw: true,
                nest: true,
            })
           


            res.render("transporterratings/ratings", { ratings, session: req.session, msg: req.flash('msg'), title: 'transporter_ratings' })

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>.", error);


        }




    },
    rating_view: async (req, res) => {
        try {
         
            
            var transport_view = await db.ratings.findOne({
                include: [{
                    model: db.users
                },
                {
                    model: db.users,
                    as: "transporterName"
                }],
                where: {
                    id: req.params.id

                },
                raw:true,
                nest:true
            })

            res.render("transporterratings/ratingview", { transport_view, session: req.session, msg: req.flash('msg'), title: 'rating_active' })

        } catch (error) {
        console.log(">>>>>>>>>>>>>>>>>>>>>",error);
        
        }
},


}