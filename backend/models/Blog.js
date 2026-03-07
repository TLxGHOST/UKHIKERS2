import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({

  title:String,
  excerpt:String,
  imageUrl:String,

  price:Number,
  duration:String,
  difficulty:String,
  location:String,

  tags:[String],

  content:[
    {
      type:Object
    }
  ]

});

export default mongoose.model("Blog",BlogSchema);