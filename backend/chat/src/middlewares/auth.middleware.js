const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Please Login - No auth header'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: 'Invalid Token'
            });
        }

        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Please Login - JWT Error'
        });
    }
};

module.exports = isAuth;