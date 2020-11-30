const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
    //ADD RETURN TO TELL GRAPHQL ITS ASYNC CODE SAME AS ASYNC/AWAIT
    events: () => {
        //add return to tell graphql is async and wait till finish
        return Event.find()
            .then((events) => {
                return events.map((event) => {
                    return transformEvent(event);
                });
            })
            .catch((err) => {
                throw err;
            });
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthorized!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        let createdEvent;
        //so graphql knows if this resolver executes async and it will wait to complete
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId);
            if (!creator) {
                throw new Error('User not found');
            }
            //pass event object to user
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        }
        // return event
        //     .save()
        //     .then((data) => {
        //         createdEvent = transformEvent(data);
        //         return User.findById(req.userId);
        //     })
        //     .then((foundUser) => {
        //         if (!foundUser) {
        //             throw new Error('User not found');
        //         }
        //         //pass the event object to user
        //         foundUser.createdEvents.push(event);
        //         return foundUser.save();
        //     })
        //     .then(() => {
        //         return createdEvent;
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //         throw err;
        //     });
    }
};
