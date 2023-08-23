var db = require('../models');
const bcrypt = require('bcrypt');
const path = require('path')
module.exports = {
    terms: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')
            const data = await db.cms.findOne({
                where: {
                    id: 1
                }

            })
            console.log('>>>>>>>>>>>>>>>>>>>', data)
            res.render("cms/term&conditions", { data, session: req.session, msg: req.flash('msg'), title: 'terms&conditions' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_terms: async (req, res) => {
        try {
            if (req.body.content === "") {
                req.flash('msg', 'Please fill something in your content')
                res.redirect("/termconditions")

            }
            var update_conditions = await db.cms.update({
                title: req.body.title,
                content: req.body.content
            }, {
                where: {
                    id: 1
                }
            })
            //     console.log(">>>>>>>>>>>>>>>>>>>>>>>", data)
            if (update_conditions == true) {
                req.flash('msg', ' Terms and conditions updated successfully')
                res.redirect("/term_conditions")
            } else {
                res.redirect("/dashboard")

            }
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>", error);


        }
    },
    privacy_policy: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')

            const policys = await db.cms.findOne({
                where: {
                    id: 2,
                }
            })
            res.render("cms/privacy&p", { policys, session: req.session, msg: req.flash('msg'), title: 'privacy_active' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_policy: async (req, res) => {
        try {


            if (req.body.content === "") {
                req.flash('msg', 'Please fill something in your content')
                res.redirect("/privacy&p")
            }
            const update = await db.cms.update({
                title: req.body.title,
                content: req.body.content
            }, {
                where: {
                    id: 2
                }
            })
            if (update) {
                req.flash('msg', 'You privacy policy update in you app ')
                res.redirect("/privacy_policy")

            }

        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>", error)

        }
    },
    faqs: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')


            res.render("cms/faqs", { session: req.session, msg: req.flash('msg'), title: 'faqs' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    add_faqs: async (req, res) => {
        try {
            const add_questions = await db.faqs.create({
                question: req.body.question,
                answer: req.body.answer
            })
            console.log(">>>>>>>>>>>>>>>>", add_questions)




            req.flash('msg', 'Your Faqs Added successfuly')
            res.redirect("/index_question")


        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
            
        }
    },
    index_question: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')
            const questions_ans = await db.faqs.findAll()
            console.log(">>>>>>>>>>>>>>>>>>>>>>", questions_ans)



            res.render("cms/index_faqs", { questions_ans, session: req.session, msg: req.flash('msg'), title: 'index_question' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    view_faqs: async (req, res) => {
        try {
            if (!req.session.user) return res.redirect('/get_login')
            const view_ans = await db.faqs.findOne({
                where:{
                id: req.params.id
                }
            })


            res.render("cms/view_faqs", { view_ans, session: req.session, msg: req.flash('msg'), title: 'faqs' })
        } catch (error) {
            console.log(">>>>>>>>>>>>>>", error)
        }
    },
    update_faqs: async (req, res) => {
        try {
            const data = await db.faqs.update({
                question: req.body.question,
                answer: req.body.answer
            }, {
                where: {
                    id: req.params.id
                }

            })
            req.flash('msg', 'Your Faqs updated successfuly')

         res.redirect("/index_question")

        } catch (error) {
            console.log(".>>>>>>>>>>>>>>>>",error);
            

        }


    },
    delete: async (req, res) => {
        try {
            model = req.body.model
            console.log("??????????????????????????????<<<<<<<<<<<<<<<<",model);
            
            
          if (model) {
                req.flash('msg', `Deleted Successfully`)
            }
            await db[model].destroy({
                where: {
                    id: req.body.id,
                }
            })
            res.send('1')
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>", error)
        }
    },
}