const Yup = require('yup');

exports.schema = Yup.object().shape({
    title: Yup.string()
        .required("post title is required")
        .min(3, "post title should be between 3 and 50 characters")
        .max(50, "post title should be between 3 and 50 characters"),
    body: Yup.string().required("new post must have texts"),
    status: Yup.mixed().oneOf(
        ["public", "private"],
        "choose one of 2 status: private or public"
    ),
    thumbnail: Yup.object().shape({
        name: Yup.string().required("thumbnail image is required"),
        size: Yup.number().max(1000000, "image size must be less than 1MB"),
        mimetype: Yup.mixed().oneOf(
            ["image/jpg", "image/jpeg", "image/png"],
            "the file types that you can upload are: jpg, jpeg, png"
        ),
    }),
});