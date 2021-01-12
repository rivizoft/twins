const {Router} = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const router = Router();
const User = require('../models/user');
const passport = require('passport');


router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Регистрация в Twinks',
        isRegister: true
    });
});

router.get('/login', (req, res) => {
    var flashErrors = [{ msg: req.flash('error')[0] }]
    if (!flashErrors[0].msg)
        flashErrors = null

    res.render('login', {
        title: "Авторизация | Twinks",
        isLogin: true,
        errors: flashErrors,
        successMessage: req.flash('success')[0]
    });
})

router.post('/login', 
[
    check('email').isEmail().withMessage("Введите корректный email"),
    check('password').isLength({min: 6}).withMessage("Длина пароля должна быть больше 6 символов")
],
(req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.render('login', {
            title: 'Авторизация | Twinks',
            isLogin: true,
            errors: errors.array()
        })
        return;
    }

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);

});

router.post('/register', 
[
    check('email').isEmail().withMessage("Введите корректный email"),
    check('password').isLength({min: 6}).withMessage("Пароль должен быть больше 6 символов"),
    check('login').notEmpty().withMessage("Введите имя пользователя")
], 
(req, res) => {
    const email = req.body.email
    const login = req.body.login
    const password = req.body.password

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.render('register', {
            title: 'Регистрация в Twinks',
            isRegister: true,
            errors: errors.array()
        })
        return
    }

    let user = new User({
        email: email,
        login: login,
        password: password
    })

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            user.save((err) => {
                if (err)
                {
                    var regErrors = [];
                    if (err.keyPattern.email)
                        regErrors.push({msg: 'Такая почта уже существует'});
                    if (err.keyPattern.login)
                        regErrors.push({msg: 'Такой логин уже существует'});
                    console.log(err);
                    res.render('register', {
                        title: 'Регистрация в Twinks',
                        isRegister: true,
                        errors: regErrors
                    });
                }
                else 
                {
                    req.flash('success', 'Вы успешно зарегистрировались!');
                    res.redirect('/login');
                }
            });
        });
    });
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Вы вышли из своего аккаунта');
    res.redirect('/login');
});

module.exports = router;