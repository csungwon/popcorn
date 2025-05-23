import passport from 'passport';

export const jwtAuthenticator = passport.authenticate("jwt", { session: false });