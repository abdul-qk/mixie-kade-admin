import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({ path: '.env' })

type CliArgs = {
  email?: string
  id?: string
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
  }

  return parsed
}

const printUsageAndExit = () => {
  console.error('Usage: pnpm grant:admin -- --email <user@email.com> OR --id <userId>')
  process.exit(1)
}

const { email, id } = parseArgs()

if ((!email && !id) || (email && id)) {
  printUsageAndExit()
}

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
const usersCollection = 'users'

let userId = id as string | undefined
let userEmail = email as string | undefined
let roles: string[] = []

if (email) {
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

  userId = String(user.id)
  userEmail = user.email ?? email
  roles = ((user.roles as string[] | null | undefined) ?? []).filter(Boolean)
} else if (id) {
  const user = await payload.findByID({
    collection: usersCollection,
    id,
    depth: 0,
  })

  if (!user) {
    console.error(`No user found with id "${id}".`)
    process.exit(1)
  }

  userId = String(user.id)
  userEmail = user.email ?? undefined
  roles = ((user.roles as string[] | null | undefined) ?? []).filter(Boolean)
}

if (!userId) {
  console.error('Could not resolve target user.')
  process.exit(1)
}

if (roles.includes('admin')) {
  console.log(`User "${userEmail ?? userId}" already has admin access.`)
  process.exit(0)
}

await payload.update({
  collection: usersCollection,
  id: userId,
  data: {
    roles: [...new Set([...roles, 'admin'])],
  },
})

console.log(`Admin access granted to "${userEmail ?? userId}".`)
process.exit(0)
