import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as FormsFormIdEditRoute } from './routes/forms.$formId.edit'
import { Route as FFormIdRoute } from './routes/f.$formId'

const IndexRouteWithChildren = IndexRoute
const FormsFormIdEditRouteWithChildren = FormsFormIdEditRoute
const FFormIdRouteWithChildren = FFormIdRoute

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexRouteWithChildren
      parentRoute: typeof rootRoute
    }
    '/forms/$formId/edit': {
      preLoaderRoute: typeof FormsFormIdEditRouteWithChildren
      parentRoute: typeof rootRoute
    }
    '/f/$formId': {
      preLoaderRoute: typeof FFormIdRouteWithChildren
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRouteWithChildren,
  FormsFormIdEditRouteWithChildren,
  FFormIdRouteWithChildren,
])
