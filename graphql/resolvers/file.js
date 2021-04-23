const { ApolloError, AuthenticationError } = require('apollo-server-express');
const uploadFile = require('../../helper/uploadFile');
const { Photo } = require('../../models');

module.exports = {
    Query: {
        photo: async (parent, args, context, info) => {
            try {
                return await Photo.findById(args.id);
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
    Mutation: {
        uploadSingleFile: async (parent, args, context, info) => {
            try {
                // console.log(await args.file);
                const file = await uploadFile(args.file);
                // const photo = new Photo({
                //     name: args.file.filename,
                //     asset_id: file.asset_id,
                //     public_id: file.public_id,
                //     url: file.secure_url,
                // });
                // await photo.save();
                return file.secure_url;
                // return await Photo.create({
                //     name: args.file.filename,
                //     asset_id: file.asset_id,
                //     public_id: file.public_id,
                //     url: file.secure_url,
                // });
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        uploadMultiFile: async (parent, args, context, info) => {
            try {
                const files = await Promise.all(args.files);
                const file_urls = files.map(async (file) => {
                    const result = await uploadFile(file, 'book');
                    const data = await Photo.create({
                        name: file.filename,
                        asset_id: result.asset_id,
                        public_id: result.public_id,
                        url: result.secure_url,
                    });
                    return data;
                });

                return file_urls;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
