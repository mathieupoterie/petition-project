const util = require("../config/utilities");
const db = require('../config/database');
const auth = require('../config/authentification');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const redis = require('../config/cache');


var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })



var express = require('express'),
router = express.Router();



router.get('/', function(req, res){
    res.redirect('/petition');
})




router.route('/register')

.get(csrfProtection, function(req, res){
    var menu = {link : "link", register : "register", login : "login"}
    res.render('register', {
        csrfToken: req.csrfToken(),
        menu : menu,
        gif : "https://media.giphy.com/media/d8WjGORtSEWqc/giphy.gif"
    });
})

.post(parseForm, csrfProtection, function(req, res){
    var firstName = req.body.first;
    var lastName = req.body.last;
    var email = req.body.email;
    var plainTextPassword = req.body.password;
    var date = util.createNewDate();
    if (plainTextPassword.length < 5) {
        var menu = {link : "link", register : "register", login : "login"}
        res.render('register', {
            gif : "https://media.giphy.com/media/d8WjGORtSEWqc/giphy.gif",
            menu : menu,
            password_err : "Please choose a longer password (more than 5 caracters.)"
        });
    }
    auth.hashPassword(plainTextPassword, function(err, hashedPassword){
        if(err != null){
            console.log(err);
            return;
        }else {
            db.register(firstName, lastName, email, hashedPassword, date).then(function(results){
                console.log(results.rows[0]);
                req.session.user = results.rows[0];
                res.redirect('/profile')
            }).catch(function(err){
                var menu = {link : "link", register : "register", login : "login"}
                res.render('register', {
                    gif : "https://media.giphy.com/media/d8WjGORtSEWqc/giphy.gif",
                    menu : menu,
                    existingemail : `Ouch, this email already exist ! If you already have an account, please log in. If not, pick another email adress !`
                });
                console.log(err);
            })
        }
    })
});


router.route('/login')

.get(csrfProtection, function(req, res){
    var menu = {link : "link", register : "register", login : "login"};
    res.render('login', {
        csrfToken: req.csrfToken(),
        menu : menu,
        gif : "https://media.giphy.com/media/26ufm2tI0ODxTeRr2/giphy.gif"
    });
})

.post(parseForm, csrfProtection, function(req, res){
    var data = req.body;
    var email = data.email;
    var password = data.password;
    db.login(email).then(function(results){
        var hashedPassword = results.password;
        auth.checkPassword(password, hashedPassword, function(err, doesMatch){
            if(err != null){
                return;
            }else {
                req.session.user = results;
                if (doesMatch) {
                    db.getProfile(email).then(function(results){
                        if(results.rows[0] === undefined){
                            res.redirect("/profile")
                        }else {
                            res.redirect("/petition");
                        }
                    }).catch(function(e){
                        console.log("here?");
                        console.log(e);
                    })

                }else {
                    console.log("ERROR 175");
                    var menu = {link : "link", register : "register", login : "login"}
                    res.render("login", {
                        menu : menu,
                        gif : "https://media.giphy.com/media/26ufm2tI0ODxTeRr2/giphy.gif",
                        passworderror : "You entered a wrong password !"
                    })
                }
            }
        })
    }).catch(function(err){
        res.redirect('/login');
    })
});


router.route('/profile')

.get(csrfProtection, function(req, res){
    var menu = { logout: "logout",  link : "link"};
    res.render('profile', {
        menu : menu,
        csrfToken: req.csrfToken(),
    })
})

.post(parseForm, csrfProtection, function(req, res){
    age = req.body.age;
    city = req.body.city;
    homepage = req.body.homepage;
    userID = req.session.user.id

    db.postProfile(userID, age, city, homepage).then(function(results){
        redis.deleteCache();
        db.getNameAndSignature().then(function(results){
            if(results === undefined){
                res.redirect('/petition');
            }else {
                res.redirect('/signed');
            }
        }).catch(function(e){
            console.log(e);
        })
    }).catch(function(err){
        console.log(err);
    })

});


router.route('/petition')

.get(csrfProtection, function(req, res) {
    email = req.session.user.email;
    db.hasSigned(email).then(function(results){
        if (results.rows[0]) {
            res.redirect('/signed?already_signed=1')
        }else {
            firstName = req.session.user.first_name;
            lastName = req.session.user.last_name;
            var menu = { logout: "logout",  link : "link"}
            res.render('petition', {
                menu : menu,
                gif : "https://media.giphy.com/media/lfI3HytbkYq1q/giphy.gif",
                firstName : firstName,
                lastName : lastName,
                csrfToken: req.csrfToken()
            })
        }
    }).catch(function(e){
        console.log(e);
    })
})

.post(parseForm, csrfProtection, function(req, res) {
    var signature = req.body.sig;
    var userId = req.session.user.id;
    firstName = req.session.user.first_name;
    lastName = req.session.user.last_name;
    db.signPetition(userId, signature).then(function(results){
        redis.deleteCache();
        if (!req.session.user.signatureID) {
            req.session.user.signatureID = results.rows[0].id;
        }
        res.redirect('/signed');
    }).catch(function(err){
        console.log(err);
        var menu = { logout: "logout",  link : "link"}
        res.render('petition', {
            menu : menu,
            error :  "You forgot to sign !",
            gif : "https://media.giphy.com/media/lfI3HytbkYq1q/giphy.gif",
            firstName : firstName,
            lastName : lastName,
            csrfToken: req.csrfToken()
        })
    })

});



