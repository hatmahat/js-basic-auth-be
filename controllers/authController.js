const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hadleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd)
        return res
            .status(400)
            .json({ message: `Username and password are required.` });

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401); // Unauthorized
    // evaluate password
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        // create JWTs
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles: roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10s" }
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();

        res.cookie("jwt", refreshToken, {
            httpOnly: true, // not available to javascript, and much more sercure than saving in cookie or localstorage
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        }); // secure: true,
        console.log("ROLES", roles.filter(role =>  role != undefined));
        res.json({ accessToken, roles });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { hadleLogin };
