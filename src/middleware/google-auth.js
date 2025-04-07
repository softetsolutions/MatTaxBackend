import passport from 'passport';
import {OAuth2Strategy as GoogleAuthStratgey} from 'passport-google-oauth';
import crypto from 'crypto';
// import User  from '../model/User.js';

passport.use(new GoogleAuthStratgey({
    clientID: '**********-8s614l1e19e9k8**********lek1it5fe79q2gocgf.********************',
    clientSecret: '**************-x2AmW3H9epVgmV**********************',
    callbackURL: '*oogle/callback'
},
function (accessToken, refreshToken, profile, done) {
    console.log(profile);
}
))
export default passport;
