const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

// YOU DONT NEED THIS. USE MONGOOSE-AUTOPOPULATE

// const findEvents = (eventIds) => {
//     //find list of events where id in eventIds : $in
//     return Event.find({ _id: { $in: eventIds } })
//         .then((events) => {
//             return events.map((evnt) => {
//                 return {
//                     ...evnt._doc,
//                     creator: findUser.bind(this, evnt.creator)
//                 };
//             });
//         })
//         .catch((err) => {
//             throw err;
//         });
// };

// const findUser = (userId) => {
//     return User.findById(userId)
//         .then((foundUser) => {
//             return {
//                 ...foundUser._doc,
//                 createdEvents: findEvents.bind(
//                     this,
//                     foundUser._doc.createdEvents
//                 )
//             };
//         })
//         .catch((err) => {
//             throw err;
//         });
// };

module.exports = {
    //ADD RETURN TO TELL GRAPHQL ITS ASYNC CODE SAME AS ASYNC/AWAIT
    events: () => {
        //add return to tell graphql is async and wait till finish
        return Event.find()
            .then((events) => {
                return events.map((event) => {
                    return {
                        ...event._doc,
                        //NO NEED TO USE THIS
                        _id: event.id,
                        date: new Date(event._doc.date).toISOString(),
                        creator: {
                            ...event._doc.creator._doc
                        }
                    };
                });
            })
            .catch((err) => {
                throw err;
            });
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map((booking) => {
                return {
                    ...booking._doc,
                    user: {
                        ...booking._doc.user._doc
                    },
                    event: {
                        ...booking._doc.event._doc
                    },
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5fbf24d508089c1a04171454'
        });
        let createdEvent;
        //so graphql knows if this resolver executes async and it will wait to complete
        return event
            .save()
            .then((data) => {
                createdEvent = {
                    ...data._doc,
                    date: new Date(data._doc.date).toISOString(),
                    creator: { ...data._doc.creator._doc }
                };
                return User.findById('5fbf24d508089c1a04171454');
            })
            .then((foundUser) => {
                if (!foundUser) {
                    throw new Error('User not found');
                }
                //pass the event object to user
                foundUser.createdEvents.push(event);
                return foundUser.save();
            })
            .then(() => {
                return createdEvent;
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    },
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
    bookEvent: async (args) => {
        const foundEvent = await Event.findOne({ _id: args.eventId });
        const newBooking = new Booking({
            user: '5fbf26e9e6475b12e02efd59',
            event: foundEvent
        });
        const result = await newBooking.save();
        return {
            ...result._doc,
            user: {
                ...result._doc.user._doc
            },
            event: {
                ...result._doc.event._doc
            },
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        };
    },
    cancelBooking: async (args) => {
        try {
            const foundBooking = await Booking.findById(args.bookingId);
            const event = {
                ...foundBooking._doc.event._doc,
                creator: {
                    ...foundBooking._doc.event._doc.creator._doc
                }
            };
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            console.log(err);
        }
    }
};
