const fs = require('fs');
const path = require('path');
const db = require('./models');
const my_function = require('./helper/socketFunction.js');
const helper = require('./helper/helpers.js');
//console.log(api_function,"api_function")
// const myFunctions = require('./functions/apiFunctions');

// var base64Img = require('base64-img');
var uuid = require('uuid');
const sequelize = require('sequelize');
const socket_user = db.socketUser
const chatConstants = db.chatConstants
const users = db.users
const group_users = db.group_users
// const groups = db.groups
const messages = db.messages
// const providerLocations = db.providerLocations
const Op = sequelize.Op;
const notification = db.notification
const callHistory = db.call_history
//const FCM = require('fcm-node');
const user = require('./models/users');


module.exports = function (io) {
 
   
   io.on('connection', function (socket) {


    console.log("socket Connected");
    socket.on('connect_user', async function (connect_listener) {
      try {
       
        
        let socket_id = socket.id
        let check_socket_id = await my_function.check_socket_id(connect_listener, socket_id);

        success_message = [];
        success_message = {
          'success_message': 'User connected successfully'
        }
        socket.emit('connect_listener', success_message);
      } catch (error) {
        throw error
      }
    });

    socket.on('disconnect_user', async function () {

      let socket_id = socket.id
      let socket_disconnect = await my_function.socket_disconnect(socket_id)

      console.log('socket user disconnected');

      success_message = [];
      success_message = {
        'success_message': 'User disconnected successfully'
      }
      socket.emit('disconnect_listener', success_message);
    });

    socket.on('send_message', async function (get_data) {
     
      try {
           if (get_data.messageType == 2 || get_data.messageType == 4) {
          extension_data = get_data.extension
          file_name = get_data.fileName
          //console.log("get_data...", get_data);
          convert_image = await my_function.image_base_64(get_data.messageType, get_data.message, get_data.extension);
          get_data.message = convert_image;
        }
        else {
          get_data.thumbnail = '';
        }
          var chat_constantdata = await chatConstants.findOne({
          where: {
            [Op.or]: [
              { senderId: get_data.senderId, receiverId: get_data.receiverId },
              { receiverId: get_data.senderId, senderId: get_data.receiverId },
              
            ],
             type:get_data.type
       
          }
         });
        if (chat_constantdata) {
          console.log("here-------------------")
          var create_message = await messages.create({
            senderId: get_data.senderId,
            receiverId: get_data.receiverId,
            messageType: get_data.messageType,
            message: get_data.message,
            chatConstantId: chat_constantdata.dataValues.id,
            type:get_data.type,
          })
          console.log("jejjjjj")
          update_last_message = await chatConstants.update({
            lastMessageId: create_message.dataValues.id,
            deletedId: 0,
            createdAt: await my_function.create_time_stamp(),
            type:get_data.type
          },
            {
              where: {
                id: chat_constantdata.dataValues.id
              }
            }
          );
            var getdata = await messages.findOne({
            attributes: ['id', 'createdAt','type',
              [sequelize.literal('(SELECT name FROM users WHERE users.id  = messages.senderId)'), 'SenderName'], 'message',
              [sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.senderId)'), 'SenderID'],
              [sequelize.literal('(SELECT image  FROM users WHERE  users.id  = messages.senderId LIMIT 1)'), 'SenderImage'],
              [sequelize.literal('(SELECT deviceToken	 FROM users WHERE users.id  = messages.receiverId)'), 'deviceToken'],
              [sequelize.literal('(SELECT deviceType FROM users WHERE users.id  =  messages.receiverId)'), 'deviceType'],
              [sequelize.literal('(SELECT name FROM users WHERE users.id  =  messages.receiverId)'), 'ReceiverName'],
              [sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.receiverId)'), 'ReceiverId'],
              [sequelize.literal('(SELECT image FROM users WHERE users.id  = messages.receiverId LIMIT 1)'), 'ReceiverImage'], 'messageType'],
            //   [sequelize.literal('(SELECT image FROM user_images WHERE type = 1 AND user_images.user_id  = messages.receiverId LIMIT 1)'), 'ReceiverImage'], 
           where: {
              id: create_message.dataValues.id
            }
          });
           if (getdata) {
            var get_id = await socket_user.findOne({
              where: {
                userId: get_data.receiverId
              }

            })
            
            var userrole = await users.findOne({
              where:{
                id:get_data.senderId
              }
            })
            if(get_data.type==1){
             var message = getdata.dataValues.SenderName + ' ' + "send you message."
              var find_receiver = await users.findOne({
             where:{
               id:get_data.senderId,
               
             },
             raw:true
           })
            if (find_receiver.notification_status==1) {
              let sendpush = await helper.send_push_notification(message, getdata.dataValues.deviceToken, getdata.dataValues.deviceType, getdata.dataValues.SenderID, getdata.dataValues.SenderName, getdata.dataValues.SenderImage,5);
            }
          }
          
           if(get_data.type==2){
            if(userrole.role == 2){
            var message = getdata.dataValues.SenderName + ' ' + ".asked a question"
            }else{
              var message = getdata.dataValues.SenderName + ' ' + "Reply to your question"
            }
            console.log(message,'===========================message here =====================',userrole.role)
           var find_receiver = await users.findOne({
             where:{
               id:get_data.receiverId,
               
             },
             raw:true
           })
           if (find_receiver.notification_status==1) {
              let sendpush = await helper.send_push_notification(message, getdata.dataValues.deviceToken, getdata.dataValues.deviceType, getdata.dataValues.SenderID, getdata.dataValues.SenderName, getdata.dataValues.SenderImage,8);
            }

          }
           // getdata.dataValues.type = get_data.type
           if (get_id) {
             getdata.type = get_data.type
              io.to(get_id.socketId).emit('send_message_listner', getdata);
            }
            socket.emit("send_message_listner", getdata);
          }

        } else {
            const create_last_message = await chatConstants.create({
            senderId: get_data.senderId,
            receiverId: get_data.receiverId,
            lastMessageId: 0,
            type:get_data.type
          });

          let create_message = await messages.create({
            senderId: get_data.senderId,
            receiverId: get_data.receiverId,
            messageType: get_data.messageType,
            message: get_data.message,
            chatConstantId: create_last_message.dataValues.id,
            type:get_data.type
          }); 
      
          let update_last_message = await chatConstants.update({

            lastMessageId: create_message.dataValues.id
          },
            {
              where: {
                id: create_last_message.dataValues.id
              }
            }
          );
         
          let getdata = await messages.findOne({
            attributes: ['id', 'createdAt','type',
              [sequelize.literal('(SELECT name FROM users WHERE users.id  = messages.senderId)'), 'SenderName'], 'message',
              [sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.senderId)'), 'SenderID'],
              [sequelize.literal('(SELECT image  FROM users WHERE  users.id  = messages.senderId LIMIT 1)'), 'SenderImage'],
              [sequelize.literal('(SELECT deviceToken	 FROM users WHERE users.id  = messages.receiverId)'), 'deviceToken'],
              [sequelize.literal('(SELECT deviceType FROM users WHERE users.id  =  messages.receiverId)'), 'deviceType'],
              [sequelize.literal('(SELECT name FROM users WHERE users.id  =  messages.receiverId)'), 'ReceiverName'],
              [sequelize.literal('(SELECT id FROM users WHERE users.id  = messages.receiverId)'), 'ReceiverId'],
              [sequelize.literal('(SELECT image FROM users WHERE users.id  = messages.receiverId LIMIT 1)'), 'ReceiverImage'], 'messageType'],
            where: {
              id: create_message.dataValues.id
            },
            raw:true
          });
        
          
          if (getdata) {
            get_id = await socket_user.findOne({
              where: {
                userId: get_data.receiverId
              },
              raw: false
            })
            find_receiverss = await users.findOne({
              where:{
                id:get_data.receiverId
              },
              raw:true
            })
           
            if(get_data.type==1 ){
            var message = getdata.SenderName + ' ' + "send you message."
          
             if(find_receiverss.notification_status==1){

            let sendpush = await helper.send_push_notification(message, getdata.deviceToken, getdata.deviceType, getdata.SenderID, getdata.SenderName,getdata.SenderImage, 3);
             }
            }
          var find_receiverse = await users.findOne({
              where:{
                id:get_data.receiverId
              },
              raw:true
            })
             var userrole = await users.findOne({
                where:{
                  id:get_data.senderId
                },
                raw:true
              })
            if(get_data.type==2){
              if(userrole.role == 2){
              var message = getdata.SenderName + ' ' + "asked a question"
              }else{
                var message = getdata.SenderName + ' ' + "reply to your question"
              }
              if(find_receiverse.notification_status==1){
                let sendpush = await helper.send_push_notification(message, getdata.deviceToken, getdata.deviceType, getdata.SenderID, getdata.SenderName,getdata.SenderImage, 3);
               }
              }
              if (get_id != null) {
                  getdata.type = get_data.type
              io.to(get_id.socketId).emit('send_message_listner', getdata);
            }
          socket.emit("send_message_listner", getdata);
          }

        }
      } catch (error) {
        console.log(error);
      //  return helper.error(res,error)
      }
    });
    socket.on("transporter_location", async function (datas) {
      try {
        const find_user = await db.car_details.findOne({
          where: {
            [Op.and]: [
              { user_id: datas.userId },
              { transporter_id: datas.transporterId }
            ]
          }
         })
       if (find_user) {
          var update_location = await users.update({
            latitude: datas.latitude,
            longitude: datas.longitude
          }, {
             where: {
              id: find_user.transporter_id
            }
          
          })
        const find_userssssss = await users.findOne({
            where: {
              id: find_user.transporter_id
            }
          })
         
          if (update_location) {
            get_id = await socket_user.findOne({
              where: {
                userId: datas.userId
              },
              raw: false
            })

            if (get_id != null) {
            
              
              io.to(get_id.dataValues.socketId).emit('transporter_listner', find_userssssss);
            }
          socket.emit("transporter_listner", find_userssssss)
          }
        }
      } catch (error) {
        console.log(error);
          }
    });
    // socket.on("location_of_transporter", async function (dat) {
    //    try {

    //     const findUser = await db.bookings.findOne({
    //       where: {
    //        userid: dat.userId
    //       }
    //     })

    //     const data = await db.users.findOne({
    //       attributes:["latitude","longitude","name","id","image",],
    //       where: {
    //         id: findUser.transporterid
    //       }
    //     })
    //     socket.emit("location_listner", data)

    //   } catch (error) {
    //     throw error
    //   }
    // });



    // socket.on('send_group_message', async function (get_data) {
    //   try {
    //   //  console.log(get_data,"get_data");return;
    //     if (get_data.messageType == 2) {
    //       extension_data = get_data.extension
    //       convert_image = await my_function.image_base_64(get_data.message, extension_data);
    //       get_data.message = convert_image;
    //     }
    //     let send_message = await my_function.send_group_message(get_data)
    //     console.log("send_message...", send_message)
    //     let data_to_send = await my_function.data_to_send_group(send_message);
    //     socket.emit('new_message', data_to_send);

    //     let findGroupUsers = await my_function.findGroupUsers(get_data);

    //     for(let i in findGroupUsers){
    //       await group_users.update({
    //         unreadcount: findGroupUsers[i].unreadcount+1
    //       },
    //       {
    //         where:{
    //           id:findGroupUsers[i].id
    //         }
    //       });
    //     }
    //     //console.log(findGroupUsers,"================findGroupUsers");return;
    //     let findGroup = await groups.findOne({
    //       attributes: ['name','image', 'description'],
    //       where: {
    //         id: get_data.groupId
    //       }
    //     });
    //     let deviceTokens = [];
    //     let curtime2= Math.round(new Date().getTime()/1000);
    //     for(let i in findGroupUsers) {
    //       let message = data_to_send.senderName + ' Sent You a Message';
    //       let send_notification = await notification.create({
    //         // message : data_to_send.senderName + ' Sent You a Message',
    //         userId: get_data.senderId,
    //         user2Id: findGroupUsers[i].userId,
    //         userType: 1,
    //         message: message,
    //         type: 3
    //       })
    //       // let saveNotification = await notificationData.create({
    //       //   sender_id: get_data.senderId,
    //       //   receiver_id: findGroupUsers[i].userId,
    //       //   senderName:data_to_send.senderName,
    //       //   senderImage:data_to_send.senderImage,
    //       //   groupId: get_data.groupId,
    //       //   notification: ' Sent a Message in ' + findGroup.name,
    //       //   code: 4,
    //       //   createdAt: curtime2,
    //       //   updatedAt: curtime2
    //       // });
    //       // let getDeviceToken = await users.findOne({
    //       //   attributes: ['deviceType','deviceToken','notification_status'],
    //       //   where: {
    //       //     id: get_data.receiverId
    //       //   }
    //       // });

    //       let get_notification_data = await notification.findOne({
    //         // attributes:['id'],
    //         where:{
    //           id:send_notification.dataValues.id
    //         },
    //         raw:true
    //       })

    //       if(findGroupUsers[i].socketId != '') {
    //         socket.to(findGroupUsers[i].socketId).emit('new_group_message', data_to_send);
    //       }

    //       if(findGroupUsers[i].notification == 1) {
    //           if(findGroupUsers[i].device_token != '') {
    //             // message =  data_to_send.senderName + ' Sent a Message in ' + findGroup.name;
    //             // console.log("message...", message)
    //             // device_token = findGroupUsers[i].device_token
    //             // device_type = findGroupUsers[i].device_type
    //             // title = 'Future Robotics',
    //             // notification_code=5678
    //             // data_to_send.groupName = findGroup.name
    //             // data_to_send.groupImage = findGroup.image
    //             // data_to_send.category = findGroup.category
    //             // await Helper.send_push_notification(message,device_token, device_type, title, data_to_send,notification_code);
    //             message = data_to_send.senderName + ' Sent You a Message'
    //             device_token = findGroupUsers[i].device_token
    //             device_type = findGroupUsers[i].device_type
    //             // title = 'Adventure Share'
    //             push_type=3
    //             var data_to_push = {}
    //             data_to_push = get_notification_data
    //             data_to_push.senderName = data_to_send.senderName
    //             data_to_push.senderImage = data_to_send.senderImage
    //             // console.log("data_to_push...", data_to_push);
    //             let send_push_to_reciever = await api_function.send_push_notification_normal(message, device_token, device_type, data_to_push,push_type)
    //           }
    //       }
    //     }
    //   } catch (error) {
    //     throw error
    //   }
    // });


    socket.on('get_message', async function (get_msg_data) {
      try {

        let get_message = await my_function.get_message(get_msg_data);

        if (get_message.length > 0) {

          socket.emit('get_data_message', get_message);

        } else {
         success_message = [];
          // success_message = {
          //   'success_message': 'Data Not Available'
          // }
          socket.emit('get_data_message', success_message);
        }

      } catch (error) {
        throw error
      }
    });

    //     socket.on('get_group_message', async function (get_msg_data) {
    //       try {

    //         let get_message = await my_function.get_group_message(get_msg_data);

    //         if (get_message.length > 0) {

    //           socket.emit('get_data_group_message', get_message);

    //         } else {

    //           success_message = [];
    //           // success_message = {
    //           //   'success_message': 'Data Not Available'
    //           // }
    //           socket.emit('get_data_group_message', success_message);
    //         }

    //       } catch (error) {
    //         throw error
    //       }
    //     });

        socket.on('chat_listing', async function (chat_data) {
          try {
            
              var get_chat_listing = await my_function.get_chat_listing(chat_data);
              console.log(get_chat_listing.length,get_chat_listing[0],'===========================================================================')
            if (get_chat_listing.length > 0) {
              socket.emit('chat_message', get_chat_listing);
            } else {

              success_message = [];
              /* success_message = {
                'success_message': 'Data Not Available'
              } */
              socket.emit('chat_message', success_message);

            }
          } catch (error) {
            throw error
          }
        });

    // socket.on('get_chat', async function (data) {
    //   if (data) {
    //     console.log(data, "======================");

    //     var get_data_chat = await my_function.GetChat(data);
    //     console.log(get_data_chat, "get_data_chatget_data_chat")

    //     if (get_data_chat) {
    //     socket.emit('my_chat', get_data_chat);
    //     }
    //   }

    //   });

    //       socket.on('delete_chat_message', async function (delete_chat) {
    //         try {

    //           let delete_chat_data = await my_function.delete_msg(delete_chat)
    //           success_message = []
    //           success_message = {
    //           'success_message': 'Chat Deleted Successfully'
    //           }
    //         socket.emit('delete_chat',success_message)
    //           }catch(error){
    //           throw error
    //         }
    //         });

    //         socket.on("joinroom", async function (data) {
    //           try {

    //          socket.join('myroom');
    //          console.log(socket.id);
    //          message ={
    //           message : "join successfull"
    //         }
    //          socket.emit("join_room",message)

    //           } catch (error) {
    //             throw error
    //           }
    //         });
    //         socket.on("home", async function (datas) {
    //           try {

    //             const latupdate = await db.user.update({
    //              latitude: datas.latitude,
    //               longitude: datas.longitude
    //             }, {
    //               where: {
    //                 id: datas.userId
    //               }
    //             })
    // console.log(latupdate,'latupdatelatupdate');

    //             var data = await db.user.findAll({
    //               attributes: [`id`, `username`, `image`, `latitude`, `longitude`, `premium`, `dobtimestamp`, `gender`, `about`, `age_status`, `location_status`, `is_online`,
    //                 [sequelize.literal("6371 * acos(cos(radians(" + datas.latitude + ")) * cos(radians(latitude)) * cos(radians(" + datas.longitude + ") - radians(longitude)) + sin(radians(" + datas.latitude + ")) * sin(radians(latitude)))"), 'distance'],
    //                 //   [sequelize.literal(`ifnull((SELECT is_online FROM socket_users WHERE user_id = users.id LIMIT 1 ),0)`), 'is_online'],

    //               ],
    //               where: {
    //                 role: {
    //                   [Op.eq]: 1,

    //                 },
    //                 // premium: 1,
    //               },
    //               having: {
    //                 distance: {
    //                   [Op.lte]: datas.distance || 1,
    //                 },
    //               },
    //             });

    //          socket.to('myroom').emit('home_listner',data)
    //          socket.emit("home_listner",data)

    //           } catch (error) {
    //             throw error
    //           }
    //         });

    //      socket.on("block_user", async function (block_data) {
    //       try {

    //         let block_data_user = await my_function.block_user(block_data);

    //         /* console.log(block_data_user,"block_data_user") */
    //         var get_socket_daata= await socket_user.findOne({
    //           where:{
    //             userId:block_data.user2Id
    //           },
    //           raw:true
    //         })

    //        // console.log(get_socket_daata,"get_socket_daata");return
    //         create_data = [];
    //         create_data = {
    //           'block_data': block_data.status,
    //           'userId':block_data.userId
    //         }

    //         socket.emit('block_data', create_data);
    //         socket.to(get_socket_daata.socketId).emit('block_data', create_data);
    //       } catch (error) {
    //         throw error
    //       }
    //     });



    //     socket.on('delete_chat', async function (data) {
    //       try {
    //         get_block_status_data = await chatConstants.findOne({
    //           where: {
    //             [Op.or]: [
    //               { senderId: data.senderId, receiverId: data.receiverId },
    //               { receiverId: data.senderId, senderId: data.receiverId }
    //             ]
    //           },
    //           raw: true
    //         });
    //         //   console.log(get_block_status_data,"innnnnnnnnnnnnn");return
    //         if (get_block_status_data.deletedId != 0) {
    //           delete_chat_list_data_user = await chatConstants.destroy({
    //             where: {
    //               id: get_block_status_data.id
    //             }
    //           });

    //           delete_all_messages = await messages.destroy({

    //             where: {
    //               [Op.or]: [
    //                 { senderId: data.senderId, receiverId: data.receiverId },
    //                 { receiverId: data.senderId, senderId: data.receiverId }

    //               ]
    //             }
    //           });
    // console.log("33333333333333333333333iffffffffffffffffffffffffffffffffff");

    //         } else {
    //           //  console.log("innnnnnnnnnnnnn");return
    //           console.log("eeeeeeeeeeeeeeeeeeeellllllllllllllllssssssssssssssssssssss");

    //           delete_chat_list_data_user = await chatConstants.update({
    //             deletedId: data.senderId
    //           },
    //             {
    //               where: {
    //                 [Op.or]: [
    //                   { senderId: data.senderId, receiverId: data.receiverId },
    //                   { receiverId: data.senderId, senderId: data.receiverId }

    //                 ]
    //               }
    //             }
    //           );
    //           // console.log(delete_chat_list_data_user,"delete_chat_list_data_user");return
    //           destroy_all_messages = await messages.destroy({

    //             where: {
    //               [Op.or]: [
    //                 { senderId: data.senderId, receiverId: data.receiverId },
    //                 { receiverId: data.senderId, senderId: data.receiverId }

    //               ],
    //               [Op.not]: {
    //                 deletedId: 0
    //               }
    //             }
    //           });

    //           delete_all_messages = await messages.update({
    //             deletedId: data.senderId
    //           },
    //             {
    //               where: {
    //                 deletedId: 0,
    //                 [Op.or]: [
    //                   { senderId: data.senderId, receiverId: data.receiverId },
    //                   { receiverId: data.senderId, senderId: data.receiverId }

    //                 ]
    //               }
    //             }
    //           );

    //         }
    //         let success_message = {
    //           'success_message': 'chat cleared successfully'
    //         };

    //         socket.emit('cleared_chat', success_message);
    //       } catch (error) {
    //         throw error
    //       }

    //     })

    //     // socket.on('delete_chat', async function (delete_chat) {
    //     //   try {

    //     //     let delete_chat_data = await my_function.delete_chat_users(delete_chat)
    //     //     success_message = []
    //     //     success_message = {
    //     //       'success_message': 'Chat Deleted Successfully'
    //     //     }

    //     //     socket.emit('delete_data', success_message);

    //     //   } catch (error) {
    //     //     throw error
    //     //   }
    //     // });


    //     socket.on('delete_single_chat', async function (delete_chat) {
    //       try {

    //         let delete_chat_data = await my_function.single_chat_delete_users(delete_chat)
    //         success_message = []
    //         success_message = {
    //           'success_message': 'Chat Deleted Successfully'
    //         }

    //         socket.emit('delete_single_data', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });
    //     socket.on('report_user', async function (report_user_data) {
    //       try {

    //         let report_user = await my_function.report_user(report_user_data)
    //         success_message = []
    //         success_message = {
    //           'success_message': 'Report Added Successfully'
    //         }

    //         socket.emit('report_data', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });
    //     socket.on('block_status', async function (get_block_data) {

    //       let get_block_status = await my_function.get_block_status(get_block_data);
    //       get_block_data_status = [];
    //       if (get_block_status) {
    //         get_block_data_status = {
    //           'block_data_status': 1
    //         }
    //       } else {
    //         get_block_data_status = {
    //           'block_data_status': 0
    //         }
    //       }
    //       socket.emit('block_data_status', get_block_data_status);

    //     });
    //     socket.on('read_unread', async function (get_read_status) {

    //       let get_read_unread = await my_function.get_read_unread_status(get_read_status);
    //       get_read_unread = {}
    //       get_read_unread.read_status = 1
    //       socket.emit('read_data_status', get_read_unread)

    //     });
    //     // socket.on('delete_chat_listing', async function (get_list_data) {
    //     //   try {

    //     //     let delete_chat_list_data = await my_function.delete_chat_list_data(get_list_data);

    //     //     success_message = []

    //     //     success_message = {
    //     //       'success_message': 'User Deleted Successfully'
    //     //     }
    //     //     socket.emit('chat_list_data', success_message);

    //     //   } catch (error) {
    //     //     throw error
    //     //   }
    //     // });

    //     socket.on('delete_chat_listing', async function (get_list_data) {
    //       try {

    //         let delete_chat_list_data = await my_function.delete_chat_list_data(get_list_data);

    //         success_message = []

    //         success_message = {
    //           'success_message': 'User Deleted Successfully'
    //         }
    //         socket.emit('chat_list_data', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });
    //     socket.on('update_location_provider', async function (get_data) {
    //       try {

    //        let update_location = await my_function.update_location(get_data);
    //       // let get_reciever_data = await my_function.get_user_data(get_data)
    //     //   console.log(get_reciever_data,"get_reciever_data");return;
    //         socket.emit('get_location', get_data);
    //       //  socket.to(get_reciever_data.socketId).emit('get_location', get_data);

    //       } catch (error) {
    //         throw error
    //       }
    //     });
    //     socket.on('get_location_provider', async function (get_data) {
    //       try {
    //      let get_provider_latestlocation= await providerLocations.findOne({
    //        where:{
    //          providerId:get_data.providerId
    //        },
    //        raw:true,
    //        order:[
    //          ['id','desc']
    //        ]
    //      })
    //         socket.emit('get_provider_location_info', get_provider_latestlocation);


    //       } catch (error) {
    //         throw error
    //       }
    //     });

    //     socket.on('delete_group_chat', async function (get_data) {
    //       try {

    //         let clear_group_chat = await my_function.clear_group_chat(get_data);

    //         success_message = [];
    //         success_message = {
    //           'success_message': 'All messages cleared successfully'
    //         }

    //         socket.emit('clear_group_chat', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });

    //     socket.on('leave_group', async function (get_data) {
    //       try {
    //         let delete_group = await my_function.leave_group(get_data);

    //         success_message = [];
    //         success_message = {
    //           'success_message': 'Group leave successfully'
    //         }
    //         socket.emit('leave_group_chat', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });

    //     socket.on('read_unread_group_message', async function (get_data) {
    //       try {
    //         // console.log(get_data.userId,"=============>>");
    //         let updateGroupReadCount= await group_users.update({
    //           unreadcount:0,
    //         },{
    //           where:{
    //             userId:get_data.userId,
    //             groupId: get_data.groupId
    //           }
    //         });
    //         // console.log(updateGroupReadCount,"================updateGroupReadCount");
    //         success_message = [];
    //         success_message = {
    //           'success_message': 'Group Read Count Updated Successfully',
    //           'read_count': '0',
    //         }
    //         socket.emit('group_read_unread_status', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });
    //     socket.on("call_to_user", async function (call_data) {
    //       try {
    //       //  console.log("call_to_user_data");return
    //       let call_to_user_data = await my_function.call_connect(call_data);

    //       get_call_statusresponse = await callHistory.findOne({
    //         where: {
    //         senderId: call_data.senderId,
    //         receiverId: call_data.receiverId,
    //         },
    //         order: [
    //         ['id', 'DESC'],
    //         ],
    //         raw: true
    //         });

    //     //  console.log(call_to_user_data,"call_to_user_data");return
    //       // return;
    //       // create_data = [];
    //       if(get_call_statusresponse){
    //       create_data = {
    //       'call_connect_status': call_to_user_data,
    //       'channelName':get_call_statusresponse.channelName,
    //       "senderId":call_data.senderId,
    //       "receiverId":call_data.receiverId,
    //       }
    //     }else{
    //       create_data = {
    //         'call_connect_status': call_to_user_data,
    //         'channelName':'',
    //         "senderId":call_data.senderId,
    //         "receiverId":call_data.receiverId,
    //         }
    //     }
    //       console.log(create_data, "==================data");
    //       socket.emit('call_connect_status', create_data);
    //       let get_reciever_data = await my_function.get_reciever_data_call(call_data)
    //       console.log(get_reciever_data);
    //       if (get_reciever_data.isOnline == 1) {
    //       socket.to(get_reciever_data.dataValues.socketId).emit('call_connect_status', create_data);
    //       }
    //       } catch (error) {
    //       throw error
    //       }
    //       });

    //       socket.on('call_status', async function (get_call_data) {

    //         // let get_block_status = await my_function.get_block_status(get_block_data);
    //         let get_call_status = await my_function.get_call_user_status(get_call_data)
    //         get_call_data_status = [];
    //         console.log(get_call_status,'=====get_call_status');
    //         if (get_call_status) {
    //         get_call_data_status = {
    //         // 'block_data_status': 1,
    //         'call_data_status': get_call_status ? get_call_status.dataValues.callStatus : 0
    //         }
    //         } else {
    //         get_call_data_status = {
    //         'call_data_status': 0
    //         }
    //         }
    //         socket.emit('call_data_status', get_call_data_status);

    //         });

    //     socket.on('report_group', async function (report_user_data) {
    //       try {
    //         let report_group = await my_function.report_group(report_user_data)
    //         success_message = []
    //         success_message = {
    //           'success_message': 'Group Report Added Successfully'
    //         }

    //         socket.emit('report_group_data', success_message);

    //       } catch (error) {
    //         throw error
    //       }
    //     });

  });
}
