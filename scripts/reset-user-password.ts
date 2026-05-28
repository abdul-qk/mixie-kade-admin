import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({ path: '.env' })

type CliArgs = {
  email?: string
  id?: string
  password?: string
}

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2)
  const parsed: CliArgs = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const next = args[i + 1]

    if (arg === '--email' && next) {
      parsed.email = next
      i++
      continue
    }

    if (arg === '--id' && next) {
      parsed.id = next
      i++
      continue
    }

    if (arg === '--password' && next) {
      parsed.password = next
      i++
      continue
    }
  }

  return parsed
}

const printUsageAndExit = () => {
  console.error(
    'Usage: pnpm reset:password -- --email <user@email.com> --password <newPassword> OR --id <userId> --password <newPassword>',
  )
  process.exit(1)
}

const { email, id, password } = parseArgs()

if (!password || (!email && !id) || (email && id)) {
  printUsageAndExit()
}

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
const usersCollection = 'users'

if (id) {
  await payload.update({
    collection: usersCollection,
    id,
    data: {
      password,
    },
  })

  console.log(`Password reset successful for user id "${id}".`)
  process.exit(0)
}

const users = await payload.find({
  collection: usersCollection,
  where: {
    email: {
      equals: email,
    },
  },
  depth: 0,
  limit: 1,
})

const user = users.docs[0]

if (!user) {
  console.error(`No user found with email "${email}".`)
  process.exit(1)
}

await payload.update({
  collection: usersCollection,
  id: user.id,
  data: {
    password,
  },
})

console.log(`Password reset successful for "${email}".`)
process.exit(0)
