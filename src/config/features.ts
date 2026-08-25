export const staticDeployment = import.meta.env.VITE_STATIC_DEPLOYMENT === 'true'

export const cloudFeaturesEnabled =
  !staticDeployment && import.meta.env.VITE_ENABLE_CLOUD === 'true'
export const collaborationEnabled =
  !staticDeployment && import.meta.env.VITE_ENABLE_COLLAB === 'true'
export const routeSharingEnabled =
  !staticDeployment && import.meta.env.VITE_ENABLE_ROUTE_SHARING === 'true'
export const analyticsEnabled =
  !staticDeployment && import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
export const wclImportEnabled = !staticDeployment
