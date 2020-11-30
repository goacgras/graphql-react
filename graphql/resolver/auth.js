const bcrypt = require('bcryptjs');
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
    }
};
