var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
const helper = require('../helper/helpers');



module.exports = {
    login: async (req, res) => {
        try {
            res.render("admin/login", { msg: req.flash('msg') })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    login_in: async (req, res) => {
        try {
            console.log(">>>>>>>>>>>>>>>>>>>>", req.body)



            var { email, password } = req.body
            const admin_login = await db.admindetail.findOne({
                where: {
                    email: req.body.email,

                }
            })
          // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", admin_login)
            if (admin_login == null) {
                req.flash('msg', 'Please fill the correct Email');
                res.redirect('get_login')
            }
            else {
                const isMatch = await bcrypt.compare(password, admin_login.password)
                if (isMatch == true) {
                    req.session.user = admin_login
                    req.flash('msg', 'Welcome');

                    res.redirect('/dashboard')
                } else {
                    req.flash('msg', 'Please fill the correct Password');
                    res.redirect('/get_login')

                }
            }
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>", error)
        }
    },
    log_out: async (req, res) => {
        try {
            req.session.destroy( )
            res.redirect("/get_login")
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    admin_profile: async (req, res) => {

        try {
            if (!req.session.user) return res.redirect('/get_login')
            const admin_details = await db.admindetail.findOne({
                where:{
                id: req.session.user.id
                }
            })
            console.log('>>>>>>>>>>>>>>>>>>', admin_details)
            res.render("admin/adminprofile", { admin_details, session: req.session, msg: req.flash('msg'),title:'admin_active'})
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    _profile_post: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>",req.body)
        
        
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const admin_details = await db.admindetail.findOne({
                where: {
                    id: req.session.user.id
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>>", admin_details)
            
            if (req.files && req.files.image) {
                var image = helper.fileUpload(req.files.image, 'images')
                console.log(image, '======================++!!!!')

                
              
            }
            // else {
            //     var img = admin_details.image
            // }
            // console.log(">>>>>>>>>>>>>>>",img)
            
            

            const data = await db.admindetail.update({
                name: req.body.name,
                email: req.body.email,
                image: image,
                phone:req.body.phone
            }, {
                where: {
                    id: req.session.user.id
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>>>>", data,req.session.user.email)


            var addsession = await db.admindetail.findOne({
                where: {
                    email: req.session.user.email
                }
            })
            req.session.user = addsession
            if (data) {
                req.flash('msg', 'Profile updated successfully!!')
                res.redirect('/dashboard')
            } else {
                req.flash('msg', 'Some thing Wrong ')
                res.redirect("/admin_profile")
            }
        } catch (error) {
            console.log(">>>error>>>>", error);
        }


    },
    change_password: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            res.render("admin/changePassword", { session: req.session, msg: req.flash('msg') ,title:'change_active'})
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_password: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            
            
			console.log(">>>>>>>>>>>", req.body);
			const changepass = await db.admindetail.findOne({
				where: {
					id: req.session.user.id
				}
				// limit:1
			})
			const hash = await bcrypt.hash(req.body.newpassword, 10)
			const compare = await bcrypt.compare(req.body.oldpassword, changepass.password)
			if (!compare) {
				req.flash('msg', 'Old password does not match')
				res.redirect('/change_password')
			}
			else {
				console.log("success");
				await db.admindetail.update({
					password: hash,
				}, {
					where: {
						id: req.session.user.id
					}
				})
				// 
				//  console.log('------ passeword has been change-------------------');
				req.flash('msg', 'Password changed successfully')
				res.redirect('/dashboard');
			}
		} catch (error) {
			console.log(error);
		}

    }










}



