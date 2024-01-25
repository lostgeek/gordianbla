import crypto from "node:crypto";
import { User } from "~~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    body.secret = crypto.randomBytes(48).toString('base64');

    try {
        return await new User(body).save();
    } catch (error) {
        return error;
    }
});