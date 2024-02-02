import { Schema, Types, model } from "mongoose";

interface IInvite {
    link: string,
    expiration?: Date,
}

export const InviteSchema = new Schema<IInvite>(
    {
        link: {
            type: String,
            required: true,
            index: true,
        },
        expiration: Date,
    },
    { timestamps: true }
);

export const Invite = model("Invite", InviteSchema);

interface IUser {
    secret: String,
    inviteLinks: Types.DocumentArray<IInvite>,
    dailyHistory: Schema.Types.Map,
    importedStats: Schema.Types.Map,
    offsetStats: Schema.Types.Map,
    dailyStandardHistory: Schema.Types.Map,
    dailyNeoHistory: Schema.Types.Map,
    dailyStartupHistory: Schema.Types.Map,
}

export const UserSchema = new Schema<IUser>(
    {
        secret: String,
        inviteLinks: [InviteSchema],
        dailyHistory: Map,
        importedStats: Map,
        offsetStats: Map,
        dailyStandardHistory: Map,
        dailyNeoHistory: Map,
        dailyStartupHistory: Map,
    },
    { timestamps: true }
);

export const User = model("User", UserSchema);
