const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;

exports.checkKey = (req, res, next) => {
    // const token = req.body.psjwt;

    console.log("headers > ", req.headers);

    // expect req headers to have string in authorization: Bearer token

    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];

    console.log("autho token ", token);

    if (token) {
        jwt.verify(token, SECRET_TOKEN, (err, decorded) => {
            if (err) {
                console.log("in checkKey Verify error > ", err.message);

                res.status(401).json({
                    success: false,
                    message: "Token verification failed",
                });
            } else {
                console.log(" Token verifed success ", decorded);
                next();
            }
        });
    } else {
        console.log("No token");

        res.status(402).json({
            success: false,
            message: "No token. Access not approved",
        });
    }
};
