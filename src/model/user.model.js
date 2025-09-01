import moongoose from "mongoose";

const userSchema = new moongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    }
});

export default moongoose.model("User", userSchema);