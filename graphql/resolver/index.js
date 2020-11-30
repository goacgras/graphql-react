const authResolver = require('./auth');
const eventsResolver = require('./events');
const bookingResolver = require('./booking');

const rootResolver = {
    ...authResolver,
    ...eventsResolver,
    ...bookingResolver
};

module.exports = rootResolver;

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