router.get('/signed', function(req, res){
    var email = req.session.user.email;
    console.log(email);
    db.getNameAndSignature(email).then(function(results){
        if(results.rows[0] === undefined){
            res.redirect("/petition");
        }else{
            // redis HERE!!!
            const signatureSrc = results.rows[0].signature;
            db.getSigners().then(function(results){
                var signersNumber = results.rows.length;
                data = results.rows[0];
                const firstName = results.first_name;
                var menu = { edit : "edit",  logout: "logout",seesigners : "seesigners"}
                res.render("signed", {
                    menu : menu,
                    gif : "https://media.giphy.com/media/5xtDarmwsuR9sDRObyU/giphy.gif",
                    signed : req.query.already_signed && "You already signed the petition, thank you !",
                    profileUpdated : req.query.profile_updated && "Your profile has been successfully updated !",
                    signatureSrc : signatureSrc,
                    firstName : firstName,
                    signersNumber : signersNumber
                })
            })
        };
    }).catch(function(e){
        console.log(e);
        res.redirect("/petition")
    });
});


router.get('/signers', function(req, res){
    console.log(redis.checkCache());
    if(!redis.checkCache()){
        db.getSigners().then(function(results){
            console.log("there is no cache");;
            var signersData = JSON.stringify(results.rows[0])
            redis.setCache(signersData);
            var signers = results.rows;
            var menu = { edit : "edit",  logout: "logout", signed : "signed",}
            res.render('signers', {
                menu : menu,
                gif : "https://media.giphy.com/media/yIg8XHQXV3mFy/giphy.gif",
                signers: signers
            })
        }).catch(function(e){
            console.log(e);
        })
    }else{
        console.log(redis.checkCache());
        redis.checkCache().then(function(results){
            console.log("there is a cache");
            console.log(results);
        })
    };
    // pamplemousse


});




router.get(`/signers/:city`, function(req, res){
    var city = req.params.city;
    db.getCitizens(city).then(function(results){
        console.log(results,"ICIIII !");
        var menu = { signed : "signed",  edit : "edit",  logout: "logout", back : "back"}
        res.render('city', {
            menu : menu,
            city : city,
            results : results,
            gif : 'https://media.giphy.com/media/caJ3e5mubnTEY/giphy.gif'
        })
    })
});


router.route('/edit')

.get(csrfProtection, function(req, res){
    console.log(req.session.user);
    var email = req.session.user.email;
    db.getProfile(email).then(function(results){
        var data = results.rows[0];
        //console.log(data);
        var menu = { signed : "signed",  logout: "logout", seesigners : "seesigners"}
        res.render('edit-profile', {
            menu : menu,
            csrfToken: req.csrfToken(),
            gif :'https://media.giphy.com/media/NnyqfcowpXZOU/giphy.gif',
            results : data,
            password_err : req.query.tinypassword && "Please choose a bigger password (more than 5 caracters)",
        })
    }).catch(function(e){
        console.log(e);
    })
})

.post(parseForm, csrfProtection, function(req, res){
    var email = req.session.user.email;
    var userId= req.session.user.id;
    db.getProfile(email).then(function(results){
        var data = results.rows[0];

        if(req.body.password.length !=0){
            if (req.body.password.length < 5) {
                res.redirect('/edit?tinypassword=1')
            }else{
                plainTextPassword = req.body.password
                auth.hashPassword(plainTextPassword, function(err, hashedPassword){
                    if(err){
                        console.log(err);
                        return;
                    }else {
                        var newPassword = hashedPassword;
                        db.checkEditPageInfo(data, req.body, userId).then(function(results){
                            db.checkRegisteringInfo(req.body.last_name, req.body.first_name, req.body.email, newPassword, userId)
                            .then(function(results){
                                redis.deleteCache();
                                if (!req.session.user) {
                                    return res.sendStatus(403);
                                }else{
                                    req.session.user = results.rows[0];
                                }
                                res.redirect('/signed?profile_updated=1');
                            })
                        }).catch(function(e){
                            console.log("there was an error in this exact spot" , e);
                        })
                    }
                })
            }

        }else{
            var newPassword = data.password;
            db.checkEditPageInfo(data, req.body, userId).then(function(results){
                db.checkRegisteringInfo(req.body.last_name, req.body.first_name, req.body.email, newPassword, userId)
                .then(function(results){
                    redis.deleteCache();
                    if (!req.session.user) {
                        return res.sendStatus(403);
                    }else{
                        req.session.user = results.rows[0];
                    }
                    res.redirect('/signed?profile_updated=1');
                })
            }).catch(function(e){
                console.log(e);
            })
        }


    }).catch(function(e){
        console.log(e);
    })
})


router.get('/logout', function(req, res){
    //req.session.user = null;
    req.session.destroy();
    res.redirect('/register')
})

router.get('/delete', function(req, res){
    userID = req.session.user.id;
    db.deletePetition(userID).then(function(results){
        console.log("success!");
        res.redirect('/petition')
    }).catch(function(e){
        console.log("error ici !");
    })
    console.log(req.session);
})




module.exports = router;
