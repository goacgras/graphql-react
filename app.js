const express = require('express');
const bodyparser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyparser.json());

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

app.use(
    '/graphql',
    graphqlHTTP({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
                creator: User!
            }

            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input UserInput {
                email: String!
                password: String!
            }

            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        //METHOD
        rootValue: {
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
            }
        },
        graphiql: true
    })
);

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@gras-clusters.dh5gg.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
        app.listen(5000);
    })
    .catch((err) => {
        console.log(err);
    });
