
const path =require('path')
const fs = require('fs')
var uuid = require('uuid').v4;
const sequelize=require('sequelize')
const db=require('../models')
const nodemailer = require("nodemailer");
const crypto = require('crypto');
var apn = require('apn');
var FCM = require('fcm-node');




module.exports={

fileUpload: (file,folder) => {
    
        if (file.name) {
        let extention = file.mimetype.split("/")[1];
        image = `${uuid()}.${extention}`;
         let imagePath = `/uploads/${folder}/${image}`;

        file.mv(process.cwd() + `/public/${folder}/` + image, function (err) {
            if (err)
                return err;
        });

      return image;
      } else {
        return "";
      }
    

},
imageUpload: (file, folder = 'images') => {
    if (file.name == '') return;
   let file_name_string = file.name;
  var file_name_array = file_name_string.split(".");
 
    var file_extension = file_name_array[file_name_array.length - 1];
    var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    var result = "";
    // while (result.length<28)
    // {
    //     var rand_int = Math.floor((Math.random() * 19) + 1);
    //     var rand_chr= letters[rand_int];
    //     if (result.substr(-1, 1)!=rand_chr) result+=rand_chr;
    // }
    result = uuid();
    let name = result + '.' + file_extension;
    
    
    
    // console.log(name);return false;
    file.mv('public/' + folder + '/' + name, function (err) {
        if (err)
            return err
        });         

    return name;
  },





// vaildObject: async (required, nonRequired,res) => {
//     let message = '';
//     let empty = [];

//     // let model = required.hasOwnProperty('model') && db.hasOwnProperty(required.model) ? db[required.model] : db.user;

//     for (let key in required) {
//         if (required.hasOwnProperty(key)) {
//             if (required[key] == undefined || required[key] === '' && (required[key] !== '0' || required[key] !== 0)) {
//                 empty.push(key);
//             }
//         }
//     }if (empty.length != 0) {
//         message = empty.toStusersring();
//         if (empty.length > 1) {
//             message += " fields are required"
//         } else {
//            // if(message!="id"){ 
//                 message += " field is required"
//             }
//         //     else{
//         //         message += " field is required in params"}
//         // }
//         throw {
//             'code': 400,
//             'message': message,
//         }
  


//     } else {
        
//         // if (required.hasOwnProperty('password')) {
//         //     required.password = await bcrypt.hash(required.password , 15);
//         //     console.log( required.password ,'password bcrypt entered by user');
//         // }

//         const merge_object = Object.assign(required, nonRequired);
//         delete merge_object.checkexit;
//         delete merge_object.securitykey;

//         if (merge_object.hasOwnProperty('password') && merge_object.password == '') {
//             delete merge_object.password;
//         }

//         for (let data in merge_object) {
//             if (merge_object[data] == undefined) {
//                 delete merge_object[data];
//             } else {
//                 if (typeof merge_object[data] == 'string') {
//                     merge_object[data] = merge_object[data].trim();
//                 }
//             }
//         }

//         return merge_object;
//     }
// },

vaildObject: async function (required, non_required, res) {
    let msg ='';
    let empty = [];
    let table_name = (required.hasOwnProperty('table_name')) ? required.table_name : 'users';
    
    for (let key in required) {
        if (required.hasOwnProperty(key)) {
            if (required[key] == undefined || required[key] == '') {
                empty.push(key)
;
            }
        }
    }

    if (empty.length != 0) {
        msg = empty.toString();
        if (empty.length > 1) {
            msg += " fields are required"
        } else {
            msg += " field is required"
        }
        res.status(400).json({
            'success': false,
            'msg': msg,
            'code': 400,
             'body': {}
        });
        return;
    } else {
        if (required.hasOwnProperty('security_key')) {
            if (required.security_key != "") {
                msg = "Invalid security key";
                res.status(403).json({
                    'success': false,
                    'msg': msg,
                    'code': 403,
                    'body': []
                });
                res.end();
                return false;
            }
        }
        if (required.hasOwnProperty('password')) {
            
        }
        const marge_object = Object.assign(required, non_required);
        delete marge_object.checkexit;

        for(let data in marge_object){
            if(marge_object[data]==undefined){
                delete marge_object[data];
            }else{
                if(typeof marge_object[data]=='string'){
                    marge_object[data]=marge_object[data].trim();
                } 
            }
        }

        return marge_object;
    }
},

success: function (res, message, body = {}) {
    return res.status(200).json({
        'success': 1,
        'code': 200,
        'message': message,
        'body': body
    });
},

error: function (res, err, body = {}) {
    console.log(err, '===========================>error');
    
    let code = (typeof err === 'object') ? (err.code) ? err.code : 400 : 400;
    let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
    res.status(code).json({
        'success': false,
        'code': code,
        'message': message,
        'body': body
    });
},

error401:function(res,err,body={}){
    let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
    let code=401;
    res.status(code).json({
    'success': false,
    'code': code,
    'message': message,
    'body': body
});

},

makeImageUrlSql: (model, field, modelFolder = 'images', returnField = field, ifEmpty = '') => ([
    sequelize.literal(`(IF (LOCATE('http', \`${model}\`.\`${field}\`) > 0, \`${model}\`.\`${field}\`, IF (\`${model}\`.\`${field}\`='', "${ifEmpty}", CONCAT('${BASE_URL}/assets/${modelFolder}/', \`${model}\`.\`${field}\`)) ))`),
    returnField
 ]),

 InstructorLogo: (image) => (
` ${BASE_URL}/assets/images/${image} `

 ),
 send_emails: function(otp,email,resu) {
        
    try {
        const nodemailer = require('nodemailer');
        
            var transporter = nodemailer.createTransport({
              host: "smtp.mailtrap.io",
              port: 2525,
              auth: {
                user: "0ceed3d9c5ba7d",
                pass: "12053b661b94e9"
              }
            });
          

            var mailOptions = {
            from: 'test978056@gmail.co',
            to: email,
            subject:  'PicMash App: Forgot password',
            html: `Hi, ${email} your otp is ${otp} please verify once and reset your password`     
            };  
            
           /*  var mailOptions = {
              from: 'test978056@gmail.co',
              to: email,
              subject:  'ProxApp: Forgot password',
              template: 'forgetpassword',
              data: {
                email: email, 
                otp: otp, 
              },  
            }; 
             */
            transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
            console.log(error);
            } else {
            console.log(info)
;
            res.send('Email send');
            }
          });
         return resu;
    } catch (err) {
      throw err;
    }
    },
    unixTimestamp: function () {
        var time = Date.now();
        var n = time / 1000;
        return time = Math.floor(n);
    },
    sendEmail(object) {
        try {
            console.log("-------------------",object);
            
            var transporter = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "0ceed3d9c5ba7d",
                  pass: "12053b661b94e9"
                }
              });
            var mailOptions = {
                from: `"Transit",<${object.to}>`,
                ...object,
            };
    
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } catch (err) {
            throw err;
        }
    },
    send_email: async function (get_param, req, res) {

        console.log(get_param, "get_param");
        var data = await db.users.findOne({
            where: {
                email: get_param.email,
            },
            raw: true,
        });
        /  console.log(data) /
        if (data) {
    
            var email_password_get = await this.email_password_for_gmail();
    
            var url_data = await this.url_path(req);
    
            let auth_data = await this.generate_auth_key();
            await db.users.update({resetpassword_token:auth_data},{where:{
              email:data.email
            }})
    
            / console.log(auth_data,"auth_data"); 
          
            var transporter = nodemailer.createTransport({
              host: "smtp.mailtrap.io",
              port: 2525,
              auth: {
                user: "0ceed3d9c5ba7d",
                pass: "12053b661b94e9"
              }
            });
          
            var mailOptions = {
    
                from: email_password_get.email_data,
                to: get_param.email,
                subject: 'Display Forgot Password',
                html: 'Click here for change password <a href="' +
                    url_data +
                    "/api/reset_password/" +
                    auth_data +
                    '"> Click</a>'
            };
    
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
    
            save = await db.users.update({
                forgotPassword: auth_data,
            }, {
                where: {
    
                    id: data.id
    
                }
            });
            507
            return transporter;
        } else {
    
            let msg = 'Email not registered';
            throw msg
        }
    
    },
