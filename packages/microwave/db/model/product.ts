import { Schema, model } from 'mongoose'

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    unit: {
      type: String, // TODO: make this into an enum with explicit list
      required: true
    },
    value: Number
  },
  poster: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  tags: [
    {
      type: String,
      enum: ['VERIFIED', '1ST_POST', 'POPULAR']
    }
  ],
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Product = model('Product', ProductSchema)
