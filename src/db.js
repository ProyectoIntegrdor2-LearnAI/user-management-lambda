import moongoose from "mongoose";

export const connectDB = async () => {
  try {
        await moongoose.connect("mongodb://localhost/usersdb");
        console.log("DB connected");
  } catch (error) {
    console.error(error);
  }
}