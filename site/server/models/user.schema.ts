import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose';

export const UserSchema = defineMongooseModel({
  name: 'User',
  schema: {
    secret: {
      type: Schema.Types.String,
    },
    dailyHistory: {
      type: Schema.Types.Map,
    },
    importedStats: {
      type: Schema.Types.Map,
    },
    offsetStats: {
      type: Schema.Types.Map,
    },
    dailyStandardHistory: {
      type: Schema.Types.Map,
    },
    dailyNeoHistory: {
      type: Schema.Types.Map,
    },
    dailyStartupHistory: {
      type: Schema.Types.Map,
    },
  },
})