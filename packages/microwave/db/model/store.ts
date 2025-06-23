import { InferSchemaType, Schema, model } from 'mongoose'

const StoreSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  googlePlaceId: {
    type: String,
    unique: true
  }, // Should this be required?
  location: {
    longitude: Number,
    latitude: Number
  },
  address: {
    type: String,
    required: true
  },
  iconUrl: String
})

export type StoreType = InferSchemaType<typeof StoreSchema>
export const Store = model('Store', StoreSchema)
