const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username });

        //check if user is valid
        if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
        }
        
        //check if password matches
        const ok = await bcrypt.compare(password, user.passwordhash);
        if (!ok) {
            return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);

    }catch (err) {
        return done(err);
    }
}));

passport.serializeUser(function(user, done) {
    // Serialize the user ID to store in the session
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        // Find the user by ID from the database
        const user = await User.findById(id);
        // Deserialize the user object
        done(null, user);
    } catch (err) {
        done(err);
    }
});