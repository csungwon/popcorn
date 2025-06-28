import { InferSchemaType, Schema, model } from 'mongoose';

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
  }
})

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
    type: PointSchema,
    required: true,
    index: '2dsphere'
  },
  address: {
    type: String,
    required: true
  },
  iconUrl: String
}, {
    toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      // Transform the location field
      if (ret.location && Array.isArray(ret.location.coordinates) && ret.location.coordinates.length === 2) {
        const [longitude, latitude] = ret.location.coordinates;
        ret.location = { latitude, longitude }; // Reformat to desired client structure
      }

      return ret;
    }
  },
})

export type StoreType = InferSchemaType<typeof StoreSchema>
export const Store = model('Store', StoreSchema)
