import { InferSchemaType, Schema, model } from 'mongoose'


const MoneySchema = new Schema({
  currencyCode: {
    type: String,
    enum: ['USD', 'KRW'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
})

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
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  tags: [
    {
      type: String,
      enum: ['VERIFIED', '1ST_POST', 'POPULAR']
    }
  ],
  price: {
    type: MoneySchema,
    required: true
  },
  image: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export type ProductType = InferSchemaType<typeof ProductSchema>
export const Product = model('Product', ProductSchema)