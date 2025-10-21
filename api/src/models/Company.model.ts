import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    //auto assigned fields (_id, __v)
    name: {
      type: String,
      unique: true,
      required: [true, "Please provide a name"],
    },
    user_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    bucket_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bucket",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

schema.pre("save", async function (next: any) {
  try {
    next();
  } catch (err: any) {
    console.error(`Mongo company pre save error: ${err.message}`);
    next(err);
  }
});

const Company = model("Company", schema);
export default Company;
