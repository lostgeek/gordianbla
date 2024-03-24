import crypto from 'node:crypto'
import { Invite, User } from '~~/server/models/user.schema'

export default defineEventHandler(async (event) => {
  const secret = getRequestHeader(event, 'Authorization')
  const userId = event.context.params?._id

  try {
    const user = await User.findOne({ _id: userId, secret })
    if (!user) {
      event.node.res.statusCode = 401
      return { message: 'Unauthorized' }
    }

    // 3 min default expiration time
    const expiration = new Date()
    expiration.setTime(expiration.getTime() + 3 * 60 * 1000)

    const invite = new Invite({
      link: crypto.randomBytes(4).toString('hex'),
      expiration,
    })
    user.inviteLinks.push(invite)
    await user.save()

    return invite
  } catch (error) {
    console.error('Error in /api/users/[_id]/invites/index.post.ts:', error)
    return error
  }
})
