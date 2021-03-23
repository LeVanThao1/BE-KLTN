const express = require("express");
const { ApolloServer, graphqlExpress } = require("apollo-server-express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const app = express();
const consola = require("consola");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
const path = require("path");
app.use("*", cors({ origin: "http://127.0.0.1:8081" }));
// app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
// const {typeDefs, resolvers} = require("./graphql");
//types query/mutation/subscription
const typeDefs = mergeTypeDefs(
    loadFilesSync(path.join(__dirname, "./graphql/typeDefs"))
);

//resolvers
const resolvers = mergeResolvers(
    loadFilesSync(path.join(__dirname, "./graphql/resolvers"))
);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
    uploads: {
        maxFileSize: 300000,
        maxFiles: 4,
        // maxFieldSize: 2000000,
    },
});

app.use(cors());
server.applyMiddleware({ app });
const port = process.env.PORT || 3000;

mongoose
    .connect(
        "mongodb+srv://thaolv210402:ta210402@cluster0.2o95l.mongodb.net/express-graphql?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        }
    )
    .then(() =>
        app.listen(port, () =>
            consola.success(
                `Running a Graphql API server at http://localhost:${port}${server.graphqlPath}`
            )
        )
    )
    .catch((err) => consola.error(err));
