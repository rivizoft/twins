const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function(passport)
{
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },(username, password, done) => {
        let query = { email: username };
        console.log(query);
        User.findOne(query, (err, user) => {
            if (!user)
                return done(null, false, { message: 'Такая почта не зарегистрирована' });
            bcrypt.compare(password, user.password, (err, success) => {
                if (success)
                    return done(null, user);
                else
                    return done(null, false, { message: 'Неправильная почта или пароль' });
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    });
}