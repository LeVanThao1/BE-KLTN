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
                const file = await uploadFile(args.file);
                // console.log(file);
                const photo = new Photo({
                    name: file.asset_id,
                    asset_id: file.asset_id,
                    public_id: file.public_id,
                    url: file.secure_url,
                });
                await photo.save();
                return photo;
                // return file.secure_url;
                // return await Photo.create({
                //     name: file.public_id,
                //     asset_id: file.asset_id,
                //     public_id: file.public_id,
                //     url: file.secure_url,
                // });
                // return file.secure_url;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
        uploadMultiFile: async (parent, args, context, info) => {
            try {
                if (args.files.length > 10) {
                    return new ApolloError('Maxfiles only 10', 500);
                }
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
