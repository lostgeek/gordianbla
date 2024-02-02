import { User } from "~~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const secret = getRequestHeader(event, 'Authorization');
    const update = await readBody(event);

    try {
        const user = await User.findOneAndUpdate({_id: event.context.params?._id, secret: secret}, update);
        if (!user) {
            event.node.res.statusCode = 401;
            return {message: 'Unauthorized'};
        }

        return user;
    } catch (error) {
        console.log("Error in /api/users/[_id].patch.ts:", error);
        return error;
    }
});