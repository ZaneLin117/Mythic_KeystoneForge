import type { SampleRoute } from '../../util/types.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import { decodeMdtString } from '../../util/mdt/mdt2.ts'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'
import { beifengRouteStrings } from './beifengRouteStrings.ts'
import { huolingRouteStrings } from './huolingRouteStrings.ts'

type SampleRouteDefinition = Omit<SampleRoute, 'route'> & {
  mdt: string
  name?: string
}

export const sampleRouteDefinitions: Record<DungeonKey, SampleRouteDefinition[]> = {
  fang: [
    {
      mdt: '!~MDT2~XZHdTtswGIZnO3HaJE76Q6UdInE+VVM10UNEKwQ7GNO0C2jTz5Bhkimx+Tmr3cAFcAngcp1TVra0HNqvn+979fh1IuFO/pwAnykh9+VlAZBcQik/pfnkFuAKnS1SztNECXmPj1W6OLudFeLLFRx+LqY3M6Hg9WuiigIyea6E+PDt7fBDzQXcgEDf3y4mKruAPDtd3H20pyUISGSaZ8vpbyVE+bSmlUuJ4xnq+RoFq/7eYJrkIi9ODjgfDTm3SGOq214VDEL2L6qDcR0humoh7JlWe5saDddIO9SwyKv6e92er0lDzg85XyNNqAlCz0Sxr3HD1vRzpNH2otHQ4oco7iBMDMJhE9bRmFtcOS71iHbCZlLNcW7xKggZMX4QNg3q5qOhjTXqGoQHBm1BNfZCTBizFSb/94w3tdq7m/++ZBEzjvtOi/uIMHFc2tKIGT/YNWPdRxbFnW6vpTGrqNeY26ix1MQdXzusiuJef9eMRaae6jDT/NLG0EtHo/57M+eQwfX9UVmmF9k1ZLJcnuTzX5DIcvkH',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  kr: [
    {
      mdt: '!~MDT2~ZVBdT9RQEHXutt1PFlZARvxCgfBmmlgT+mjcDUEexBh/ANudC5W7LWnvRfZtp8EEX/0JbMG/aaqQbfVxZs45c8657Wu60F/6JI+M0hv6JCEKTijVr8O4/43oFD6MQinDwCg9Ee9NODoYe8nwNFVvJm93B+dHytDtQWCShCJ9aJR68PFu+GyGis5Jwae7Rd9ExxRH+6OL3n5KigIdxtF0cGaUSn/OIKtZ4gpEzbKdemMQxCpO9jal9Fwpc/G92Wp3uhYLO7Ps+2Nx8mVeY8tisC/rDXDKPM+9dhjm4OGulLMuw+J8KWUBnDUZWpfF67Ky5+Zthg7DQhnvub6c1RkaZeVC5nqpDPMLeo8B13/cR2ridgZiTvoTrMcC169a7c5Cd3Gph9vZ3IP/19tDBnxedSDlzXIGYiUT1mpm2bhT9eLLm2WurWbCWctsB3dYVFvJVxgeMaxV3BTl/MInDPiUAZ8x4CsG3GTArf/qQmTAl9WnnpvjYwZ8wYAb/xZ2SBGNJ+/SNDyOxhTpdLoXD79SoNPpbw==',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  murd: [
    {
      mdt: '!~MDT2~XZBJbxNBEIWp7p59sZ2wNCAkFglukQ+OkjkibEUhB4IQPyAedyeDOzPIM+MkN1djWznzC5C8/E40IWhiH6ue3qtX37pbiOvie1fIs1IVr4uLkRDxhciLvSTrXgkxhM+DRMokLlVxQz6VyeBkWI7H+8ODdLCf9MZnqhTrk7gcjURanJZKPfpyP3wr+0qMhYKv94tumZ6LLD0eXPM/x7lQIi6SLJ30fpZK5b/XoJlBtGFSTRlDZiD04kxlo6N3UnbaUq5g2mi2dqi2HRMN/qHWKzWSK0CTaMumaNhTagJ5aO+0VzCnlu0AIZoyqoGwhwH9QynXMPOD0PXI1HE9n2rTshBszYw6qIpaPkF4hsDfbxbotBfOHAhlhunqzeORXD5F4C9mdzJ/uWmUcuVpfsAPA7RCbTstNGtzVB0Mtes1EJq3QJhhWrZT26uAZaBdv3nren4QNpqtFlr/9eiu8MLXjebONs7FYwT+ahvi0ptD9YIVaiC7yLYYejO7YuNroAFCqCnbRLj0fzHDbKDRwm1qvrbsQBO6W9f7h23FOQJ/jsDfIPC3mz0jeSpScXnzMc+T8/RSpEU+Ocr6P0Rc5JO/',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  nalo: [
    {
      mdt: '!~MDT2~ZZDLbtNAFIaZi8fXxHFKUwMbJPbICyORJSJRVbqgCPEAjTPTOkztJh6XdJcz9gvwCEASXhO5KrKjbkaaOfr+/8y3nyi+Vt8mXFyWUr1W1yvOk2teqLdpPvnB+Xf0aZ4KkSalVPf4Y5nOzxfL9bLIZ4vlu8X07lKWfH+elKsVz9RFKeWzz4+Xr+VM8jsu0ZfHh0mZXfE8O5uvw19nBZc8UWmebaa3pZTFzz0CgjWhpCbUYAHgMAQ0TXKZr07fCBFHQuwwWAR8qqnp1447CP6Pm+FY/EVgYLAJDCgQv2amZYchmN2MONrjipkGqW3HtChYvh4eBZVlO23U7L0Qvwfd7obcYu16RI+OA+163d44+kO132d1MES42zUWO1YRapgVM4mlCXXazAYUYssqZlqWNpitqdGyYxFHewMQ017PBMMG0wHcog28HQI6AvS8jRw/rLlzAXka4R6g0RN9rsbEA9KvECYnzXHob+dqanhA+0BPgB5q23pg9DQmI92lHlQdP1EVvgAUvgQUvjr8cRxd8Izf3H8oivQqu+GZKjan+WzBE1Vs/gE=',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  rlp: [
    {
      mdt: '!~MDT2~XVDJTgJBELW7Z59RWVw4mnjzYNBAZI5GCEEOaowfAEM1jLYzhOnG5UQ36MX4ERrgOw2oGfRYb6tXNa9yeOQ3VaAtwfge7w0Agh4k/DCMqw8Ad+i8E1IaBoLxJ3wmwk6zXCmePLfKjPdbtWGLCZg3AzEYQMQvBWNrFz/DtWgzGAJDVz9AVURdiKNG57Fw0EiAQcDDOBrV+oKx5H2GJMITG2FClIU0iWpBzOJBfZ/SUpHSKZKYKN3QJPklFrBPZ1hamjJtfVwoFo4Kx8ZfZ6n4kerbFUo/zVXBQjJ1lOm4UvOUYa9mLxiJXEk8qa1G+nTqSOxJayNNWugpnTpK012JPUWc1OF/7yCGK5GnEE49y8MyE4SJln1Fmm5gkksz/WW7uSNtT5qZsW472Zedjc3cbk7if8/JKNPKvrne+rZp2U4mv5X/W82nlxDB/dNpkoTd6B4inozqcfsWAp6MvgA=',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  tos: [
    {
      mdt: '!~MDT2~VVDJbtNQFOU+288mQ+fSi0qhpMxQFKFIkCUiUVW6oKjiA5rkvcTEtavYDu0u54kFa36hwe1nIoeiOMs7nDFrJeoi+dZS+jQNkt1kMFKqO1Bx8taPWj+UGtLnnq+1302D5FJ8Sv3e0bD/fjg+H7wbjOL2+DRIVXbUTUcjFSbHaRDc+XI7nKSdQI1VQF9vF6007KsoPOxdbBzGKlDdxI/CSfs8DYL4d0bwBDwLwobnGGG1u1EQjQ72tG7Utc7IbDELrFpwbViOqZT+P+Tnpv5D2BSmumRBOnCK4Eb9ih+C+BFoDul80PqaULXgSJAL8kBcm39onUMzwpqEcGF5sLgGUdRs1K8lXBeuB1kGVWYEdlG5qTMJ6cL2jO1U4HANVpEhj4V11zjSg1s20q1AzvFN3ajfVEEboE1D4h5oC8S7IH5dTDJrZ8nYtGzIXjFOaR3E23OrzVmS6RLEsnHkyk8Slr3Y7ZTvg/gBiB8XiXMHV7wN4pfFXnLFKTOId0C8b0gstprfBO9A8L4pKs1crELy3swCv/rlSNe7WypXFku9WQPxExA/BfEzQ4Kfg/jFP9CbRSdNfaxCdXb5MY79fnimwiSeHESd76qbxJO/',
      name: 'Tactyks Easy',
      author: 'Tactyks',
    },
  ],
  vale: [
    {
      mdt: '!~MDT2~TY9Nb9NAEIbZXa93vTblG1bAAYk7ysEHckQkqkoPFCF+QOLM1m7Xdol3Q3vLOCpI8C8gscS/REap3NNo5n0ead5u4uDSfZmAmXnrXrl8CZDl0Lg3RT35BnBOPiwKY4rMW3dF3/ticbxKc8hndVnOyulqZj10x5lfLqFyJ97aOx/3y2c/t7ACSz7tDxNfnUJdHS0u9e+jBixkrqir9fTCW9v86gRK2VIWbQhlqqUsRj7NalsvD18bk46M6TgGAiOJJLoOeKhihcEN0edjsxN4IFseKuQxhrftdPRHtULGKAZj/taYLcdQ4D2JcqB7/i/Z6Of6hX5Jf+pcF/pMX+iv+lxbXepK1wxJgJwjC5EIvC8xuv1IOuoEPpCoouuHjx4/eaowSoZX+3xstrJNYoUqGVr2qjE70sqI/pCRipO7BwmyZ0gGdWzS0ZajEBvKggTp4Pb2jnynLOChoPvJkYYtZTfU+H+3E6igvHrXNMVpVULlmvVhPT+DzDXrfw==',
      name: `Tactyks Easy`,
      author: 'Tactyks',
    },
  ],
  void: [
    {
      mdt: '!~MDT2~VZBLb9NAFIWZ8YzjJLYTO1F6QQgK5f0oAWVBlohEVcuCItQf0DgzjWFiQ2z3scsd77rhP1Dq/k3kUhRnd+7VPee7OsUoFafpwUjIw0ylm+lsIUQwE0m6HcajEyG+k71pKGUYZCo9ox+zcLo3ORGzn3Ml43R8fKgyUXwKssVCROl+ptStzzfD12yixLFQ5MvNYpRFRyKOdqencLGbCCWCNIyj5fhHplTyqyC549pUOzbPW23XRMdCMg5iFS92tqQc9KX8XV9tynkoL0lOqEFzYlCjVKxUVdOgX1DNONOMN5HYSJxqxOS9lAXRjBuacRdJC0m7Ci0TLuA2Eri3Th70CxOZVyJ9JB0k3VJWwUP5x9fU6GjKu3mjaVfdUhYWMk8z7mvGO8i6ec2qr9zDa+wdJHBXE7pylt6C6nrD0DXL022vhwaA5ub/k+H1x1cELQNND1s+uj0kAJWUf01eEaxRNHn5he34aG2cw33YhAfwELbgETyGJ/AUnq2XXXBsmmh76ProbJzDa3gOL+AlvIJteAN9eAvv1qu/JLre8LHVQwqgDbZe/L6IxPzsQ5KER9FcRGmy3Ikn30SQJsu/',
      name: `Tactyks Easy`,
      author: 'Tactyks',
    },
  ],
}

for (const dungeonKey of dungeonKeys) {
  sampleRouteDefinitions[dungeonKey].push({
    mdt: beifengRouteStrings[dungeonKey],
    name: '12.1 正式版（8.25）',
    author: '北风',
  })
}

for (const dungeonKey of dungeonKeys) {
  sampleRouteDefinitions[dungeonKey].push({
    mdt: huolingRouteStrings[dungeonKey],
    name: 'NGA 火灵hl',
    author: '火灵hl',
  })
}

async function convertRouteDefinition({
  name,
  mdt,
  author,
}: SampleRouteDefinition): Promise<SampleRoute> {
  const mdtRoute = await decodeMdtString(mdt)
  const route = mdtRouteToRoute(mdtRoute)

  if (name) route.name = name

  return {
    route,
    author,
  }
}

export type SampleRoutes = Record<DungeonKey, SampleRoute[]>

/**
 * Only the hand-curated network routes are compiled in. The WCL-ranked routes are published as
 * static GitHub Pages JSON by the sync-rankings workflow and fetched at runtime (see
 * src/api/rankingsApi.ts).
 */
const networkSampleRoutes = dungeonKeys.reduce((acc, key) => {
  acc[key as DungeonKey] = []
  return acc
}, {} as SampleRoutes)

for (const dungeonKey of dungeonKeys) {
  for (const routeDefinition of sampleRouteDefinitions[dungeonKey]) {
    const sampleRoute = await convertRouteDefinition(routeDefinition)
    networkSampleRoutes[dungeonKey].push(sampleRoute)
  }
}

export default async () => ({
  data: networkSampleRoutes,
})
