const { ApolloError } = require('apollo-server-errors');
const cloudinary = require('cloudinary');
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
// A simple function to upload to Cloudinary
const uploadFile = async (file, type = 'avatar') => {
    // The Upload scalar return a a promise
    const { createReadStream } = await file;
    const fileStream = createReadStream();

    // Initiate Cloudinary with your credentials
    cloudinary.v2.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
    });
    if (!file) throw new ApolloError('No files were uploaded');

    // if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
    //     throw new ApolloError("File format in correct");
    // }
    // Return the Cloudinary object when it's all good
    return new Promise((resolve, reject) => {
        console.log(1);
        const cloudStream = cloudinary.v2.uploader.upload_stream(
            {
                folder: 'Dino_Store/' + type,
                width: 150,
                height: 150,
                crop: 'fill',
            },
            (err, fileUploaded) => {
                console.log(1);
                // In case something hit the fan
                if (err) {
                    console.log('errrr ..... ', e);
                    reject(err);
                }

                // All good :smile:
                resolve(fileUploaded);
            }
        );

        fileStream.pipe(cloudStream);
    });
};

module.exports = uploadFile;
