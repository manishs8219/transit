var db = require('../models');

module.exports = {

    dashboard: async (req, res) => {
        if (!req.session.user) return res.redirect('/get_login')
        // if(!req.session.user) return res.redirect('/login')
        const usercount = await db.users.count({
            where: { role: 1 }
        });
        const trans_usercount = await db.users.count({
            where: { role: 2 }
        });
        const rating_usercount = await db.ratings.count(
          
        );
        const withdraw_usercount = await db.withdraw.count(
          
            );
           

        res.render("dashboard", { rating_usercount,usercount,withdraw_usercount, trans_usercount, msg: req.flash('msg'), title: 'dashboard_active', session: req.session })

    }
}