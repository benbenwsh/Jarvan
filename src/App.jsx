import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {InputPage} from './pages/InputPage';
import {PostConfirmationPage} from './pages/PostConfirmationPage';

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: InputPage,
});

const postConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post-confirmation',
  component: PostConfirmationPage,
});

const routeTree = rootRoute.addChildren([indexRoute, postConfirmationRoute]);

const router = createRouter({routeTree});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
