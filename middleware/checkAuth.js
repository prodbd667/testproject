module.exports = function(req, res, next) {
    if (!req.session.role) {
        return next('(((((');
    }
    next();
}