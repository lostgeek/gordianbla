import crypto from "node:crypto";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    body.secret = crypto.randomBytes(48).toString('base64');

    try {
        return await new UserSchema(body).save();
    } catch (error) {
        return error;
    }
});