createSHA1: function () {
        let key = 'abc' + new Date().getTime();
        return crypto.createHash('sha1').update(key).digest('hex');
    },
    bcryptHash: (myPlaintextPassword, saltRounds = 10) => {
        const bcrypt = require('bcrypt');
        const salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(myPlaintextPassword, salt);
        hash = hash.replace('$2b$', '$2y$');
        return hash;
    },
    get_user_data: async function (user_id, req, res) {
        get_signup_data = await db.users.findOne({
         
            where: {
                id: user_id
            },
            raw:true
        });
        // console.log(">>>>>>>>>>>>>>>>>>>>",get_signup_data);return
        

        return get_signup_data
    },
    send_push_notification: async (get_message,device_token,device_type,target_id,target_name,sender_image,noti_type,)=>{
   console.log("hello test" ,device_token)
//    var device_token=`cD44-Lx8SGGaCLh-g5td4R:APA91bGFtyxdnY_ZrR-ZE0lv_Urz7Y0G-ZwL2ZzjohOM684e4kDO73UWSF2gtRxKM2PnlrEbtMimEFBg2m8Lnox6-TWEI3oQ_6vdTHM1IEKFCPaDJbzmcf7auPuyVUOJ2sJJSfM_aezA`
   if(device_type == 1){
    if (device_token != '') {
        var new_message = {
            to:device_token,
            data: {
                data: {
                    title: "Trans it",
                    message: get_message,
                    device_token: device_token,
                    device_type: device_type,
                    notification_code: noti_type,
                    sender_id: target_id,
                    sender_name:target_name,
                    sender_image:sender_image
                } 

               },
            notification:{ 
                message:get_message

            }
        };
       var serverKey = 'AAAAKnlZtrQ:APA91bFXeRWP28nG8ZnVf1lPXcpUJNqJQCk1qpoLcgB3lU8gZGaqrBZzob8gCU_bhkoJwrDBtB9fafCbIsfrUU_Hd8DD31pDXGvM-7w1iLAtRxrjM5hHeSMKzojiLyufSzjWsbTHA-TZ';

          var fcm = new FCM(serverKey);
          fcm.send(new_message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!");
                    console.log(err, "new_message");
                } else {
                    console.log(new_message, "new_message");
                    console.log("Successfully sent with response: ", response);
                }
            });
  }
  }
   if(device_type == 2){
        const apn = require('apn');
        const options = {
            token: {
                key: path.join(__dirname,"./AuthKey_Q3NW9UXH2J (1).p8"),
                keyId: "Q3NW9UXH2J",
                teamId: "4XVQBWH9QF"
                },
            production: false
        };
        const apnProvider = new apn.Provider(options);
                    if (device_token && device_token != '') {
                        var message = {
                          to:device_token,
                          data: {
                                title: "Trans it",
                                message: get_message,
                                device_token: device_token,
                                device_type: device_type,
                                notification_code: noti_type,
                                sender_id: target_id,
                                sender_name:target_name,
                                sender_image:sender_image
                            }
                        
                        };
                        if (device_token && device_token != '') {
                        var myDevice = device_token;
                        var note = new apn.Notification();
                        let bundleId = "com.trans-it.Trans-it";
                        console.log('=???????????????????',bundleId);
        
                        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                        // note.badge = save_noti_data.notification_count;
                        note.badge = 0;
                        note.sound = "default";
                        note.title = "Trans it";
                        note.body = get_message;
                        note.payload = message;
                        note.topic = bundleId;
                        console.log("send note", note);
                        apnProvider.send(note, myDevice).then((result) => {
                      console.log("send result=========================================================================", result);
                      if(result.sent != ''){
                          console.log("push sent");
                    }else{
                          console.log("error while sending user notificatio");
                      }
                        });
                    } else {
                        console.log("push sent not sent empty  device token");
                    }
                }}
    
            },
            p8: async (deviceTokens, payload,collapseId) => {
                var options = {
                    token: {
                        key: path.join(__dirname, "./AuthKey_Q3NW9UXH2J (1).p8"),
                        keyId: "Q3NW9UXH2J",
                        teamId: "4XVQBWH9QF"
                    },
                    production: false
                };
                console.log(options,"========")
        
                var apnProvider = new apn.Provider(options);
        
                var note = new apn.Notification();
        
                 if(payload.status == 4){
                    note.sound = "default";
                }else{
                    note.sound = "note.aiff";
                }
               note.alert = payload.notificationTitle

               note.aps.payload = payload

              note.topic = "com.trans-it.Trans-it";

                note.collapseId=collapseId
               
             apnProvider.send(note, deviceTokens).then((result) => {
                  
                    console.log(result);
                });
            },
        }