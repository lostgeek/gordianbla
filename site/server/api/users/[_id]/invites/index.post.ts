import { User, Invite } from "~~/server/models/user.schema";
import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
    const secret = getRequestHeader(event, 'Authorization');
    const userId = event.context.params?._id;

    try {
        const user = await User.findOne({_id: userId, secret: secret});
        if (!user) {
            event.node.res.statusCode = 401;
            return {message: 'Unauthorized'};
        }

        // 3 min default expiration time
        var expiration = new Date();
        expiration.setTime(expiration.getTime() + 3*60*1000);

        const invite = new Invite({
            link: crypto.randomBytes(4).toString('hex'),
            expiration: expiration,
        });
        user.inviteLinks.push(invite);
        await user.save();

        return invite;
    } catch (error) {
        return error;
    }
});