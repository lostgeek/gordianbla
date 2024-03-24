import { User } from '~~/server/models/user.schema'

export default defineEventHandler(async (event) => {
  const inviteLink = event.context.params?._link
  try {
    const user = await User.findOne({
      'inviteLinks.link': inviteLink,
    })
    if (!user) {
      event.node.res.statusCode = 401
      return { message: 'Unauthorized' }
    }

    const invite = user.inviteLinks.find(({ link }) => link === inviteLink)
    if (!invite)
      throw new Error(`Invite ${inviteLink} not found.`)

    const now = new Date()
    if (invite.expiration && now > invite.expiration) {
      await invite.deleteOne()
      await user.save()
      event.node.res.statusCode = 410
      return { message: 'Link expired' }
    }

    // Delete invite after usage
    await invite.deleteOne()
    await user.save()

    return user
  } catch (error) {
    console.error('Error in /api/invites/[_link]/users/index.get.ts:', error)
    return error
  }
})
