const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = {
    createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
            .then((foundUser) => {
                if (foundUser) {
                    throw new Error('user already exist');
                }
                return bcrypt.hash(args.userInput.password, 12);
            })
            .then((hashedPassword) => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save().then((data) => {
                    console.log(data);
                    return {
                        ...data._doc,
                        //NO NEED TO USE THIS
                        _id: data.id,
                        password: null
                    };
                });
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    },
    login: async ({ email, password }) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User not found');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('Wrong password');
        }
        //add extra info to token & sync task
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'goacsecretkey',
            {
                expiresIn: '1h'
            }
        );

        return { userId: user.id, token: token, tokenExpiration: 1 };
    }
};
