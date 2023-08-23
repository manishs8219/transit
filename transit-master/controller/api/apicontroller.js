const {
    Sequelize,
    QueryTypes
} = require('sequelize');
//  const { sequelize } = require("../../models");
const moment = require('moment');
const stripe = require("stripe")("sk_test_HNEogxZVRXsC4cAEMOHn3CQy00dbzsINrv");


// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// var jwtSecretKey = 'hii_transit';
const jwt = require('jsonwebtoken')
const db = require('../../models')
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const helper = require('../../helper/helpers');
//var dateTime = require('node-datetime');
var secretKey = 'RaAsJaAfJdRaAdJfPaU1T2';
var cron = require('node-cron');
const Op = Sequelize.Op;

var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 28);



cron.schedule('* * * * *', async () => {
    //   console.log(today,"-------today-----");
    console.log('running a task every minute', oneWeekAgo);


    let bookings = await db.car_details.findAll({
        where: {
            createdAt: {
                [Op.lte]: oneWeekAgo
            },
            status: 0
        },
        raw: true
    })

    let destoyable_ids = bookings.map(i => i.id);

    console.log(bookings, "------------------bookings---------");

    console.log("ids are", destoyable_ids);

    await db.car_details.destroy({
        where: {
            id: destoyable_ids
        }
    })
    destoyable_ids = bookings.map(i => i.booking_id);

    await db.bookings.destroy({
        where: {
            id: destoyable_ids
        }
    })
});



var uuid = require('uuid').v4;
const users = db.users
const ratings = db.ratings
const bookings = db.bookings
const carring_prefrence_fiilter = db.carring_prefrence_fiilter
const carring_images = db.carring_images
const car_details = db.car_details
const carring_preference = db.carring_preference
var payments = db.payments
let time = helper.unixTimestamp();

var pdf = require('html-pdf');
var options = {
    format: 'Letter'
};


carring_images.belongsTo(bookings, {
    foreignKey: "user_id"
})
car_details.hasMany(carring_images, {
    foreignKey: "car_id" //car_id atti h isma 
})
car_details.hasMany(ratings, {
    foreignKey: "car_id"
})
bookings.hasMany(car_details, {
    foreignKey: "booking_id"
})
db.car_details.belongsTo(bookings, {
    foreignKey: "booking_id"
});
db.car_details.belongsTo(users, {
    foreignKey: "user_id",
    as: "userName"


});


db.offers_from_transporter.hasMany(carring_images, {
    foreignKey: "car_id", //car_id atti h isma 
    sourceKey: "car_id"
})

db.offers_from_transporter.belongsTo(bookings, {
    foreignKey: "booking_id"
});
db.offers_from_transporter.belongsTo(users, {
    foreignKey: "transporter_id"
});
db.offers_from_transporter.belongsTo(car_details, {
    foreignKey: "car_id"
});


db.car_details.hasOne(payments, {
    foreignKey: "car_id"
});
db.car_details.hasMany(db.offers_from_transporter, {
    foreignKey: "car_id"
});
// db.offers_from_transporter.belongsTo(users, {
//     foreignKey: "transporter_id",
// });

ratings.belongsTo(users, {
    foreignKey: "transporter_id",
    as: "transportername"
});
db.offers_from_transporter.belongsTo(users, {
    foreignKey: "transporter_id",
    targetKey: "id",
    // as: "transporter_detail"
})

db.offers_from_transporter.hasMany(db.quote_comment, {
    foreignKey: "post_id",
    sourceKey: "car_id"

})
db.quote_comment.hasMany(db.quote_sub_comment, {
    foreignKey: "quote_comment_id",

})

db.quote_comment.belongsTo(db.users, {
    foreignKey: "senderId",
    as: "quoteCommentSenderDetail"

})
db.quote_sub_comment.belongsTo(db.users, {
    foreignKey: "senderId",
    as: "subquoteCommentSenderDetail"

})





