export const apiEndpoints = {
  auth: {
    login: '/simulator/login'
  },
  sites: {
    base: '/api/sites',
    byId: (siteId: string) => `/api/sites/${siteId}`
  },
  users: {
    base: '/api/users',
    byId: (userId: string) => `/api/users/${userId}`
  },
  boilers: {
    base: '/api/boilers',
    byId: (boilerId: string) => `/api/boilers/${boilerId}`
  },
  simulator: {
    register: '/simulator/register',
    update: '/simulator/fullupdate'
  }
} as const;
