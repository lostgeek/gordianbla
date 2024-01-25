export default defineEventHandler(async (event) => {
    const secret = getRequestHeader(event, 'Authorization');
    try {
        const user = await UserSchema.findOne({_id: event.context.params?._id, secret: secret});
        if (!user) {
            event.node.res.statusCode = 401;
            return {message: 'Unauthorized'};
        }

        return user;
    } catch (error) {
        return error;
    }
});