module.exports = {

    sign_up: async function (req, res) {

        console.log(req.body, '===================body Data')

        try {
            const required = {
                role: req.body.role,
                image: req.files && req.files.image,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                country: req.body.country,
                password: req.body.password,
                confirm_password: req.body.confirm_password
            };
            const nonRequired = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
                dob: req.body.dob,
                login_time: time,
            };

            let getdata = await helper.vaildObject(required, nonRequired, res);


            const emailfind = await db.users.findOne({
                where: {
                    email: getdata.email
                }
            })
            if (emailfind) throw 'Email already exist, please use another email';


            const findnumber = await db.users.findOne({
                where: {
                    phone: getdata.phone
                }

            })
            if (findnumber) throw 'Phone Number is already exit, use the another number';

            if (getdata.password != getdata.confirm_password) throw 'Password and confirm password must be same!!'

            const password = await bcrypt.hash(req.body.password, 12)
            getdata.password = password;

            if (req.files && req.files.image) {
                const image = helper.fileUpload(req.files.image, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = image
            }
            let dobtimestamp = moment(`${getdata.dob}`, 'YYYY-MM-DD').format();
            dobtimestamp = new Date(dobtimestamp).getTime() / 1000 //se
            getdata.dobtimestamp = dobtimestamp
            console.log(">>>>>>>>>>>>>>>>>>>>>>.", getdata.dobtimestamp)



            getdata.countryCodePhone = getdata.country + getdata.phone
            console.log(">>>>>>>>>>>", getdata.countryCodePhone)
            let otp = 1111
            getdata.otp = otp
            console.log(">>>>>>>>>>>>dsdddddfggghgg>>>>>>", getdata)
            // let time : unixtimetamp()=>{

            // }
            const data = await db.users.create(getdata);
            let token = jwt.sign({
                id: data.id,
                login_time: time
            }, secretKey);


            // data.dataValues.token = token;

            let userDetail = await db.users.findOne({

                where: {
                    email: getdata.email,
                    role: getdata.role
                },
                raw: true
            })
            userDetail.token = token;
            let isPrefer = await db.carring_prefrence_fiilter.findOne({
                where: {
                    transpoterid: userDetail.id
                },
                raw: true
            })
            if (isPrefer == null) {
                userDetail.isPerference = 0
            } else {
                userDetail.isPerference = 1
            }
            return helper.success(res, "SignUp Successfully", userDetail)
        } catch (error) {
            return helper.error(res, error);
        }

    },
    verify_otp: async (req, res) => {
        try {
            const required = {
                otp: req.body.otp
            };
            const nonRequired = {};

            const requestData = await helper.vaildObject(required, nonRequired, res)

            const findotp = await db.users.findOne({
                where: {

                    // otp: requestData.otp,
                    id: req.auth.id
                },
            })
            // if (findotp.otp !== requestData.otp){

            //     throw "Your OTP not matched "
            // }
            if (findotp.otp == requestData.otp) {

                var verifyotp = await db.users.update({
                    verify_otp: 1,
                    otp: 0
                }, {
                    where: {
                        id: findotp.id
                    }
                })
            } else {
                return helper.success(res, "Otp not matched.")

            }
            return helper.success(res, "Otp Verified successfully.", verifyotp);
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>...............................", error)

            return helper.error(res, error);



        }
    },
    resend_otp: async (req, res) => {
        try {

            const required = {
                phone: req.body.phone,
                email: req.body.email
            };
            const nonRequired = {};
            var requestdata = await helper.vaildObject(required, nonRequired, res)

            const data = await db.users.findOne({
                where: {
                    phone: requestdata.phone,
                    email: requestdata.email
                }
            })

            if (!data) throw "phone email not exist"
            let newotp = 4444
            const updata = await db.users.update({
                otp: newotp
            }, {
                where: {
                    id: data.id
                }
            })
            const datas = await db.users.findOne({
                where: {
                    id: data.id
                }
            })
            return helper.success(res, "Resend OTP Successfully", datas)
        } catch (error) {
            return helper.error(res, error);
        }
    },


    // forgetPassword: async (req, res) => {
    //     try {
    //         const required = {
    //             email: req.body.email,
    //         };
    //         const nonRequired = {};
    //         let requestdata = await helper.vaildObject(required, nonRequired);
    //         let forgot_user_password = await helper.send_email(requestdata, req, res)

    //         let msg = 'Email has been sent to your registered email';
    //         forgot_user_password = {};
    //         return helper.success(res,msg,forgot_user_password )

    //     } catch (error) {
    //         console.log(error, '--------error---------------')

    //     }
    // },
    // resetpassword: async (req, res) => {
    //     try {
    //         res.render('reset_password')
    //     } catch (error) {
    //         console.log(error, 'error-----------------------')
    //     }
    // },


    // reset_password: async function (req, res) {
    //     try {
    //         console.log(req.params, '=====@ reset token');


    //         const findUser = await db.users.findOne({
    //             where: {
    //                 resetpassword_token: req.params.token
    //             }
    //         })

    //         console.log(findUser, '===========findUser==============')

    //         var new_data = req.body

    //         console.log(new_data, '===========findUser==============')

    //         let update_password = await Helper.getBcryptHash(new_data.password);

    //         await db.users.update({ password: update_password, resetpassword_token: "" }, {
    //             where: {
    //                 id: findUser.id
    //             }
    //         })

    //         res.render('success_page')

    //         // let reset_user_password = await Helper.reset_password_user_data(req, res, new_data, update_password);

    //     } catch (err) {
    //         helper.error(res, err);
    //     }
    // },

    forgot_password: async (req, res) => {
        try {
            const required = {
                // roolType: req.body.roolType,
                email: req.body.email
            };

            const non_required = {
                // roolType: req.body.roolType,
                // security_key: req.headers.security_key
            };

            let requestdata = await helper.vaildObject(required, non_required);

            let existingUser = await db.users.findOne({
                where: {
                    email: requestdata.email,
                    //   role: requestdata.roolType
                },
                raw: true
            });
            if (!existingUser) throw "Email does not exist.";

            existingUser.forgotPasswordHash = helper.createSHA1();

            let html = `Click here to change your password <a href="${
                req.protocol
                }://${req.get("host")}/api/forgot_url/${
                existingUser.forgotPasswordHash
                }"> Click</a>`;

            let emailData = {
                to: requestdata.email,
                subject: "Transit Forgot Password",
                html: html
            };
            console.log("9999999999999", existingUser.forgotPasswordHash);

            await helper.sendEmail(emailData);
            const ligin_user_profile_change = await db.users.update({
                forgotPasswordHash: existingUser.forgotPasswordHash,
            }, {
                where: {
                    email: requestdata.email
                }

            })
            return helper.success(
                res,
                "Forgot Password email sent successfully.", {}
            );
        } catch (err) {
            return helper.error(res, err);
        }
    },
    forgotUrl: async (req, res) => {
        try {
            console.log("77777777777777777777777", req.params.hash);

            let user_detail = await db.users.findOne({
                where: {
                    forgotPasswordHash: req.params.hash
                }
            });
            console.log("0000000000000000000000000", user_detail);

            if (user_detail) {
                console.log("111111111111111111111111111");

                res.render("reset_password", {
                    title: "Transit",
                    response: user_detail,
                    msg: req.flash('msg'),
                    hash: req.params.hash
                });
            } else {
                const html = `
                <br/>
                <br/>
                <br/>
                <div style="font-size: 50px;" >
                    <b><center>Link has been expired!</center><p>
                </div>
              `;
                res.status(403).send(html);
            }
        } catch (err) {
            throw err;
        }
    },
    resetPassword: async (req, res) => {
        try {
            const {
                password,
                forgotPasswordHash
            } = {
                ...req.body
            };

            const forgot_user = await db.users.findOne({
                where: {
                    forgotPasswordHash
                },
                raw: true
            });
            if (!forgot_user) throw "Something went wrong.";
            console.log("================================", password);

            const updateObj = {};
            updateObj.password = await bcrypt.hash(password, 12)
           
            
            updateObj.forgotPasswordHash = "";
            updateObj.id = forgot_user.id;
            const ligin_user_profile_change = await db.users.update({
                forgotPasswordHash: "",
                password: updateObj.password
            }, {
                where: {
                    id: forgot_user.id
                }

            })

            console.log("111111111111111111111111111", ligin_user_profile_change);

            if (ligin_user_profile_change) {
                return helper.success(res, "Password updated successfully.", {});

            } else {
                throw "Invalid User.";
            }
        } catch (err) {
            return helper.error(res, err);

        }
    },
    change_password: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>")
        try {
            const required = {
                oldpassword: req.body.oldpassword,
                newpassword: req.body.newpassword,
                confirm_password: req.body.confirm_password

            };

            const nonRequired = {};


            let requestData = await helper.vaildObject(required, nonRequired, res);
            console.log(">>>>>>>>>>>>>>>>", requestData)

            const user = await db.users.findOne({
                where: {
                    id: req.auth.id,
                }

            })
            console.log(">>>>>>>>>>>>>>>>>", user)


            if (requestData.newpassword != requestData.confirm_password) throw 'New Password and confirm password must be same!!'
            var hash = bcrypt.hashSync(requestData.newpassword, 8);
            var compare = bcrypt.compareSync(requestData.oldpassword, user.password);
            console.log(compare);
            if (!compare) {
                throw "password do not match "
            }

            await db.users.update({
                password: hash
            }, {
                where: {
                    id: req.auth.id
                }
            })
            const data = await db.users.findOne({
                where: {
                    id: req.auth.id
                }

            })

            return helper.success(res, 'Password changed successfully', data)
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.............", error);
            return helper.error(res, err);
        }
    },
    log_out: async (req, res) => {
        try {
            const user = await db.users.findOne({
                where: {
                    id: req.auth.id,
                }
            })
            if (user) {
                await db.users.update({
                    deviceToken: '',
                    deviceType: '',
                    login_time: 0
                }, {
                    where: {
                        id: req.auth.id,
                    }
                })
                return helper.success(res, 'Logout successfully')
            }
        } catch (error) {
            helper.error(res, error)
        }

    },
    login: async function (req, res) {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password,
                role: req.body.role

            };
            const nonRequired = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken
            };

            const getdata = await helper.vaildObject(required, nonRequired, res)
            let verify_email = await db.users.findOne({
                where: {
                    email: getdata.email,
                    role: getdata.role
                },
                raw: true
            })
            if (verify_email == null) {
                throw 'Invalid Email.'
            };



            let type_email = await db.users.findOne({
                where: {
                    email: getdata.email,
                    role: req.body.role

                },
                raw: true
            })
            if (type_email.type == 0) {
                throw 'Your account In-activate from Admin';
            }
            let time = helper.unixTimestamp();

            let checkPassword = await bcrypt.compare(getdata.password, verify_email.password)
            if (!checkPassword) throw 'Incorrect email or password';
            await db.users.update({
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
                login_time: time

            }, {
                where: {
                    email: getdata.email,
                    role: getdata.role
                }
            });

            let userDetail = await db.users.findOne({
                where: {
                    id: verify_email.id
                },
                raw: true
            })

            let token = jwt.sign({
                id: userDetail.id,
                login_time: time
            }, secretKey);

            userDetail.token = token;
            let isPrefer = await db.carring_prefrence_fiilter.findOne({
                where: {
                    transpoterid: userDetail.id
                },
                raw: true
            })
            if (isPrefer == null) {
                userDetail.isPerference = 0
            } else {
                userDetail.isPerference = 1
            }
            return helper.success(res, "User Login successfully", userDetail)

        } catch (error) {
            helper.error(res, error);
        }
    },

    social_login: async (req, res) => {
        try {
            const required = {
                social_type: req.body.social_type,
                social_id: req.body.social_id,
                role: req.body.role
            }
            const nonRequired = {
                email: req.body.email,
                name: req.body.name,
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
                image: req.files && req.files.image,
                login_time: time
            }
            const getdata = await helper.vaildObject(required, nonRequired, res)
            var time = helper.unixTimestamp();
            var findUser = await db.users.findOne({
                where: {
                    social_id: getdata.social_id,
                    social_type: getdata.social_type,
                },
                raw: true
            })

            if (req.files && req.files.image) {
                var images = await helper.fileUpload(req.files.image, 'images')

            }

            if (!findUser) {
                var social_userddddddddddd = await db.users.create({
                    social_id: getdata.social_id,
                    social_type: getdata.social_type,
                    name: getdata.name,
                    email: getdata.email,
                    role: getdata.role,
                    deviceType: getdata.deviceType,
                    deviceToken: getdata.deviceToken,
                    otp: 1111,
                    verify_otp: 1,
                    image: images,
                    login_time: time
                })
                // data = data.toJSON()
                // console.log(">>>>>>>>>>>>",data)
                var social_user = await db.users.findOne({
                    where: {
                        id: social_userddddddddddd.id
                    },
                    raw: true
                })
                let token = jwt.sign({
                    id: social_user.id,
                    login_time: time
                }, secretKey);
                social_user.token = token

                let isPrefer = await db.carring_prefrence_fiilter.findOne({
                    where: {
                        transpoterid: social_user.id
                    },
                    raw: true
                })
                if (isPrefer == null) {
                    social_user.isPerference = 0
                } else {
                    social_user.isPerference = 1
                }

                return helper.success(res, "Social Login successfully", social_user)
            } else {
                if (findUser.social_id == getdata.social_id && findUser.social_type == getdata.social_type && findUser.role == getdata.role) {
                    var iiojk9o = await db.users.update({
                        deviceToken: findUser.deviceToken,
                        deviceType: findUser.deviceType,
                        login_time: time

                    }, {
                        where: {
                            id: findUser.id
                        }
                    })

                    var social_user = await db.users.findOne({
                        where: {
                            id: findUser.id
                        },
                        raw: true
                    })
                    console.log(social_user, 'sadddddddddddddddddddddddddddddddddd')

                    let token = jwt.sign({
                        id: social_user.id,
                        login_time: time
                    }, secretKey);
                    social_user.token = token



                    let isPrefer = await db.carring_prefrence_fiilter.findOne({
                        where: {
                            transpoterid: social_user.id
                        },
                        raw: true
                    })
                    if (isPrefer == null) {
                        social_user.isPerference = 0
                    } else {
                        social_user.isPerference = 1
                    }
                } else {

                    return helper.error(res, "Email already exist");

                }

                return helper.success(res, "Social login successfully", social_user)
            }
        } catch (error) {
            return helper.error(res, error);

        }
    },

    get_user_profile: async (req, res) => {
        try {

            const find_login_user_profie = await db.users.findOne({
                attributes: {
                    exclude: ['password', 'd_licence_front_image', 'd_licence_backs_image', 'insurance_file', 'insurance_company', 'level_coverage', 'createdAt', 'updatedAt', 'dobtimestamp', 'otp', 'dob', 'type', 'deviceType', "deviceToken", 'phone_number', 'social_type', 'social_id', ]
                },
                where: {
                    id: req.auth.id
                },
                raw: true

            })

            return helper.success(res, "Get profile successfully", {
                find_login_user_profie
            })

        } catch (error) {
            return helper.error(res, error);

        }

    },

    edit_user_profile: async (req, res) => {

        try {
            const required = {};
            const nonRequired = {
                name: req.body.name,
                email: req.body.email,
                country: req.body.country,
                phone: req.body.phone,
                image: req.body.image
            };

            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (req.files && req.files.image) {
                const image = helper.fileUpload(req.files.image, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = image

            }
            const ligin_user_profile_change = await db.users.update({
                name: getdata.name,
                email: getdata.email,
                country: getdata.country,
                phone: getdata.phone,
                image: getdata.image
            }, {
                where: {
                    id: req.auth.id
                }

            })
            const find_login_user_new_profie = await db.users.findOne({
                attributes: {
                    exclude: ['password', 'd_licence_front_image', 'd_licence_backs_image', 'insurance_file', 'insurance_company', 'level_coverage', 'createdAt', 'updatedAt', 'dobtimestamp', 'otp', 'dob', 'type', 'deviceType', "deviceToken", 'phone_number', 'social_type', 'social_id', ]
                },
                where: {
                    id: req.auth.id
                },
                raw: true

            })
            return helper.success(res, "Profile updated  successfully", find_login_user_new_profie)
        } catch (error) {
            return helper.error(res, error);


        }
    },
    contact_us: async (req, res) => {
        try {
            const admin_contact_us = await db.admindetail.findAll({
                attributes: {
                    exclude: ['password', 'image', 'createdAt', 'updatedAt']
                },
                raw: true
            })
            return helper.success(res, "Contact Us ", admin_contact_us)
        } catch (error) {

            return helper.error(res, error);


        }
    },
    userside_contact_us: async (req, res) => {
        try {
            const required = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                message: req.body.message
            };
            const nonRequired = {
                message: req.body.message
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)
            const find_user = await db.users.findOne({
                where: {
                    id: req.auth.id,
                },
                raw: true
            })
            if (find_user) {
                await db.contactus.create({
                    userid: find_user.id,
                    name: getdata.name,
                    email: getdata.email,
                    phone: getdata.phone,
                    message: getdata.message
                })
            }
            return helper.success(res, "Your form  submited ")
        } catch (error) {
            return helper.error(res, error);



        }
    },
    terms_Conditions: async (req, res) => {
        try {
            const terms_Conditions = await db.cms.findOne({
                where: {
                    id: 1
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>........", terms_Conditions)

            return helper.success(res, "Terms&Conditions ", terms_Conditions)

        } catch (error) {
            return helper.error(res, error);


        }
    },
    privacy_policy: async (req, res) => {
        try {
            const privacy_policy = await db.cms.findOne({
                where: {
                    id: 2
                }
            })
            return helper.success(res, "privacy_policy ", privacy_policy)

        } catch (error) {
            return helper.error(res, error);

        }
    },
    faqs: async (req, res) => {
        try {
            const faqs = await db.faqs.findAll({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
                    },

                }

            )
            return helper.success(res, "Question Answers ", faqs)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    /////////////////////Rating//////////////////////////////////
    add_ratings: async (req, res) => {
        try {
            const required = {
                transporter_id: req.body.transporter_id,
                rating: req.body.rating,
                review: req.body.review,
                car_id: req.body.car_id
            };
            const nonRequired = {

            };
            const getdata = await helper.vaildObject(required, nonRequired, res)

            const rating_auth_user = await db.users.findOne({
                where: {
                    id: req.auth.id
                }
            })

            if (rating_auth_user) {
                var create_rating = await db.ratings.create({
                    car_id: req.body.car_id,
                    user_id: req.auth.id,
                    transporter_id: getdata.transporter_id,
                    ratings: getdata.rating,
                    comment: getdata.review,
                })
            }
            return helper.success(res, "Rating added successfully ", create_rating)


        } catch (error) {
            return helper.error(res, error);

        }



    },
    faqs: async (req, res) => {
        try {
            const faqs = await db.faqs.findAll({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt']
                    },

                }

            )
            return helper.success(res, "Question Answers ", faqs)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    ratings: async (req, res) => {
        try {
            const finduser = await db.ratings.findAll({
                attributes: {
                    exclude: ['updatedAt']
                },
                include: [{
                    model: db.users,
                    as: "transportername",
                    attributes: ["image", "name"],



                }, ],
                Order: [
                    ['id', 'Desc']
                ],
                where: {
                    user_id: req.auth.id
                }

            })
            console.log(">>>>>>>>>>>>>>>>>>>>", finduser)
            return helper.success(res, "All Ratings ", finduser)

        } catch (error) {
            console.log(".>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", error)
        }
    },
    get_category: async (req, res) => {
        try {
            const categorys = await db.carrying_preference.findAll()
            return helper.success(res, "All categories", categorys)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    booking_form: async (req, res) => {
        try {
            const required = {
                from_street_adress: req.body.from_address,
                from_name: req.body.from_name,
                from_postcode: req.body.from_postcode,
                from_city: req.body.from_city,
                from_number: req.body.from_number,
                from_country_code: req.body.from_country_code,
                from_lat: req.body.from_lat,
                from_log: req.body.from_log,
                to_street_adress: req.body.to_address,
                to_name: req.body.to_name,
                to_postcode: req.body.to_postcode,
                to_city: req.body.to_city,
                to_country_code: req.body.to_country_code,
                to_number: req.body.to_number,
                to_lat: req.body.to_lat,
                to_log: req.body.to_log,
                preference_id: req.body.preference_id,
                delivery_time: req.body.delivery_time,
                people_moved: req.body.people_moved,
                userid: req.auth.id
            };
            const nonRequired = {
                vehcial_detail: req.body.vehcial_detail,
                bike_detail: req.body.bike_detail,
                furniture_detail: req.body.furniture_detail,
                more_detail: req.body.more_detail,
                other_category: req.body.other_category,
                date: req.body.date,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                image: typeof req.body.image === "object" ?
                    req.body.image : JSON.parse(req.body.image)
            };
            const requestData = await helper.vaildObject(required, nonRequired, res);
            const booking = await db.bookings.create(requestData);
            if (booking.id && requestData.preference_id == 1) {
                if (requestData.preference_id == 1) {

                    requestData.vehcial_detail = JSON.parse(requestData.vehcial_detail);
                    requestData.vehcial_detail.vehcial_detail.forEach(async (data) => {
                        var car_detail = await db.car_details.create({
                            preference_id: req.body.preference_id,
                            booking_id: booking.id,
                            user_id: req.auth.id,
                            car_name: data.car_name,
                            car_model: data.car_model,
                            car_weight: data.car_weight,
                            start_date: req.body.start_date,
                            end_date: req.body.end_date,
                            from_lat: req.body.from_lat,
                            from_log: req.body.from_log,
                            to_lat: req.body.to_lat,
                            to_log: req.body.to_log
                        })
                        data.images = data.images.map((img) => ({
                            booking_id: booking.id,
                            preference_id: requestData.preference_id,
                            images: img,
                            user_id: req.auth.id,
                            car_id: car_detail.dataValues.id
                        }));

                        const images = db.carring_images.bulkCreate(data.images);

                    });
                    var data = await db.prefrence.findAll({
                        attributes: [`id`, `fillter_name`, `from_location_name`, `to_location_name`, `transporter_id`, `category`, `created_at`, `updated_at`, `from_latitude`, `from_longitude`,
                            `to_latitude`, `to_longitude`, `miles`,
                            [Sequelize.literal(`ifnull((SELECT deviceType FROM users WHERE users.id =prefrence.transporter_id LIMIT 1) , 0)`), 'deviceType'],
                            [Sequelize.literal(`ifnull((SELECT deviceToken FROM users WHERE users.id =prefrence.transporter_id  LIMIT 1) , 0)`), 'device_token'],
                            [Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.from_lat}) )
                                        * cos( radians(\`prefrence\`.\`from_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`from_longitude\`) - radians(${ requestData.from_log}) )
                                        + sin( radians(${requestData.from_lat}) )
                                        * sin( radians(\`prefrence\`.\`from_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance"
                            ],
                            [
                                Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.to_lat}) )
                                        * cos( radians(\`prefrence\`.\`to_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`to_longitude\`) - radians(${ requestData.to_log}) )
                                        + sin( radians(${requestData.to_lat}) )
                                        * sin( radians(\`prefrence\`.\`to_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance2"
                            ]
                        ],
                        having: {
                            distance: {
                                [Op.lte]: 100,
                            },
                            distance2: {
                                [Op.lte]: 100,
                            },

                        },
                        where: {
                            category: {
                                [Op.like]: '%' + req.body.preference_id + '%',
                            }
                        },
                        raw: true
                    });


                    user1data = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        },
                        raw: true
                    })
                    for (let i in data) {
                        transporterId = await db.users.findOne({
                            where: {
                                id: data[i].transporter_id
                            },
                            raw: true
                        })
                        const comment = transporterId.name + " a job from " + data[i].from_location_name + " to " + data[i].to_location_name + " has been placed for " + data[i].fillter_name

                        //push for filter
                        if (transporterId.notification_status == 1) {
                            sendpush = await helper.send_push_notification(comment, data[i].device_token, data[i].deviceType, user1data.id, user1data.name, user1data.image, 7);
                        }
                    }
                    const map1 = data.map(x => x.transporter_id);
                    console.log(">......map.......",map1);
                    
                    
                    const prefrence = await db.prefrence.findAll({
                        where: {
                            category: {
                                [Op.like]: '%' + req.body.preference_id + '%',
                            }
                        },
                        raw: true
                    })
                   const tpdata = prefrence.map(i => i.transporter_id);
                    let newArr = map1.concat(tpdata)

                    const userslist = await db.users.findAll({
                        where: {
                            role: 2,
                            id: {
                                [Op.notIn]: newArr
                            }
                        },
                        raw: true
                    })
                    for (let i in userslist) {
                        console.log(userslist[i].deviceToken, "  if condition ");
                        if (userslist[i].notification_status == 1) {
                            const comment = `${userslist[i].name} you have a new request`
                            sendpush = await helper.send_push_notification(comment, userslist[i].deviceToken, userslist[i].deviceType, user1data.id, user1data.name, user1data.image, 9);
                        }
                    }
                }
            }
            if (booking.id && requestData.preference_id == 2) {
                if (requestData.preference_id == 2) {
                    requestData.bike_detail = JSON.parse(requestData.bike_detail);
                    requestData.bike_detail.bike_detail.forEach(async (data) => {
                        var car_detail = await db.car_details.create({
                            preference_id: req.body.preference_id,
                            booking_id: booking.id,
                            user_id: req.auth.id,
                            bike_name: data.bike_name,
                            bike_model: data.bike_model,
                            bike_weight: data.bike_weight,
                            start_date: req.body.start_date,
                            end_date: req.body.end_date,
                            from_lat: req.body.from_lat,
                            from_log: req.body.from_log,
                            to_lat: req.body.to_lat,
                            to_log: req.body.to_log
                        })
                        data.images = data.images.map((img) => ({
                            booking_id: booking.id,
                            preference_id: requestData.preference_id,
                            images: img,
                            user_id: req.auth.id,
                            car_id: car_detail.dataValues.id
                        }));
                        const images = db.carring_images.bulkCreate(data.images);

                    });

                    let data = await db.prefrence.findAll({
                        attributes: [`id`, `fillter_name`, `from_location_name`, `to_location_name`, `transporter_id`, `category`, `created_at`, `updated_at`, `from_latitude`, `from_longitude`,
                            `to_latitude`, `to_longitude`, `miles`,
                            [Sequelize.literal(`ifnull((SELECT deviceType FROM users WHERE users.id =prefrence.transporter_id LIMIT 1) , 0)`), 'deviceType'],
                            [Sequelize.literal(`ifnull((SELECT deviceToken FROM users WHERE users.id =prefrence.transporter_id  LIMIT 1) , 0)`), 'device_token'],
                            [Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.from_lat}) )
                                        * cos( radians(\`prefrence\`.\`from_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`from_longitude\`) - radians(${ requestData.from_log}) )
                                        + sin( radians(${requestData.from_lat}) )
                                        * sin( radians(\`prefrence\`.\`from_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance"
                            ],
                            [
                                Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.to_lat}) )
                                        * cos( radians(\`prefrence\`.\`to_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`to_longitude\`) - radians(${ requestData.to_log}) )
                                        + sin( radians(${requestData.to_lat}) )
                                        * sin( radians(\`prefrence\`.\`to_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance2"
                            ]

                        ],
                        having: {
                            distance: {
                                [Op.lte]: 100,
                            },
                            distance2: {
                                [Op.lte]: 100,
                            },

                        },
                        where: {
                            category: {
                                [Op.like]: '%' + req.body.preference_id + '%',
                            }
                        }
                    });
                    user1data = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        },
                        raw: true
                    })
                    for (let i in data) {
                        transporterId = await db.users.findOne({
                            where: {
                                id: data[i].transporter_id
                            },
                            raw: true
                        })
                        const comment = transporterId.name + " a job from " + data[i].from_location_name + " to " + data[i].to_location_name + " has been placed for " + data[i].fillter_name
                        if (transporterId.notification_status == 1) {
                            sendpush = await helper.send_push_notification(comment, data[i].device_token, data[i].deviceType, user1data.id, user1data.name, user1data.image, 7);
                        }
                    }
                    const map1 = data.map(x => x.transporter_id);


                    const prefrence = await db.prefrence.findAll({
                        where: {
                            category: req.body.preference_id,
                            from_latitude: req.body.from_lat,
                            from_longitude: req.body.from_log,
                            to_latitude: req.body.to_lat,
                            to_longitude: req.body.to_log
                        },
                        raw: true
                    })
                    const tpdata = prefrence.map(i => i.transporter_id);
                    let newArr = map1.concat(tpdata)

                    const userslist = await db.users.findAll({
                        where: {
                            role: 2,
                            id: {
                                [Op.notIn]: newArr
                            }
                        },
                        raw: true
                    })
                    for (let i in userslist) {
                        console.log(userslist[i].deviceToken, "  if condition ");
                        if (userslist[i].notification_status == 1) {
                            const comment = `${userslist[i].name} you have a new request`
                            sendpush = await helper.send_push_notification(comment, userslist[i].deviceToken, userslist[i].deviceType, user1data.id, user1data.name, user1data.image, 9);
                        }
                    }
                }
            }
            if (booking.id && (requestData.preference_id == 3 || requestData.preference_id == 6)) {
                if ((requestData.preference_id == 3 || requestData.preference_id == 6)) {
                    requestData.furniture_detail = JSON.parse(requestData.furniture_detail);
                    requestData.furniture_detail.furniture_detail.forEach(async (data) => {
                        var car_detail = await db.car_details.create({
                            preference_id: req.body.preference_id,
                            booking_id: booking.id,
                            user_id: req.auth.id,
                            furniture_height: data.furniture_height,
                            furniture_width: data.furniture_width,
                            furniture_weight: data.furniture_weight,
                            optional_detail: data.optional_detail,
                            start_date: req.body.start_date,
                            end_date: req.body.end_date,
                            from_lat: req.body.from_lat,
                            from_log: req.body.from_log,
                            to_lat: req.body.to_lat,
                            to_log: req.body.to_log
                        })
                        data.images = data.images.map((img) => ({
                            booking_id: booking.id,
                            preference_id: requestData.preference_id,
                            images: img,
                            user_id: req.auth.id,
                            car_id: car_detail.dataValues.id
                        }));
                        const images = db.carring_images.bulkCreate(data.images);
                    });


                    let data = await db.prefrence.findAll({
                        attributes: [`id`, `fillter_name`, `from_location_name`, `to_location_name`, `transporter_id`, `category`, `created_at`, `updated_at`, `from_latitude`, `from_longitude`,
                            `to_latitude`, `to_longitude`, `miles`,
                            [Sequelize.literal(`ifnull((SELECT deviceType FROM users WHERE users.id =prefrence.transporter_id LIMIT 1) , 0)`), 'deviceType'],
                            [Sequelize.literal(`ifnull((SELECT deviceToken FROM users WHERE users.id =prefrence.transporter_id  LIMIT 1) , 0)`), 'device_token'],
                            [Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.from_lat}) )
                                        * cos( radians(\`prefrence\`.\`from_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`from_longitude\`) - radians(${ requestData.from_log}) )
                                        + sin( radians(${requestData.from_lat}) )
                                        * sin( radians(\`prefrence\`.\`from_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance"
                            ],
                            [
                                Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.to_lat}) )
                                        * cos( radians(\`prefrence\`.\`to_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`to_longitude\`) - radians(${ requestData.to_log}) )
                                        + sin( radians(${requestData.to_lat}) )
                                        * sin( radians(\`prefrence\`.\`to_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance2"
                            ]

                        ],
                        having: {
                            distance: {
                                [Op.lte]: 100,
                            },
                            distance2: {
                                [Op.lte]: 100,
                            },

                        },
                        where: {
                            category: {
                                [Op.like]: '%' + req.body.preference_id + '%',
                            }

                        }
                    });
                    user1data = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        },
                        raw: true
                    })
                    for (let i in data) {
                        transporterId = await db.users.findOne({
                            where: {
                                id: data[i].transporter_id
                            },
                            raw: true
                        })
                        const comment = transporterId.name + " a job from " + data[i].from_location_name + " to " + data[i].to_location_name + " has been placed for " + data[i].fillter_name
                        if (transporterId.notification_status == 1) {
                            sendpush = await helper.send_push_notification(comment, data[i].device_token, data[i].deviceType, user1data.id, user1data.name, user1data.image, 7);
                        }
                    }
                    const map1 = data.map(x => x.transporter_id);

                    const prefrencess = await db.prefrence.findAll({
                        where: {
                            category: req.body.preference_id,
                            from_latitude: req.body.from_lat,
                            from_longitude: req.body.from_log,
                            to_latitude: req.body.to_lat,
                            to_longitude: req.body.to_log
                        },
                        raw: true
                    })
                    const tpdata = prefrencess.map(i => i.transporter_id);

                    let newArr = map1.concat(tpdata)

                    const userslist = await db.users.findAll({
                        where: {
                            role: 2,
                            id: {
                                [Op.notIn]: newArr
                            }
                        },
                        raw: true
                    })
                    for (let i in userslist) {
                        console.log(userslist[i].deviceToken, "  if condition ");
                        if (userslist[i].notification_status == 1) {
                            const comment = `${userslist[i].name} you have a new request`
                            sendpush = await helper.send_push_notification(comment, userslist[i].deviceToken, userslist[i].deviceType, user1data.id, user1data.name, user1data.image, 9);
                        }
                    }
                }
            }
            if (booking.id && (requestData.preference_id == 4 || requestData.preference_id == 5 || requestData.preference_id == 7 || requestData.preference_id == 8 || requestData.preference_id == 9)) {
                if ((requestData.preference_id == 4 || requestData.preference_id == 5 || requestData.preference_id == 7 || requestData.preference_id == 8 || requestData.preference_id == 9)) {
                    requestData.more_detail = JSON.parse(requestData.more_detail);
                    requestData.more_detail.more_detail.forEach(async (data) => {
                        var car_detail = await db.car_details.create({
                            preference_id: req.body.preference_id,
                            booking_id: booking.id,
                            user_id: req.auth.id,
                            tittle: data.tittle,
                            height: data.height,
                            width: data.width,
                            weight: data.weight,
                            optional_detail: data.optional_detail,
                            start_date: req.body.start_date,
                            end_date: req.body.end_date,
                            from_lat: req.body.from_lat,
                            from_log: req.body.from_log,
                            to_lat: req.body.to_lat,
                            to_log: req.body.to_log
                        })
                        data.images = data.images.map((img) => ({
                            booking_id: booking.id,
                            preference_id: requestData.preference_id,
                            images: img,
                            user_id: req.auth.id,
                            car_id: car_detail.dataValues.id
                        }));
                        const images = db.carring_images.bulkCreate(data.images);

                    });

                    let data = await db.prefrence.findAll({
                        attributes: [`id`, `fillter_name`, `from_location_name`, `to_location_name`, `transporter_id`, `category`, `created_at`, `updated_at`, `from_latitude`, `from_longitude`,
                            `to_latitude`, `to_longitude`, `miles`,
                            [Sequelize.literal(`ifnull((SELECT deviceType FROM users WHERE users.id =prefrence.transporter_id LIMIT 1) , 0)`), 'deviceType'],
                            [Sequelize.literal(`ifnull((SELECT deviceToken FROM users WHERE users.id =prefrence.transporter_id  LIMIT 1) , 0)`), 'device_token'],
                            [Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.from_lat}) )
                                        * cos( radians(\`prefrence\`.\`from_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`from_longitude\`) - radians(${ requestData.from_log}) )
                                        + sin( radians(${requestData.from_lat}) )
                                        * sin( radians(\`prefrence\`.\`from_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance"
                            ],
                            [
                                Sequelize.literal(
                                    `round(
                                      ( 6371 * acos( least(1.0,
                                        cos( radians(${ requestData.to_lat}) )
                                        * cos( radians(\`prefrence\`.\`to_latitude\`) )
                                        * cos( radians(\`prefrence\`.\`to_longitude\`) - radians(${ requestData.to_log}) )
                                        + sin( radians(${requestData.to_lat}) )
                                        * sin( radians(\`prefrence\`.\`to_latitude\`)
                                      ) ) )
                                    ), 1)`
                                ),
                                "distance2"
                            ]

                        ],
                        having: {
                            distance: {
                                [Op.lte]: 100,
                            },
                            distance2: {
                                [Op.lte]: 100,
                            },

                        },
                        where: {
                            category: {
                                [Op.like]: '%' + req.body.preference_id + '%',
                            }
                        }
                    });
                    user1data = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        },
                        raw: true
                    })
                    for (let i in data) {
                        transporterId = await db.users.findOne({
                            where: {
                                id: data[i].transporter_id
                            },
                            raw: true
                        })
                        const comment = transporterId.name + " a job from " + data[i].from_location_name + " to " + data[i].to_location_name + " has been placed for " + data[i].fillter_name
                        if (transporterId.notification_status == 1) {
                            sendpush = await helper.send_push_notification(comment, data[i].device_token, data[i].deviceType, user1data.id, user1data.name, user1data.image, 7);
                        }
                    }
                    const map1 = data.map(x => x.transporter_id);
                    const prefrence = await db.prefrence.findAll({
                        where: {
                            category: req.body.preference_id,
                            from_latitude: req.body.from_lat,
                            from_longitude: req.body.from_log,
                            to_latitude: req.body.to_lat,
                            to_longitude: req.body.to_log
                        },
                        raw: true
                    })
                    const tpdata = prefrence.map(i => i.transporter_id);

                    let newArr = map1.concat(tpdata)

                    const userslist = await db.users.findAll({
                        where: {
                            role: 2,
                            id: {
                                [Op.notIn]: newArr
                            }
                        },
                        raw: true
                    })
                    for (let i in userslist) {
                        console.log(userslist[i].deviceToken, "  if condition ");
                        if (userslist[i].notification_status == 1) {
                            const comment = `${userslist[i].name} you have a new request`
                            sendpush = await helper.send_push_notification(comment, userslist[i].deviceToken, userslist[i].deviceType, user1data.id, user1data.name, user1data.image, 9);
                        }
                    }
                }
            }
            return helper.success(res, "Booking created successfully!")
        } catch (error) {
            return helper.error(res, error);
        }
    },
    upload_car_images: async (req, res) => {
        try {
            const required = {
                image: req.files && req.files.image,
            };
            const nonRequired = {};
            const requestData = await helper.vaildObject(required, nonRequired, res);
            var image_data = [];
            if (req.files && req.files.image && Array.isArray(req.files.image)) {

                for (var imgkey in req.files.image) {
                    var image_url = await helper.imageUpload(req.files.image[imgkey], 'images');
                    image_data.push(image_url)
                }
            } else {
                var image_url = await helper.fileUpload(req.files.image, 'images');
                image_data.push(image_url)
                console.log(">................", image_url);
            }
            return helper.success(res, "Images uploaded ", image_data)
        } catch (error) {
            console.log("??????????????", error);


        }
    },
    request_tracking: async (req, res) => {
        try {
            const required = {
                driver_id: req.body.driver_id
            };
            const nonRequired = {};
            var getdata = await helper.vaildObject(required, nonRequired, res)
            var request_status = await db.users.findOne({
                where: {
                    id: getdata.driver_id,

                }
            })

            var sender_name = await db.users.findOne({
                where: {
                    id: req.auth.id
                }
            })

            if ((request_status.notification_status == 0)) {

                var comment = sender_name.name + " " + "want to see your Current Location"

                var going_notifiactons = await db.push_notifications.create({
                    sender_id: req.auth.id,
                    recevier_Id: getdata.driver_id,
                    notification_type: 2,
                    comment: comment
                })
                return helper.success(res, "Transporter disable the Track System ")
            } else if ((request_status.notification_status == 1 && request_status.track_status == 2)) {
                var user1data = await helper.get_user_data(req.auth.id)
                var userdata = await helper.get_user_data(getdata.driver_id);
                var comment = sender_name.name + " " + "want to see your Current Location"
                let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 2);
                return helper.success(res, "Transporter disable the Track System ")
            } else {
                return helper.success(res, "you can see the location of transporter")
            }

        } catch (error) {
            return helper.error(res, error);
        }
    },

    my_jobs: async (req, res) => {
        try {
            var my_jobs_data = await db.car_details.findAll({
                attributes: [`id`, `type`, `preference_id`, `start_end_bookings`, `booking_id`, `user_id`, `car_name`, `car_model`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                    [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                    [Sequelize.literal('(SELECT  is_payment FROM payments where payments.car_id=car_details.id  LIMIT 1)'), 'is_payments', ],
                ],
                where: {
                    user_id: req.auth.id,
                    [Op.or]: [{
                        status: 0
                    }, {
                        status: 1
                    }],
                    start_end_bookings: {
                        [Op.not]: 4
                    }

                },
                order: [
                    ['id', "DESC"]
                ],
                include: [{
                        model: db.bookings,

                    },
                    {
                        model: db.carring_images,
                    },
                    {
                        model: db.payments,
                    },
                ]

            })
            return helper.success(res, "My Forms", my_jobs_data)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    past_jobs: async (req, res) => {
        try {
            var all_req = await db.car_details.findAll({
                attributes: [`id`, `type`, `preference_id`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                    [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                    [Sequelize.literal(`ifnull((SELECT ratings FROM ratings WHERE transporter_id =car_details.transporter_id AND user_id=${req.auth.id} LIMIT 1) , 0)`), 'is_ratings'],
                ],
                where: {
                    [Op.and]: [{
                            user_id: req.auth.id
                        },
                        {
                            start_end_bookings: 4
                        }
                    ],

                },
                order: [
                    ['id', 'DESC']
                ],
                include: [{
                        model: db.bookings,
                        required: true
                    }, {
                        model: db.carring_images,
                        required: true

                    },
                    {
                        model: db.payments,
                    }, {
                        model: db.ratings,
                    },
                ]
            })
            return helper.success(res, "My Forms", all_req)
        } catch (error) {
            return helper.error(res, error);
        }
    },
    jobs_profile: async (req, res) => {
        try {
            const required = {
                request_id: req.body.request_id,

            };
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)

            var profile = await db.car_details.findOne({
                where: {
                    id: getdata.request_id,
                },
                include: {
                    model: db.bookings,
                    required: true
                },
                raw: true

            })
            var profile_images = await db.carring_images.findAll({
                where: {
                    car_id: getdata.request_id, ////car_d
                },
                raw: true
            })
            console.log(">>>>>>>>>>>>>>>>>>>>>>", profile_images)


            var qotes = await db.offers_from_transporter.findAll({
                attributes: ["id", 'booking_id', 'booking_price', 'comment', 'transporter_id',
                    [Sequelize.literal('(SELECT  name FROM users   WHERE offers_from_transporter.transporter_id =   users.id )'), 'transporterName'],
                    [Sequelize.literal('(SELECT  image FROM users   WHERE offers_from_transporter.transporter_id =   users.id )'), 'transpoterImage'],
                    [Sequelize.literal('ifnull((SELECT AVG(ratings) FROM ratings WHERE transporter_id = offers_from_transporter.transporter_id), 0)'), 'avgRating'],
                ],
                where: {
                    car_id: getdata.request_id,
                },
                // include: [{
                //     model: db.quote_comment,
                //     attributes: ['id', 'post_id', 'quote_id', 'quote_comment', 'senderId', 'receiverId', 'type', 'created_at', 'updated_at', ],

                    // include: [{
                    //         model: db.users,
                    //         attributes: ['name', 'id', 'image'],
                    //         as: "quoteCommentSenderDetail"
                    //     },
                    //     {
                    //         model: db.quote_sub_comment,
                    //         attributes: [`id`, `quote_comment_id`, `post_id`, `senderId`, `receiverId`, `sub_type`, `created_at`, `updated_at`, `quote_comment`, `created_at`, `updated_at`, ],
                    //         include: [{
                    //             model: db.users,
                    //             attributes: ['name', 'id', 'image'],
                    //             as: "subquoteCommentSenderDetail"
                    //         }],
                    //     },
                    // ],
             //    }, ],


            })
           
            const form = {
                profile,
                profile_images,
                qotes,
            }
            return helper.success(res, "My form profile", form)
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>", error);
        }
    },


    ////////////transporter side  get profile////////////////////////
    get_transporter_profile: async (req, res) => {
        try {
            const find_login_user_profie = await db.users.findOne({
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt', 'dobtimestamp', 'otp', 'type', 'deviceType', "deviceToken", 'social_type', 'social_id', ]
                },
                where: {
                    id: req.auth.id
                },
                raw: true

            })
            return helper.success(res, "Social login successfully", {
                find_login_user_profie
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>", error);
            return helper.error(res, error);
        }

    },

    edit_transporter_profile: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                country: req.body.country,
                front_lic: req.files && req.files.front_lic,
                back_lic: req.files && req.files.back_lic,
                insurance_file: req.files && req.files.insurance_file,
                company: req.body.company,
                coverage: req.body.coverage,
                image: req.files && req.files.image


            };
            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (req.files && req.files.front_lic) {
                const image = helper.fileUpload(req.files.front_lic, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = image
            }
            if (req.files && req.files.back_lic) {
                const images = helper.fileUpload(req.files.back_lic, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = images
            }
            if (req.files && req.files.insurance_file) {
                const images = helper.fileUpload(req.files.insurance_file, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = images
            }
            if (req.files && req.files.image) {
                const images = helper.fileUpload(req.files.image, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = images
            }
            const edit_transporter_profile = await db.users.update({
                ...getdata
            }, {
                where: {
                    id: req.auth.id
                }
            })
            return helper.success(res, "Edit Profile successfully", {
                edit_transporter_profile
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>", error)
            helper.error(res, error);


        }
    },
    add_transporter_account: async (req, res) => {
        try {
            const required = {
                bank_name: req.body.bank_name,
                bank_account: req.body.bank_account,
                routing_number: req.body.routing_number,
                holder_name: req.body.holder_name,
                confirm_bank_account: req.body.confirm_bank_account
            };
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)

            if (getdata.bank_account != getdata.confirm_bank_account) {
                throw 'May be Your bank account number and confirm_bank_account not same ';
            }
            const add_accounts = await db.transporter_accounts.create({
                transpoter_id: req.auth.id,
                bank_name: getdata.bank_name,
                bank_account: getdata.bank_account,
                rout_number: getdata.routing_number,
                holder_name: getdata.holder_name,
                status: 1

            })
            return helper.success(res, "Your Account added successfully", {
                add_accounts
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>", error);
            helper.error(res, error);
        }
    },
    get_transporter_account: async (req, res) => {
        try {

            const find_transporter_account = await db.transporter_accounts.findAll({
                where: {
                    transpoter_id: req.auth.id,
                }
            })

            return helper.success(res, "my Accounts", {
                find_transporter_account
            })

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>", error)
            return helper.error(error)


        }
    },
    destroy_transporter_account: async (req, res) => {
        try {
            const required = {
                id: req.body.id
            };
            const nonRequired = {};

            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (getdata.id) {
                await db.transporter_accounts.destroy({
                    where: {
                        id: getdata.id
                    }

                })
            }
            return helper.success(res, "Your  Account deleted")

        } catch (error) {
            return helper.error(res, error);
        }
    },
    default_bank_account: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>", req.auth.id);
        try {
            const required = {
                account_id: req.body.account_id,

            }
            const nonRequired = {}

            console.log(req.body)

            const requestdata = await helper.vaildObject(required, nonRequired, res)
            var finduser_account = await db.transporter_accounts.update({
                status: 1
            }, {
                where: {
                    id: requestdata.account_id
                }
            })


            var find_user = await db.transporter_accounts.findOne({
                where: {
                    id: requestdata.account_id
                }
            })



            if (find_user.status == 1) {
                var card = await db.transporter_accounts.update({
                    status: 2
                }, {
                    where: {
                        transpoter_id: req.auth.id,
                        id: {
                            [Op.ne]: requestdata.account_id,
                        }
                    }
                });
            }


            return helper.success(res, 'Account Set Successfully');

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error);


        }
    },
    transporter_wallet: async (req, res) => {
        try {
            let withdraw_amount = await db.payments.findAll({
                attributes: [
                    `transporter_id`,
                    [Sequelize.fn('sum', Sequelize.col('transporter_amount')), 'withdrawamount'],
                ],
                where: {
                    transporter_id: req.auth.id,

                    withdraw_status: 0,
                    type: 1
                },
                raw: true

            })
            var withdraw_amounts = await db.payments.findAll({
                attributes: [
                    `transporter_id`,
                    [Sequelize.fn('sum', Sequelize.col('transporter_amount')), 'withdrawamount2'],
                ],
                where: {
                    transporter_id: req.auth.id,
                    withdraw_status: 1,
                    type: 2
                },
                raw: true

            })

            var total_amounts = withdraw_amount[0].withdrawamount - withdraw_amounts[0].withdrawamount2
            my_balance = {
                transporter_id: withdraw_amounts.transporter_id,
                total_amounts: total_amounts
            }


            return helper.success(res, 'my wallet', my_balance);
        } catch (error) {
            helper.error(res, error);

        }
    },
    withdraw_amount: async (req, res) => {
        try {
            const required = {
                bank_id: req.body.bank_id,
                transporter_amount: req.body.amount,
            };
            const nonRequired = {
                transporter_id: req.auth.id,
                user_id: req.auth.id,
                type: 2
            };
            const requestdata = await helper.vaildObject(required, nonRequired, res)
            var my_withdraw_req = await db.payments.create(requestdata)

            var status = await db.payments.findOne({
                where: {
                    id: my_withdraw_req.id
                }
            })
            return helper.success(res, "Withdraw request send successfully", status)
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error);


        }
    },
    transaction_history: async (req, res) => {
        try {
            var withdraw = await db.payments.findAll({
                where: {
                    withdraw_status: 0,
                    type: 2,
                    transporter_id: req.auth.id
                },
                raw: true,
                attributes: ['id']
            });
            const notInData = withdraw.map(i => i.id);
            var transactions = await db.payments.findAll({
                attributes: [`id`, `car_id`, `user_id`, `card_id`, `transporter_fee`, `transporter_amount`, `transporter_id`, `item_code`, `created_at`, `updated_at`, `is_payment`, `bank_id`, `withdraw_status`, `type`,
                    [Sequelize.literal('(SELECT  name FROM users where users.id=payments.user_id )'), 'userName'],
                ],
                where: {
                    id: {
                        [Op.notIn]: notInData
                    },
                    transporter_id: req.auth.id
                },
                order: [
                    ['id', 'DESC'],
                ],
                raw: true
            })

            return helper.success(res, "", transactions)
        } catch (error) {}
    },
    update_transporter_account: async (req, res) => {
        try {
            const required = {
                id: req.body.id,
                bank_name: req.body.bank_name,
                bank_account: req.body.bank_account,
                routing_number: req.body.routing_number,
                holder_name: req.body.routing_number,
                confirm_bank_account: req.body.confirm_bank_account
            };
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)

            if (getdata.bank_account != getdata.confirm_bank_account) {
                throw 'May be Your bank Account number and confirm_bank_Account not same ';
            }
            const update_accounts = await db.transporter_accounts.update({

                bank_name: getdata.bank_name,
                bank_account: getdata.bank_account,
                rout_number: getdata.routing_number,
                holder_name: getdata.holder_name,
                status: 2
            }, {
                where: {
                    id: getdata.id
                }

            })
            return helper.success(res, "Your Account updated  successfully", {
                update_accounts
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>", error);
            helper.error(res, error);
        }
    },
    licence_transporter: async (req, res) => {
        try {
            const required = {

                front_lic: req.files && req.files.front_lic,
                back_lic: req.files && req.files.back_lic,
            };
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (req.files && req.files.front_lic) {
                const image = helper.fileUpload(req.files.front_lic, 'images')
                console.log(image, '======================++!!!!')
                getdata.images = image
            }
            if (req.files && req.files.back_lic) {
                const images = helper.fileUpload(req.files.back_lic, 'images')
                console.log(image, '======================++!!!!')
                getdata.image = images
            }

            const update_accounts = await db.users.update({
                d_licence_front_image: getdata.images,
                d_licence_backs_image: getdata.image

            }, {
                where: {
                    id: req.auth.id
                }

            })
            return helper.success(res, "Your Account updated  successfully", {
                update_accounts
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>", error);
            return helper.error(res, error);
        }
    },
    insurance_transporter: async (req, res) => {
        try {
            const required = {

                company: req.body.company,
                coverage: req.body.coverage,

            };
            const nonRequired = {
                insurance_file: req.files && req.files.insurance_file,
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (req.files && req.files.insurance_file) {
                const image = helper.fileUpload(req.files.insurance_file, 'images')
                console.log(image, '======================++!!!!')
                getdata.imagess = image
            }


            const add_insurance = await db.users.update({
                insurance_file: getdata.imagess,
                insurance_company: getdata.company,
                level_coverage: getdata.coverage

            }, {
                where: {
                    id: req.auth.id
                }

            })
            return helper.success(res, "Insurance detail Added successfully", {
                add_insurance
            })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>", error);
            return helper.error(res, error);
        }
    },
    ///////////////////////transpoter side booking requests//////////////////////////
    history: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)



            var my_history = await db.car_details.findAll({
                attributes: [`id`, `type`, `preference_id`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `other_category`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                    [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                ],
                where: {
                    [Op.and]: [{
                            transporter_id: req.auth.id
                        },
                        {
                            start_end_bookings: 4
                        }

                    ]
                },
                include: [{
                        model: db.bookings,

                    },
                    {
                        model: db.carring_images,

                    }, {
                        model: db.users,
                        as: "userName"
                    }
                ]

            })
            return helper.success(res, "My History", my_history)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    start_jobs: async (req, res) => {
        try {
            const required = {
                start: req.body.start,
                id: req.body.id

            };
            const nonRequired = {};

            const getdata = await helper.vaildObject(required, nonRequired, res)

            if (getdata.start == 3) {
                var start_job = await db.car_details.update({
                    start_end_bookings: getdata.start,
                }, {
                    where: {
                        id: req.body.id

                    }
                })
                var car_id = await db.car_details.findOne({
                    where: {
                        id: req.body.id
                    }
                })

                var transporter_name = await db.users.findOne({
                    where: {
                        id: car_id.transporter_id
                    }
                })
                var comment = transporter_name.name + " has started the job"
                var going_notifiactons = await db.push_notifications.create({
                    sender_id: req.auth.id,
                    recevier_Id: car_id.user_id,
                    notification_type: 6,
                    comment: comment,

                })
                var user1data = await helper.get_user_data(req.auth.id)
                var userdata = await helper.get_user_data(car_id.user_id);
                if (userdata.notification_status == 1) {
                    let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 6);
                }
            }
            if (getdata.start == 4) {
                var data = await db.car_details.update({
                    start_end_bookings: getdata.start,
                }, {
                    where: {
                        id: getdata.id
                    }
                })
                var car_id = await db.car_details.findOne({
                    where: {
                        id: req.body.id
                    }
                })

                var transporter_name = await db.users.findOne({
                    where: {
                        id: car_id.transporter_id
                    }
                })
                var comment = transporter_name.name + " completed the job"

                var going_notifiactons = await db.push_notifications.create({
                    sender_id: req.auth.id,
                    recevier_Id: car_id.user_id,
                    notification_type: 3,
                    comment: comment
                })

                var user1data = await helper.get_user_data(req.auth.id)
                var userdata = await helper.get_user_data(car_id.user_id);
                if (userdata.notification_status == 1) {
                    let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 3);
                }

                return helper.success(res, "MY Job Completed Now")
            }
            return helper.success(res, "My Job Started Now")
        } catch (error) {
            return helper.error(res, error);
        }

    },
    transporter_job: async (req, res) => { ///old
        try {

            const required = {};
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)

            const my_history = await db.car_details.findAll({
                attributes: [`id`, `type`, `preference_id`, `start_end_bookings`, `booking_id`, `user_id`, `car_name`, `car_weight`, `car_model`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                    [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                ],
                where: {
                    [Op.and]: [{
                            transporter_id: req.auth.id
                        },
                        {
                            status: 1
                        }
                    ],
                    start_end_bookings: {
                        [Op.not]: 4
                    }

                },
                order: [
                    ['id', "DESC"]
                ],
                include: [{
                        model: db.bookings,

                    },
                    {
                        model: db.carring_images,

                    }, {
                        model: db.users,
                        as: "userName"
                    },
                ]
            })
            return helper.success(res, "My History", my_history)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    cuurent_my_history: async (req, res) => { //////////new
        try {
            var my_offer_req = await db.offers_from_transporter.findAll({
                attributes: [`id`, `booking_id`, `userid`, `preference_id`, `car_id`, `transporter_id`, `status_offer`, `booking_price`, `comment`, `created_at`, `updated_at`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=offers_from_transporter.preference_id )'), 'PrefrenceName'],
                    [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=offers_from_transporter.preference_id )'), 'PrefrenceImage'],
                    [Sequelize.literal(`ifnull((SELECT AVG(ratings) FROM ratings WHERE transporter_id = ${req.auth.id}), 0)`), 'avgRating'],
                    [Sequelize.literal(`(SELECT image FROM users where id=${req.auth.id} )`), 'TransporterImage'],
                    [Sequelize.literal(`(SELECT name FROM users where id=${req.auth.id} )`), 'TransporterName'],
                    //  [Sequelize.literal(`(SELECT image FROM users where offers_from_transporter.transporter_id=${req.auth.id})`),'transporterImage']

                    //  [Sequelize.literal('(SELECT  is_payment FROM payments where payments.car_id=car_details.id )'), 'is_payments',],
                ],

                where: {
                    transporter_id: req.auth.id,
                    status_offer: 0
                },
                order: [
                    ['id', "DESC"]
                ],
                include: [{
                        model: db.bookings,

                    },
                    {
                        model: db.carring_images,

                    }, {
                        model: db.users
                    }, {
                        model: db.car_details
                    },
                ]

            })
            return helper.success(res, "My History", my_offer_req)
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>", error);
        }
    },
    carrying_prefrence: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {
                category_id: req.body.category_id,
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)

            let array_category = await getdata.category_id.split(",")

            var jjdddddjdjd = []
            var jdjdjdjd = array_category.map(data => {
                console.log(data);
                jjdddddjdjd.push({
                    transpoterid: req.auth.id,
                    category_id: data
                })
                return data
            })
            let add_prefrence = await db.carring_prefrence_fiilter.bulkCreate(jjdddddjdjd);
            return helper.success(res, "Prefrence add ", add_prefrence)
        } catch (error) {
            return helper.error(res, error);

        }


    },
    booking_req_For_transporter: async (req, res) => {
        try {
            console.log(req.auth, '=asgdjkhadahdjkhajkdajksdhjkahdjkasdjkasdjkhadjkasjkjk')
            const required = {};
            const nonRequired = {};

            const getdata = await helper.vaildObject(required, nonRequired, res)

            const fillter_jobs = await db.prefrence.findOne({
                attributes: [`id`, `transporter_id`, `category`, `from_location_name`, `to_location_name`, `created_at`, `updated_at`, `from_latitude`, `from_longitude`, `to_latitude`, `to_longitude`, `miles`

                ],
                where: {
                    transporter_id: req.auth.id
                },
                raw: true
            })

            if (fillter_jobs) {
                if (fillter_jobs.to_latitude == "" && fillter_jobs.to_longitude == "") {
                    var result = fillter_jobs.category.split(',')
                    var numberArray = [];
                    length = result.length;
                    for (var i = 0; i < length; i++)
                        numberArray.push(parseInt(result[i]));

                    var my_jobs_data = await db.car_details.findAll({
                        attributes: [`id`, `type`, `preference_id`, `from_lat`, `from_log`, `to_lat`, `to_log`, `start_end_bookings`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                            [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                            [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                            [
                                Sequelize.literal(
                                    `round(
                                  ( 6371 * acos( least(1.0,
                                    cos( radians(${ fillter_jobs.from_latitude}) )
                                    * cos( radians(\`car_details\`.\`from_lat\`) )
                                    * cos( radians(\`car_details\`.\`from_log\`) - radians(${ fillter_jobs.from_longitude}) )
                                    + sin( radians(${fillter_jobs.from_latitude}) )
                                    * sin( radians(\`car_details\`.\`from_lat\`)
                                  ) ) )
                                ), 1)`
                                ),
                                "distance"
                            ],

                        ],
                        where: {
                            status: 0,
                            preference_id: numberArray,

                        },
                        having: {
                            distance: {
                                [Op.lte]: fillter_jobs.miles
                            },

                        },
                        order: [
                            ['id', "DESC"]
                        ],
                        include: [{
                                model: db.bookings,
                            },
                            {
                                model: db.carring_images,
                            },
                            {
                                model: db.offers_from_transporter,
                                attributes: ['id', 'comment', 'booking_id', 'userid', 'preference_id', 'category_id', 'car_id', 'transporter_id', 'booking_price', 'status_offer',
                                    [Sequelize.literal('ROUND(IFNULL((select AVG(ratings) from ratings where ratings.transporter_id = offers_from_transporters.transporter_id),0),1)'), 'avgRating1'],
                                    [Sequelize.literal('IFNULL((select name from users where users.id = offers_from_transporters.transporter_id),"")'), 'name'],
                                    [Sequelize.literal('IFNULL((select email from users where users.id = offers_from_transporters.transporter_id),"")'), 'email'],
                                    [Sequelize.literal('IFNULL((select image from users where users.id = offers_from_transporters.transporter_id),"")'), 'image'],


                                ],
                                required: false,
                                // include: [{
                                //     model: db.quote_comment,
                                //     attributes: ['id', 'post_id',  'quote_comment', 'senderId', 'receiverId', 'type', 'created_at', 'updated_at', ],
    
                                //     include: [{
                                //             model: db.users,
                                //             attributes: ['name', 'id', 'image'],
                                //             as: "quoteCommentSenderDetail"
                                //         },
                                //         {
                                //             model: db.quote_sub_comment,
                                //             attributes: [`id`, `quote_comment_id`, `post_id`, `senderId`, `receiverId`, `sub_type`, `created_at`, `updated_at`, `quote_comment`, `created_at`, `updated_at`, ],
                                //             include: [{
                                //                 model: db.users,
                                //                 attributes: ['name', 'id', 'image'],
                                //                 as: "subquoteCommentSenderDetail"
                                //             }],
                                //         },
                                //     ],
                                // }, ],

                            },
                        ]
                    })
                } else {
                    var result = fillter_jobs.category.split(',')
                    var numberArray = [];
                    length = result.length;
                    for (var i = 0; i < length; i++)
                        numberArray.push(parseInt(result[i]));
                    var my_jobs_data = await db.car_details.findAll({
                        attributes: [`id`, `type`, `preference_id`, `from_lat`, `from_log`, `to_lat`, `to_log`, `start_end_bookings`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                            [Sequelize.literal('(SELECT prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                            [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],
                            [
                                Sequelize.literal(
                                    `round(
                                  ( 6371 * acos( least(1.0,
                                    cos( radians(${ fillter_jobs.from_latitude}) )
                                    * cos( radians(\`car_details\`.\`from_lat\`) )
                                    * cos( radians(\`car_details\`.\`from_log\`) - radians(${ fillter_jobs.from_longitude}) )
                                    + sin( radians(${fillter_jobs.from_latitude}) )
                                    * sin( radians(\`car_details\`.\`from_lat\`)
                                  ) ) )
                                ), 1)`
                                ),
                                "distance"
                            ],
                            [
                                Sequelize.literal(
                                    `round(
                                  ( 6371 * acos( least(1.0,
                                    cos( radians(${ fillter_jobs.to_latitude}) )
                                    * cos( radians(\`car_details\`.\`to_lat\`) )
                                    * cos( radians(\`car_details\`.\`to_log\`) - radians(${ fillter_jobs.to_longitude}) )
                                    + sin( radians(${fillter_jobs.to_latitude}) )
                                    * sin( radians(\`car_details\`.\`to_lat\`)
                                  ) ) )
                                ), 1)`
                                ),
                                "distance2"
                            ]
                        ],
                        where: {
                            status: 0,
                            preference_id: numberArray,
                        },
                        having: {
                            distance: {
                                [Op.lte]: fillter_jobs.miles
                            },
                            distance2: {
                                [Op.lte]: fillter_jobs.miles
                            }
                        },
                        order: [
                            ['id', "DESC"]
                        ],
                        include: [{
                                model: db.bookings,
                            },
                            {
                                model: db.carring_images,
                            },
                            {
                                model: db.offers_from_transporter,
                                attributes: ['id', 'comment', 'booking_id', 'userid', 'preference_id', 'category_id', 'car_id', 'transporter_id', 'booking_price', 'status_offer',
                                    [Sequelize.literal('ROUND(IFNULL((select AVG(ratings) from ratings where ratings.transporter_id = offers_from_transporters.transporter_id),0),1)'), 'avgRating1'],
                                    [Sequelize.literal('IFNULL((select name from users where users.id = offers_from_transporters.transporter_id),"")'), 'name'],
                                    [Sequelize.literal('IFNULL((select email from users where users.id = offers_from_transporters.transporter_id),"")'), 'email'],
                                    [Sequelize.literal('IFNULL((select image from users where users.id = offers_from_transporters.transporter_id),"")'), 'image'],
                                ],

                                required: false,
                                // include: [{
                                //     model: db.quote_comment,
                                //     attributes: ['id', 'post_id', 'quote_comment', 'senderId', 'receiverId', 'type', 'created_at', 'updated_at', ],
    
                                //     include: [{
                                //             model: db.users,
                                //             attributes: ['name', 'id', 'image'],
                                //             as: "quoteCommentSenderDetail"
                                //         },
                                //         {
                                //             model: db.quote_sub_comment,
                                //             attributes: [`id`, `quote_comment_id`, `post_id`, `senderId`, `receiverId`, `sub_type`, `created_at`, `updated_at`, `quote_comment`, `created_at`, `updated_at`, ],
                                //             include: [{
                                //                 model: db.users,
                                //                 attributes: ['name', 'id', 'image'],
                                //                 as: "subquoteCommentSenderDetail"
                                //             }],
                                //         },
                                //     ],
                                // }, ],
                            },
                        ]
                    })
                }
                return helper.success(res, "Jobs ", my_jobs_data)
            } else {
                var my_jobs_data = await db.car_details.findAll({
                    attributes: [`id`, `type`, `preference_id`, `start_end_bookings`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `other_category`, `transporter_id`, `status`, `booking_price`, `comment`, `created_at`, `updated_at`,
                        [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                        [Sequelize.literal('(SELECT  image FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceImage'],

                    ],
                    where: {
                        status: 0,
                        start_end_bookings: 0

                    },
                    order: [
                        ['id', "DESC"]
                    ],
                    include: [{
                            model: db.bookings,

                        },
                        {
                            model: db.carring_images,
                        },
                        {
                            model: db.offers_from_transporter,
                            attributes: ['id', 'comment', 'booking_id', 'userid', 'preference_id', 'category_id', 'car_id', 'transporter_id', 'booking_price', 'status_offer',
                                [Sequelize.literal('ROUND(IFNULL((select AVG(ratings) from ratings where ratings.transporter_id = offers_from_transporters.transporter_id),0),1)'), 'avgRating1'],
                                [Sequelize.literal('IFNULL((select name from users where users.id = offers_from_transporters.transporter_id),"")'), 'name'],
                                [Sequelize.literal('IFNULL((select email from users where users.id = offers_from_transporters.transporter_id),"")'), 'email'],
                                [Sequelize.literal('IFNULL((select image from users where users.id = offers_from_transporters.transporter_id),"")'), 'image'],


                            ],
                            required: false,
                            // include: [{
                            //     model: db.quote_comment,
                            //     attributes: ['id', 'post_id', 'quote_comment', 'senderId', 'receiverId', 'type', 'created_at', 'updated_at', ],

                            //     include: [{
                            //             model: db.users,
                            //             attributes: ['name', 'id', 'image'],
                            //             as: "quoteCommentSenderDetail"
                            //         },
                            //         {
                            //             model: db.quote_sub_comment,
                            //             attributes: [`id`, `quote_comment_id`, `post_id`, `senderId`, `receiverId`, `sub_type`, `created_at`, `updated_at`, `quote_comment`, `created_at`, `updated_at`, ],
                            //             include: [{
                            //                 model: db.users,
                            //                 attributes: ['name', 'id', 'image'],
                            //                 as: "subquoteCommentSenderDetail"
                            //             }],
                            //         },
                            //     ],
                            // }, ],
                        },
                    ]
                })
                return helper.success(res, "Jobs ", my_jobs_data)
            }
        } catch (error) {
            console.log(">>>>>>>>>......",error);
            
            return helper.error(res, error);

        }
    },

    profile_job: async (req, res) => {
        try {
            const required = {
                id: req.body.id

            };
            const nonRequired = {};

            const getdata = await helper.vaildObject(required, nonRequired, res)

            var job_profile = await db.car_details.findOne({
                where: {
                    id: getdata.id,
                },
                include: [{
                        model: db.bookings,
                        required: true
                    },

                ],
                raw: true

            })

            var _images = await db.carring_images.findAll({
                where: {
                    booking_id: getdata.id, ////car_d
                },
                raw: true
            })
            var coming_jobs = _images.concat(job_profile)
            return helper.success(res, "All Jobs ", coming_jobs)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    QoteFrom_transporter: async (req, res) => {
        try {
            const required = {
                id: req.body.id,
                booking_id: req.body.booking_id,
                userid: req.body.userid,
                booking_price: req.body.booking_price,
                preference_id: req.body.preference_id
            };
            const nonRequired = {
                comment: req.body.comment,
            };

            const getdata = await helper.vaildObject(required, nonRequired, res)
            var offer_for_user = await db.offers_from_transporter.create({
                car_id: getdata.id,
                preference_id: req.body.preference_id,
                booking_id: getdata.booking_id,
                userid: getdata.userid,
                transporter_id: req.auth.id,
                comment: getdata.comment,
                booking_price: getdata.booking_price,
                wid_status:1
            })


            // if (getdata.comment.length > 0) {
            //     const commnet_create = await db.quote_comment.create({
            //         quote_id: offer_for_user.dataValues.id,
            //         quote_comment: getdata.comment,
            //         senderId: req.auth.id,
            //         receiverId: req.body.userid,
            //         type: 1,
            //         post_id: getdata.id

            //     })
            // }

            var find_offers = await db.offers_from_transporter.findAll({
                where: {
                    car_id: req.body.id,
                },
                raw: true
            })
            for (let x in find_offers) {
                if (getdata.booking_price < find_offers[x].booking_price) {
                    var request_name = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        }
                    })
                    commission = getdata.booking_price * 0.15

                    console.log("11111111111111111111111111111111111111111111111111111111111111111111", commission);

                    price = parseInt(getdata.booking_price);
                    var paymentss = commission + price;

                    // var comment = request_name.name + " " + "placed a lower quote € " + paymentss
                    var comment = "Another Transporter has placed a lower quote on job"
                    var notifiactons = await db.push_notifications.create({
                        sender_id: req.auth.id,
                        recevier_Id: getdata.userid,
                        notification_type: 10,
                        comment: comment
                    })
                    var user1data = await helper.get_user_data(req.auth.id)
                    var userdata = await helper.get_user_data(getdata.userid);

                    if (userdata.notification_status == 1) {
                        let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 10);
                    }
                    return helper.success(res, "Your offer Submited", offer_for_user)
                } else {
                    var request_name = await db.users.findOne({
                        where: {
                            id: req.auth.id
                        }
                    })
                    commission = getdata.booking_price * 0.15

                    console.log("11111111111111111111111111111111111111111111111111111111111111111111", commission);

                    price = parseInt(getdata.booking_price);

                    var paymentsss = commission + price;
                    var comment = request_name.name + " " + "placed a quote €" + paymentsss
                    var notifiactons = await db.push_notifications.create({
                        sender_id: req.auth.id,
                        recevier_Id: getdata.userid,
                        notification_type: 4,
                        comment: comment
                    })
                    var user1data = await helper.get_user_data(req.auth.id)
                    var userdata = await helper.get_user_data(getdata.userid);

                    if (userdata.notification_status == 1) {
                        let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 4);
                    }
                    return helper.success(res, "Your offer Submited", offer_for_user)
                }
            }
        } catch (error) {
            return helper.error(res, error);
        }
    },

    tracking_status: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {
                status: req.body.status,
                notification_status: req.body.notification_status
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)
            const track_status = await db.users.update({
                track_status: getdata.status,
                notification_status: getdata.notification_status
            }, {
                where: {
                    id: req.auth.id
                }
            })
            return helper.success(res, " Status updated", track_status)
        } catch (error) {
            return helper.error(res, error);


        }

    },
    get_track_status: async (req, res) => {
        try {
            const coming_status = await db.users.findOne({
                attributes: [`notification_status`, `track_status`],
                where: {
                    id: req.auth.id,
                }
            })
            return helper.success(res, "track Status and notification Status", coming_status)

        } catch (error) {
            return helper.error(res, error);

        }
    },
    transporter_notification: async (req, res) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", req.auth.id)
        try {
            const _notification = await db.push_notifications.findAll({
                where: {
                    recevier_Id: req.auth.id
                }
            })
            var view_offers = await db.push_notifications.update({
                read_unread: 0,
            }, {
                where: {
                    recevier_Id: req.auth.id
                }
            })

            return helper.success(res, "notifications", _notification)


        } catch (error) {
            return helper.error(res, error)

        }
    },

    /////////userside ///////////////
    accept_qotes: async (req, res) => {
        try {
            const required = {
                id: req.body.id,
                car_id: req.body.car_id,
                status: req.body.status,
                transporter_id: req.body.transporter_id,

            };
            const nonRequired = {};
            const getdata = await helper.vaildObject(required, nonRequired, res)
            if (getdata.status == 1) {
                var view_offers = await db.offers_from_transporter.update({
                    status_offer: getdata.status,
                }, {
                    where: {
                        id: getdata.id
                    }
                })
                const find_booking_id = await db.offers_from_transporter.findOne({
                    where: {
                        id: req.body.id,
                    },
                    raw: true
                })
                var create = await db.car_details.update({
                    transporter_id: find_booking_id.transporter_id,
                    booking_price: find_booking_id.booking_price,
                    comment: find_booking_id.comment,
                    status: find_booking_id.status_offer,

                }, {
                    where: {
                        id: find_booking_id.car_id

                    }
                })
                var request_name = await db.users.findOne({
                    where: {
                        id: req.auth.id,
                    },
                    raw: true
                })
                var comment = request_name.name + " " + "has accepted your job quote"
                var notifiactons = await db.push_notifications.create({
                    sender_id: req.auth.id,
                    recevier_Id: getdata.transporter_id,
                    notification_type: 1,
                    comment: comment
                })
                var user1data = await helper.get_user_data(req.auth.id)
                var userdata = await helper.get_user_data(getdata.transporter_id);
                if (userdata.notification_status == 1) {
                    let sendpush = await helper.send_push_notification(comment, userdata.deviceToken, userdata.deviceType, user1data.id, user1data.name, user1data.image, 1);
                }
            }
            if (getdata.status == 2) {
                await db.offers_from_transporter.destroy({
                    where: {
                        id: getdata.id
                    }
                })

                return helper.success(res, "Offer rejected", {})
            }
            return helper.success(res, "Offer accepted", view_offers)
        } catch (error) {
            return helper.error(res, error);

        }
    },
    payments: async (req, res) => {
        try {
            const required = {
                car_id: req.body.car_id,
                transporter_fee: req.body.transporter_fee,
                card_id: req.body.card_id,
                transporter_id: req.body.transporter_id,
                user_id: req.auth.id,
                admin_commission: req.body.admin_commission,
                is_payment: 1,
                type: 1
            };

            function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
                return result;
            }
            var rString = randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
            required.item_code = rString
            const nonRequired = {
                cvv: req.body.cvv,
            };
            const getdata = await helper.vaildObject(required, nonRequired, res)

            var amount = Number(getdata.transporter_fee) - Number(getdata.admin_commission);



            const id_find = await db.cards.findOne({
                where: {
                    id: getdata.card_id
                }
            })
            getdata.transporter_amount = amount
            var payment = await db.payments.create(getdata)
            return helper.success(res, "Payment Done", payment)
        } catch (error) {
            return helper.error(res, error);
        }
    },
    userpaymnet: async (req, res) => {
        try {
            const All_payments = await db.payments.findAll({
                where: {
                    user_id: req.auth.id,
                    type: 1,
                    is_payment: 1
                }

            })

            return helper.success(res, "All Payments", All_payments)

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>", error);

        }

    },
    find_payments: async (req, res) => {
        try {
            const required = {
                payment_id: req.body.payment_id
            };
            const nonRequired = {}
            const getdata = await helper.vaildObject(required, nonRequired, res)

            const payment_detail = await db.payments.findOne({
                where: {
                    id: getdata.payment_id
                }
            })
            var profile = await db.car_details.findOne({
                attributes: [`id`, `type`, `preference_id`, `booking_id`, `user_id`, `car_name`, `car_model`, `car_weight`, `furniture_height`, `furniture_width`, `furniture_weight`, `tittle`, `height`, `width`, `weight`, `optional_detail`, `bike_name`, `bike_model`, `bike_weight`, `created_at`, `updated_at`, `transporter_id`, `status`, `booking_price`, `start_end_bookings`, `comment`, `start_date`, `end_date`, `from_lat`, `from_log`, `to_lat`, `to_log`,
                    [Sequelize.literal('(SELECT  prefrence FROM carrying_preference where carrying_preference.id=car_details.preference_id )'), 'PrefrenceName'],
                ],
                where: {
                    id: payment_detail.car_id,
                },
                include: {
                    model: db.bookings,
                    required: true
                },
                raw: true

            })

            var profile_images = await db.carring_images.findAll({
                where: {
                    car_id: profile.id,
                },
                raw: true
            })

            


            var transporter = await db.users.findOne({
                attributes: ["id", "name", "image", "track_status", "notification_status",
                    [Sequelize.literal('ifnull((SELECT AVG(ratings) FROM ratings WHERE transporter_id = users.id), 0)'), 'avgRating'],
                ],
                where: {
                    id: profile.transporter_id,
                },
                raw: true
            })

        console.log(transporter,'===========transporter==========');
        

            let html = `<!DOCTYPE html>
            <html>
            
            <head>
               <title>Website</title>
               <meta charset="utf-8">
               <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;700&display=swap"
                  rel="stylesheet">
              
            </head>
              <body style="font-family: 'Poppins', sans-serif;box-sizing: border-box;margin: 10px auto;width: 100%;padding: 10px;border: 1px solid #ddd;border-radius: 5px;">
            <h4 style="font-size: 22px;text-align: center;margin-top: 10px;margin-bottom: 20px;"> DELIVERY RECEIPT</h4>
               <div class="pdf" style="background: #f6f6f6;padding: 10px;box-sizing: border-box;margin-bottom: 20px;border-radius: 10px;">
                  <h3 style="margin: 0px;"> Collection From:</h3>
                  <p style="margin-top: 3px;margin-bottom: 9px;">  ${profile["booking.from_street_adress"]} <br>
                     Phone Number: ${profile["booking.from_country_code"]} - ${profile["booking.from_number"]}
                  </p>
               </div>
               <div class="pdf" style="background: #f6f6f6;padding: 10px;box-sizing: border-box;margin-bottom: 20px;border-radius: 10px;">
                  <h3 style="margin: 0px;"> Delivery To:</h3>
                  <p style="margin-top: 3px;margin-bottom: 9px;">  ${profile["booking.to_street_adress"]} <br>
                     Phone Number:${profile["booking.to_country_code"]} - ${profile["booking.to_number"]}
                  </p>
               </div>
               <div class="table_data" style="margin-bottom: 40px;">
                  <table style="width: 100%;border: 1px solid #ddd;padding: 10px;text-align: left;border-radius: 6px;">
                     <tbody><tr>
                        <th style="padding: 10px;"> Item Id</th>
                        <th style="padding: 10px;"> Item Description</th>
                        <th style="padding: 10px;">€ Balance to be paid</th>
                     </tr>
                     <tr>
                        <td style="background: #f9f9f9;padding: 10px;"> ${payment_detail.item_code}</td>
                        <td style="background: #f9f9f9;padding: 10px;"> ${profile.PrefrenceName}</td>
                        <td style="background: #f9f9f9;padding: 10px;">€ ${payment_detail.transporter_fee}</td>
                     </tr>
                  </tbody></table>
               </div>
               <div class="signs">
                  <h2 style="font-size: 20px;"> Collection Confirmation</h2>
                  <h4 style="text-align: right;margin-top: 40px;"> Signature</h4>
               </div>
               <div class="signs">
                  <h2 style="font-size: 20px;"> Delivery Confirmation</h2>
                  <h4 style="text-align: right;margin-top: 40px;"> Signature</h4>
               </div>
                       
            </body>
            </html>`
            const options = {
                "format": "Letter",
                "orientation": "portrait",
            }
            var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
            var result = "";
            result = uuid();
            let name = result + '.' + 'pdf';
            var aa = await pdf.create(html, options).toFile(`./public/uploads/pdf/` + name, (err, ress) => {
                if (err) return console.log(err,'=======error pdf ======');
                let fil = 'https://app.transportedit.com/' + "/uploads/pdf/" + name;

                var paymentdetails = {
                    payment_detail,
                    profile ,
                    profile_images,
                    transporter
                }


                 final = {
                    paymentdetails,
                    fil
                }
                console.log("...........",res);
            
            return helper.success(res, "Payment Details", final);
            });
            

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>", error);

        }
    },

    notification_status: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {
                notification_status: req.body.notification_status
            }
            const getdata = await helper.vaildObject(required, nonRequired, res)

            const noti_status = await db.users.update({
                notification_status: getdata.notification_status
            }, {
                where: {
                    id: req.auth.id
                }

            })
            return helper.success(res, "Notification status Updated", noti_status)

        } catch (error) {
            return helper.error(res, error)
        }
    },
    get_notification_status: async (req, res) => {
        try {

            const user_notification_status = await db.users.findOne({
                attributes: ['notification_status'],
                where: {
                    id: req.auth.id
                }
            })

            return helper.success(res, "Notification status ", user_notification_status)
        } catch (error) {
            return helper.error(res, error)
        }

    },

    prefrence_save: async (req, res) => {
        try {
            const required = {};
            const nonRequired = {
                fillter_name: req.body.fillter_name,
                from_latitude: req.body.from_latitude,
                from_longitude: req.body.from_longitude,
                to_latitude: req.body.to_latitude,
                to_longitude: req.body.to_longitude,
                radius: req.body.radius,
                category_id: req.body.category_id,
                from_location_name: req.body.from_location_name,
                to_location_name: req.body.to_location_name
            }
            const getdata = await helper.vaildObject(required, nonRequired, res)
            var vickles = getdata.category_id.split(",")
            const get_prefrence_data = await db.prefrence.findOne({
                where: {
                    transporter_id: req.auth.id
                }
            })
            var prefrence_delete = await db.prefrence.destroy({
                where: {
                    transporter_id: req.auth.id
                }
            })
            var data = await db.prefrence.create({
                transporter_id: req.auth.id,
                category: req.body.category_id,
                from_latitude: getdata.from_latitude,
                from_longitude: getdata.from_longitude,
                to_latitude: getdata.to_latitude,
                to_longitude: getdata.to_longitude,
                miles: getdata.radius,
                fillter_name: req.body.fillter_name,
                from_location_name: req.body.from_location_name,
                to_location_name: req.body.to_location_name

            })
            return helper.success(res, "pefrence", data)
        } catch (error) {
            return helper.error(res, error)
        }
    },
    prefrence_delete: async (req, res) => {
        try {
            const get_prefrence_data = await db.prefrence.findAll({
                where: {
                    transporter_id: req.auth.id
                },
                raw: true

            })
            if (get_prefrence_data) {
                var clear_fillter = await db.prefrence.destroy({
                    where: {
                        transporter_id: req.auth.id
                    }
                })

            }
            return helper.success(res, 'Clear fillter')
        } catch (error) {
            return helper.error(res, error)

        }

    },

    get_prefrence: async (req, res) => {
        try {
            const yourPrefrence = await db.prefrence.findOne({
                where: {
                    userid: req.auth.id
                }
            })
            return helper.success(res, "Jobs According your preference", yourPrefrence)

        } catch (error) {
            return helper.error(res, error)
        }

    },
    user_notification: async (req, res) => {
        try {
            const _notifications = await db.push_notifications.findAll({
                where: {
                    recevier_Id: req.auth.id
                }
            })
            var view_offers = await db.push_notifications.update({
                read_unread: 0,
            }, {
                where: {
                    recevier_Id: req.auth.id
                }
            })
            return helper.success(res, "notifications", _notifications)
        } catch (error) {
            return helper.error(res, error)

        }
    },
    notification_count: async (req, res) => {

        try {
            const notifications_count = await db.push_notifications.count({
                where: {
                    recevier_Id: req.auth.id,
                    read_unread: 1
                }
            })

            return helper.success(res, "Get notifications count", notifications_count)
        } catch (error) {
            return helper.error(res, error)

        }
    },
    add_card: async function (req, res) {
        try {
            const required = {
                cardNumber: req.body.cardNumber,
                holderName: req.body.holderName,
                year: req.body.year,
                month: req.body.month,
                user_id: req.auth.id
            };
            const nonRequired = {
                cvv: req.body.cvv
            };

            let requestData = await helper.vaildObject(required, nonRequired, res);
            const now = moment().unix();
            const cardExpiry = moment(`${requestData.year}/${requestData.month}/01`, 'YYYY/MM/DD').unix();
            if (cardExpiry < now) throw 'Invalid Expiry'
            if (requestData.cardNumber.length != 16) throw "Card number should be 16 digits long"
            if (requestData.year.length != 4) throw "Year should be 4 digits long"
            if (requestData.month.length != 2) throw "Month should be 2 digits long"
            await stripe.tokens.create({
                    card: {
                        number: requestData.cardNumber,
                        exp_month: requestData.month,
                        exp_year: requestData.year,
                    }
                },
                async (err, token) => {
                    if (err) {
                        console.log("==============errerrerrerrerrerrerrerr================");

                        return helper.error(res, err.raw.message);
                    } else {
                        console.log(token)
                        let add_fav = await db.cards.create({
                            user_id: req.auth.id,
                            //   isDefault: requestData.isDefault,
                            holderName: requestData.holderName,
                            cardNumber: requestData.cardNumber,
                            month: requestData.month,
                            year: requestData.year
                        });
                        var add_card = await db.cards.findOne({
                            where: {
                                id: add_fav.id
                            },
                            raw: true
                        });
                        var cards = {
                            add_card,
                            token
                        }
                        var msg = "Add card successufully";
                        res.status(200).json({
                            success: 1,
                            code: 200,
                            msg: msg,
                            body: cards
                        });

                    }
                }
            );
        } catch (error) {
            console.log(error, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            return helper.error(res, error);

        }
    },
    cards_listing: async function (req, res) {
        try {
            my_cards = await db.cards.findAll({
                where: {
                    user_id: req.auth.id
                }
            })
            return helper.success(res, "Card add  Successfully", my_cards)

        } catch (error) {
            console.log(error, '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            return helper.error(res, error);
        }
    },

    delete_card: async (req, res) => {
            try {
            const required = {
                card_id: req.body.card_id
            }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired, res);

            var _card_findCarD_id = await db.cards.findOne({
                where: {
                    id: requestData.card_id,
                }

            })
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>..", _card_findCarD_id)
            if (_card_findCarD_id) {
                var cara_delete = await db.cards.destroy({
                    where: {
                        id: requestData.card_id,
                    }
                })
            } else {
                return helper.success(res, "invalid card")
            }
            return helper.success(res, "Card Deleted  Successfully")

        } catch (error) {
            return helper.error(res, error);
        }
    },

    default_card: async (req, res) => {
        try {
            required = {
                card_id: req.body.card_id,

            }
            nonRequired = {}

            console.log(req.body)

            const requestdata = await helper.vaildObject(required, nonRequired, res)
            var finduser_card = await db.cards.update({
                is_default: 1
            }, {
                where: {
                    id: requestdata.card_id
                }
            })
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>.", finduser_card);
            if (finduser_card) {
                var card = await db.cards.update({
                    is_default: 0
                }, {
                    where: {
                        user_id: req.auth.id,
                        id: {
                            [Op.ne]: requestdata.card_id,
                        }
                    }
                })
            }

            return helper.success(res, 'Cards Set successfully');
        } catch (error) {
            return helper.error(res, error);


        }

    },
    my_acoount_details: async (req, res) => {
        try {
            required = {
                card_id: req.body.card_id,
            }
            nonRequired = {}
            const requestdata = await helper.vaildObject(required, nonRequired, res)

            const my_card = await db.cards.findOne({
                where: {
                    id: requestdata.card_id
                }
            })
            return helper.success(res, 'Cards Set successfully', my_card);
        } catch (error) {
            return helper.error(res, error);


        }
    },
    update_card: async (req, res) => {

        try {
            var required = {
                card_id: req.body.card_id,
                cardNumber: req.body.cardNumber,
                holderName: req.body.holderName,
                year: req.body.year,
                month: req.body.month,
                user_id: req.auth.id

            };
            const nonRequired = {
                cvv: req.body.cvv
            };

            let requestData = await helper.vaildObject(required, nonRequired, res);
            console.log(">>>>>>>>>>asssssssssssssssssssssssssssss>>>>>>>>>>>>>>>>>", requestData)
            const now = moment().unix();
            const cardExpiry = moment(`${requestData.year}/${requestData.month}/01`, 'YYYY/MM/DD').unix();
            if (cardExpiry < now) throw 'Invalid Expiry'
            if (requestData.cardNumber.length != 16) throw "Card number should be 16 digits long"
            if (requestData.year.length != 4) throw "Year should be 4 digits long"
            if (requestData.month.length != 2) throw "Month should be 2 digits long"
            await stripe.tokens.create({
                    card: {
                        number: requestData.cardNumber,
                        exp_month: requestData.month,
                        exp_year: requestData.year,
                    }
                },

                async (err, token) => {
                    if (err) {
                        console.log("==============errerrerrerrerrerrerrerr================");
                        return helper.error(res, err.raw.message);
                    } else {
                        console.log(token)
                        let add_fav = await db.cards.update({
                            user_id: req.auth.id,
                            //   isDefault: requestData.isDefault,
                            holderName: requestData.holderName,
                            cardNumber: requestData.cardNumber,
                            month: requestData.month,
                            year: requestData.year
                        }, {
                            where: {
                                id: requestData.card_id

                            }

                        });
                        console.log(">>>>>>>>>>>>>>>>>>>>.", add_fav)
                        var updated_card = await db.cards.findOne({
                            where: {
                                id: requestData.card_id
                            },
                            raw: true
                        });
                        var msg = " Card Updated Successufully";
                        res.status(200).json({
                            success: 1,
                            code: 200,
                            msg: msg,
                            body: updated_card,

                        });
                    }
                }
            );
        } catch (error) {
            return helper.error(res, error);
        }
    },
    transporter_ratings: async (req, res) => {
        try {
            if (req.query.trans_id != null && req.query.trans_id != undefined) {

                var ratings_transporter = await db.ratings.findAll({
                    attributes: [`id`, `user_id`, `car_id`, `transporter_id`, `comment`, `created_at`, `updated_at`, `ratings`,
                        [Sequelize.literal(`ifnull((SELECT name FROM users WHERE user_id =users.id) , 0)`), 'UserName'],
                        [Sequelize.literal(`ifnull((SELECT image FROM users WHERE user_id =users.id) , 0)`), 'UserImage'],
                    ],
                    where: {
                        transporter_id: req.query.trans_id
                    },
                    raw: true
                })
            } else {
                var ratings_transporter = await db.ratings.findAll({
                    attributes: [`id`, `user_id`, `car_id`, `transporter_id`, `comment`, `created_at`, `updated_at`, `ratings`,
                        [Sequelize.literal(`ifnull((SELECT name FROM users WHERE user_id =users.id) , 0)`), 'UserName'],
                        [Sequelize.literal(`ifnull((SELECT image FROM users WHERE user_id =users.id) , 0)`), 'UserImage'],
                    ],

                    where: {
                        transporter_id: req.auth.id
                    },
                    raw: true

                })
            }
            return helper.success(res, 'Diver Get Ratings  successfully', ratings_transporter);
        } catch (error) {
            return helper.error(res, error)
        }
    },
    simple_quote_comment: async (req, res) => {
        try {
            const required = {
                // quote_id: req.body.quote_id,
                quote_comment: req.body.quote_comment,
                userid: req.body.userid,
                type: req.body.type,
                post_id: req.body.post_id,
                quote_id: req.body.quote_id

            }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired, res);


            var create_simple_comment = await db.quote_comment.create({
                // quote_id: req.body.quote_id,
                quote_comment: req.body.quote_comment,
                senderId: req.auth.id,
                receiverId : req.body.userid,
                type: req.body.type,
                post_id: req.body.post_id,
                quote_id: req.body.quote_id
            })

           
           
             return helper.success(res,"commnet done",create_simple_comment)
             } catch (error) {
            console.log(">>>>>>>...............",error);
            return helper.error(res, "error")

        }
    },
    reply_quote_comment: async (req, res) => {
        try {
            const required = {
                quote_comment_id: req.body.quote_comment_id, ////////////////id<====quote_comment
                quote_comment: req.body.quote_comment,
                userid: req.body.userid, ///////////////////receiver//////////
                sub_type: req.body.sub_type,
                post_id: req.body.post_id ///////////////id from car_deatils table ///////////////
            }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired, res);

            var create_reply_comment = await db.quote_sub_comment.create({
                quote_comment_id: req.body.quote_comment_id,
                senderId: req.auth.id, ////////////login_id////auth_id//////
                receiverId: req.body.userid, ///////////////////receiver//////////
                sub_type: req.body.sub_type,
                post_id: req.body.post_id,
                quote_comment: req.body.quote_comment
            })
            message ="Reply Done "
            return helper.success(res,message, create_reply_comment)
        } catch (error) {
            console.log(">......................", error);
            return helper.error(res, "error")

        }
    },


    get_comment: async (req, res) => {
        try {
            const required = {
                 post_id: req.body.post_id,
                 quote_id:req.body.quote_id
            }
            const nonRequired = {};
            let requestData = await helper.vaildObject(required, nonRequired, res);

            console.log('============requestData',requestData);
            // return
         
            var simple_comment = await db.quote_comment.findAll({
                attributes: {
                    include: [
                        [Sequelize.literal(`ifnull((SELECT name FROM users WHERE quote_comment.senderId =users.id) , 0)`), 'SenderName'],
                        [Sequelize.literal(`ifnull((SELECT image FROM users WHERE quote_comment.senderId =users.id) , 0)`), 'SenderImage'],
                        [Sequelize.literal(`ifnull((SELECT email FROM users WHERE quote_comment.senderId =users.id) , 0)`), 'senderEmail'],
                    ]
                },
                where:{
                   post_id:req.body.post_id,
                   quote_id:req.body.quote_id

               },
               order: [
                ['id', 'DESC'],
             ],

               include: [{
                model: db.quote_sub_comment,
                attributes: [`id`, `quote_comment_id`, `post_id`, `senderId`, `receiverId`, `sub_type`, `created_at`, `updated_at`, `quote_comment`, `created_at`, `updated_at`, ],
                            include: [{
                                model: db.users,
                                attributes: ['name', 'id', 'image','email'],
                                as: "subquoteCommentSenderDetail"
                            }],
             
                        },],
             })
           simple_comment = simple_comment.map(data => {
                data = data.toJSON();
                return data;
            })
       return helper.success(res,"All comments",simple_comment)
             } catch (error) {
            console.log(">>>>>>>...............",error);
            return helper.error(res, "error")

        }
    },



  




}