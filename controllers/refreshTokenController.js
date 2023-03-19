const usersDB = {
    users: require("../model/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = (req, res) => {
    let cookies = req.cookies; // belum ada di cookies
    // cookies = {"jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFtaWN1cyIsImlhdCI6MTY3OTEzNDg0NSwiZXhwIjoxNjc5MjIxMjQ1fQ.Aov5j9p1muhJJkbBHNwwRYfl4Kx86DrJYeER1fVJJCI"}
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = usersDB.users.find(
        (person) => person.refreshToken === refreshToken
    );
    if (!foundUser) return res.sendStatus(403); //Forbidden
    // evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username)
                return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: decoded.username,
                        roles: roles,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "120s" }
            );
            res.json({ accessToken });
        }
    );
};

module.exports = { handleRefreshToken };