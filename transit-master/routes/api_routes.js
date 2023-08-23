var express = require('express');
var router = express.Router();
var userapi = require("../controller/api/apicontroller");
var middleware = require('../passport').authenticateUser;



router.post('/sign_up', userapi.sign_up)
// router.post('/verify_otp', userapi.verify_otp)
router.post('/resend_otp', userapi.resend_otp)
router.post('/login', userapi.login);
router.post('/social_login', userapi.social_login);
router.get('/contact_us', userapi.contact_us)

router.get('/forgot_url/:hash', userapi.forgotUrl);
router.post('/forgot_password', userapi.forgot_password);
router.post('/reset_password', userapi.resetPassword);

// router.use(middleware.Auth)
router.post('/verify_otp',  middleware,userapi.verify_otp)

router.post('/change_password', middleware,  userapi.change_password)
router.put('/log_out', middleware, userapi.log_out)
router.get('/get_user_profile', middleware, userapi.get_user_profile)
router.post('/edit_user_profile', middleware, userapi.edit_user_profile)
router.post('/userside_contact_us', middleware, userapi.userside_contact_us)
router.get('/terms_Conditions', middleware, userapi.terms_Conditions)
router.get('/privacy_policy', middleware, userapi.privacy_policy)
router.get('/faqs', middleware, userapi.faqs)
router.post('/add_ratings', middleware, userapi.add_ratings)
router.get('/ratings', middleware, userapi.ratings)

// router.post('/get_qotes',middleware.Auth,userapi.get_qotes)
router.get('/get_category', middleware, userapi.get_category)
router.post('/booking_form', middleware, userapi.booking_form)
router.post('/upload_car_images', middleware, userapi.upload_car_images)

router.post('/accept_qotes', middleware, userapi.accept_qotes)

router.put('/tracking_status', middleware, userapi.tracking_status)

router.get('/get_track_status', middleware, userapi.get_track_status)

router.put('/notification_status', middleware, userapi.notification_status)

router.get('/get_notification_status', middleware, userapi.get_notification_status)

router.get('/my_jobs', middleware, userapi.my_jobs)

router.post('/jobs_profile', middleware, userapi.jobs_profile)

router.get('/past_jobs', middleware, userapi.past_jobs)

router.get('/user_notification', middleware, userapi.user_notification)

router.post('/request_tracking', middleware, userapi.request_tracking)

router.post('/add_card', middleware, userapi.add_card)

router.get('/cards_listing', middleware, userapi.cards_listing)

router.post('/delete_card', middleware, userapi.delete_card)

router.post('/default_card', middleware, userapi.default_card)

router.post('/my_acoount_details', middleware, userapi.my_acoount_details)

router.put('/update_card', middleware, userapi.update_card)



// ///////cooming_payemnt from userside /////////////payment//////////////////////////////////////////////

router.post("/coming_payment", middleware,userapi.payments)
router.get("/payments", middleware,userapi.userpaymnet)
router.post("/find_payments", middleware,userapi.find_payments)

///////////////////////////////////Both//////////////////////PDF///////////////////////////////////////////

 
























////transporter///////////Side 
router.get('/transporter_job', middleware, userapi.transporter_job)
router.get('/history', middleware, userapi.history)
router.get('/cuurent_my_history', middleware, userapi.cuurent_my_history)
router.put("/start_job",middleware,userapi.start_jobs)
router.post('/carrying_prefrence', middleware, userapi.carrying_prefrence)
router.get('/get_transporter_profile', middleware, userapi.get_transporter_profile)
router.post('/edit_transporter_profile', middleware, userapi.edit_transporter_profile)
router.post('/add_transporter_account', middleware, userapi.add_transporter_account)
router.get('/get_transporter_account', middleware, userapi.get_transporter_account)
router.delete('/destroy_transporter_account', middleware, userapi.destroy_transporter_account)
router.post('/default_bank_account', middleware, userapi.default_bank_account)
router.get('/transporter_wallet', middleware, userapi.transporter_wallet)
router.post('/withdraw_amount', middleware, userapi.withdraw_amount)
router.get('/transaction_history', middleware, userapi.transaction_history)



router.post('/update_transporter_account', middleware, userapi.update_transporter_account)
router.post('/licence_transporter', middleware, userapi.licence_transporter)
router.post('/insurance_transporter', middleware, userapi.insurance_transporter)
router.get('/booking_req_For_transporter', middleware, userapi.booking_req_For_transporter)

//router.get('/All_booking_req_For_transporter',middleware.Auth,userapi.All_booking_req_For_transporter)
router.post('/profile_job', middleware, userapi.profile_job)
router.post('/QoteFrom_transporter', middleware, userapi.QoteFrom_transporter)

router.post('/prefrence_save', middleware, userapi.prefrence_save)
router.post('/prefrence_delete', middleware, userapi.prefrence_delete)


router.get('/get_prefrence', middleware, userapi.get_prefrence)

router.get('/transporter_notification', middleware, userapi.transporter_notification)
router.get('/notification_count', middleware, userapi.notification_count)

 router.get("/transporter_ratings",middleware,userapi.transporter_ratings)

 router.post("/simple_quote_comment",middleware,userapi.simple_quote_comment)
 router.post("/reply_quote_comment",middleware,userapi.reply_quote_comment)
 router.post("/get_comment",middleware,userapi.get_comment)




























module.exports = router;
