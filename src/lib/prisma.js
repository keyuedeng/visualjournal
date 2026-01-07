/* 
this file will hold a single Prisma client instance that the whole app can share
- creating a new prisma client every time a request is made is slow
- instead, this is a "connection manager" and can import it anywhere u need database access
- basically the app's database connector
*/

import { PrismaClient } from '../generated/prisma'

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.prisma
}

export default prisma