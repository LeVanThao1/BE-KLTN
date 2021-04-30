const express = require('express');
const {
    ApolloServer,
    graphiqlExpress,
    graphqlExpress,
    graphqlConnect,
} = require('apollo-server-express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const app = express();
const { execute, subscribe } = require('graphql');
const consola = require('consola');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');
const path = require('path');
const { pubsub } = require('./graphql/configs/index');
const http = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
app.use('*', cors({ origin: 'http://localhost:4000' }));

// app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
// const {typeDefs, resolvers} = require("./graphql");
//types query/mutation/subscription
const typeDefs = mergeTypeDefs(
    loadFilesSync(path.join(__dirname, './graphql/typeDefs'))
);
//resolvers
const resolvers = mergeResolvers(
    loadFilesSync(path.join(__dirname, './graphql/resolvers'))
);

// app.use(function (req, res, next) {
//     console.log("Time:", Date.now());
//     next();
// });

// app.use(
//     "/graphql",
//     bodyParser.json(),
//     graphqlExpress({
//         schema: typeDefs,
//     })
// );

// app.use(
//     "/graphql",
//     graphiqlExpress({
//         endpointURL: "/graphql",
//         subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
//     })
// );
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res, connection }) => ({ req, res, connection }),
    uploads: {
        maxFileSize: 300000000,
        maxFiles: 10,
        // maxFieldSize: 2000000,
    },
    subscriptions: {
        path: '/subscriptions',
        onConnect: () => console.log('Connected to websocket'),
        onDisconnect: () => console.log('Disconected to websocket'),
    },
    tracing: true,
});

app.use(cors());
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const PORT = process.env.PORT || 3000;

mongoose
    .connect(
        'mongodb+srv://thaolv210402:ta210402@cluster0.2o95l.mongodb.net/express-graphql?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        }
    )
    .then(() =>
        httpServer.listen(PORT, () => {
            consola.success(
                `Running a Graphql API server at http://localhost:${PORT}${server.graphqlPath}`
            );
            consola.success(
                `Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
            );
        })
    )
    .catch((err) => consola.error(err));
