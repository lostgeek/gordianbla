import { User } from "~~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const secret = getRequestHeader(event, 'Authorization');
    try {
        const user = await User.findOne({_id: event.context.params?._id, secret: secret});
        if (!user) {
            event.node.res.statusCode = 401;
            return {message: 'Unauthorized'};
        }

        return user;
    } catch (error) {
        console.log("Error in /api/users/[_id].get.ts:", error);
        return error;
    }
});