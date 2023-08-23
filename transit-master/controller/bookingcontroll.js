const { Sequelize, QueryTypes } = require('sequelize');

var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
const bookings = db.bookings
const carrying_preference = db.carrying_preference
const users = db.users


bookings.belongsTo(users, {
    foreignKey: "userid",
});
db.car_details.belongsTo(users, {
    foreignKey: "user_id",
});
db.car_details.belongsTo(users, {
    foreignKey: "transporter_id", as: "transporter_name"
});
db.car_details.hasMany(db.carring_images, {
    foreignKey: "car_id",
    
});

module.exports = {
bookings_req: async (req, res) => {
        try {
            const data_bookings = await db.car_details.findAll({
                attributes: [`id`, `type`, `category_id`,`preference_id`, `booking_id`, `user_id`, `car_name`, `car_model`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'CategoryName'],
                ],
                where: {
                    start_end_bookings: 4,
                 },
                order: [['id', "DESC"]],
                include:{ model: db.bookings,
                required:true},
                raw:true,
                nest:true
             })
         res.render("bookingsrequest/bookings_req", { data_bookings, session: req.session, msg: req.flash('msg'), title: 'bookings_req' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)
        }
    },
view_booking: async (req, res) => {
        try {
            var bookings_view = await db.car_details.findOne({
                attributes:[
                    `id`, `type`, `category_id`, `preference_id`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `other_category`, `created_at`, `updated_at`, `transporter_id`, `status`, `booking_price`, `start_end_bookings`, `comment`, `start_date`, `end_date`, `from_lat`, `from_log`, `to_lat`, `to_log`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`,
                     ],
                include: [{
                    model: db.users
                },
                {
                    model: db.users,
                    as: "transporter_name"
                }, 
               
                {model:db.carring_images},
                 ],
                where: {
                    id: req.params.id
                
                },
               
            }).then(val => val.toJSON())
                var data =await db.carring_images.findAll(
                {
                    where:{
                    car_id:req.params.id
                    }
                }
            )
        

            
          if(bookings_view.preference_id==1){
                res.render("bookingsrequest/req_index", {bookings_view,data,  session: req.session, msg: req.flash('msg'), title: 'bookings_active' })

            }
            if(bookings_view.preference_id==2){
                res.render("bookingsrequest/bike_view", {bookings_view, data, session: req.session, msg: req.flash('msg'), title: 'bike_view' })

            }
            if((bookings_view.preference_id==3 || bookings_view.preference_id==6)){
                res.render("bookingsrequest/furniture_view", { bookings_view, data,session: req.session, msg: req.flash('msg'), title: 'furniture_view' })

            }
            res.render("bookingsrequest/other_view", { bookings_view,data, session: req.session, msg: req.flash('msg'), title: 'other_view' })

          } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>", error)
            return

        }
    },

    bike_view: async (req, res) => {
        try {
            var bookings_view = await db.bookings.findOne({
                include: [{
                    model: db.users
                },
                {
                    model: db.users,
                    as: "transportername"
                }, { model: db.carrying_preference }],
                where: {
                    id: req.params.booking_id

                },
                raw: true,
                nest: true
            })
             res.render("bookingsrequest/bike_view", { bookings_view, session: req.session, msg: req.flash('msg'), title: 'bike_view' })

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)
        }
    },
    
    furniture_view: async (req, res) => {
        try {
          
                var bookings_view = await db.bookings.findOne({
                    include: [{
                        model: db.users
                    },
                    {
                        model: db.users,
                        as: "transportername"
                    }, { model: db.carrying_preference }],
                    where: {
                        id: req.params.booking_id
    
                    },
                    raw: true,
                    nest: true
                })
                 res.render("bookingsrequest/furniture_view", { bookings_view, session: req.session, msg: req.flash('msg'), title: 'bike_view' })
    
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)
        }
    },
    other_view: async (req, res) => {
        try {
            var bookings_view = await db.bookings.findOne({
                include: [{
                    model: db.users 
                },
                {
                    model: db.users,
                    as: "transportername"
                }, { model: db.carrying_preference }],
                where: {
                    id: req.params.booking_id

                },
                raw: true,
                nest: true
            })
             res.render("bookingsrequest/other_view", { bookings_view, session: req.session, msg: req.flash('msg'), title: 'bike_view' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)
        }
    },
    category_images:async(req,res)=>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>...",req.params.id);
        
        
       try {
      var images_view = await db.carring_images.findAll({
        where:{
            car_id :req.params.id
        },
        raw:true
    })
    console.log(">>>>>>>>>>>>>>>............/",images_view);
    
  
        
      console.log(">>>>>>>..............",data);
   
      
  
      res.render("bookingsrequest/image_view", { data, session: req.session, msg: req.flash('msg'), title: 'bike_view' })
   } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)
            
        }
    }















}