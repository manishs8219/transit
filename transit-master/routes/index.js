var express = require('express');
var router = express.Router();
var dashboardcontroller = require("../controller/dashboard")
var admincontroller = require("../controller/admincontroll")
var usercontroller = require("../controller/usercontroll")
var cmscontroller = require("../controller/cmscontroll")
var packagecontroller = require("../controller/packagecontroll")
var contactcontroller = require("../controller/ContactusController")
var carryingcontroller = require("../controller/CarryingPreferenceController")
var ratingcontroller = require("../controller/ratings")
var bookingcontroller = require("../controller/bookingcontroll")
var withdrawcontroller=require("../controller/withdrawcontroll")





router.post("/deletedata/:id", usercontroller.delete);


/* GET home page. */

router.get('/dashboard', dashboardcontroller.dashboard)

///// admin///////////
router.get('/get_login', admincontroller.login)
router.post('/in_login', admincontroller.login_in)
router.get('/log_out', admincontroller.log_out)


router.get('/admin_profile', admincontroller.admin_profile)
router.post('/update_profile', admincontroller._profile_post)
router.get('/change_password', admincontroller.change_password)
router.post('/update_password', admincontroller.update_password)

/////////users//////////transporter users///////////////////

router.get('/users', usercontroller.users)
router.get('/view/:id', usercontroller.view)
router.post("/userstatus", usercontroller.userstatus)





router.get('/transport_users', usercontroller.transport_users)
router.get('/transport_view/:id', usercontroller.transport_view)
router.post("/status", usercontroller.status)



//////////terms&conditions/////////////privacy/////////faqs////////////
router.get('/term_conditions', cmscontroller.terms)
router.post('/update_conditions', cmscontroller.update_terms)
router.get('/privacy_policy', cmscontroller.privacy_policy)
router.post('/update_policy', cmscontroller.update_policy)
router.get('/update_policy', cmscontroller.update_policy)
router.get('/faqs', cmscontroller.faqs)
router.post('/add_faqs',cmscontroller.add_faqs)
router.get('/index_question',cmscontroller.index_question)
router.get('/view_faqs/:id',cmscontroller.view_faqs)
router.post('/update_faqs/:id',cmscontroller.update_faqs)
router.post("/deletedata/:id", cmscontroller.delete);







//router.get('/faqs', cmscontroller.faqs)

/////////////Vehicles///////////////////////////
router.get('/package', packagecontroller.package)
router.post('/add_Package', packagecontroller.add_Package)
router.get('/list_Package', packagecontroller.list_Package)
router.get('/edit_Package/:id', packagecontroller.edit_Package)
router.post('/update_Package/:id', packagecontroller.update_Package)



/* ContactUs Route */
router.get('/contactlist', contactcontroller.contactUs)

/* Carrying Preference Route */
router.get('/addpreference', carryingcontroller.getPrefernce)
router.post('/postpreference', carryingcontroller.postPrefernce)
router.get('/preferencelist', carryingcontroller.preferenceList)
router.post("/preferencestatus", carryingcontroller.preferenceStatus)
router.get('/editpreference/:id', carryingcontroller.editPreference)
router.post('/updatepreference/:id', carryingcontroller.updatePreference)
// router.post("/deletedata/:id", carryingcontroller.delete);

// Ratings ///////////////////////
router.get('/transporter_ratings', ratingcontroller.transporter_ratings)
router.get('/view_transporter/:id', ratingcontroller.rating_view)



//////bookings/////////////////////

////car////////
router.get('/bookings_req', bookingcontroller.bookings_req)
router.get('/bookings_view/:id', bookingcontroller.view_booking)
///bike///.////

router.get('/bike_view', bookingcontroller.bike_view)

// /////Furniture && Home//////

 router.get('/furniture_view', bookingcontroller.furniture_view)


// //////Other_req?????????///////

 router.get('/other_view', bookingcontroller.other_view)


 router.get('/category_images/:id',bookingcontroller.category_images )
 











// WithDraw///////////////////
router.get('/withdraw', withdrawcontroller.withdraw)
router.post("/withdraw_status", withdrawcontroller.withdrawstatus)
















































module.exports = router;




