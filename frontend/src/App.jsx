import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {InputPage} from './pages/InputPage';
import {PostConfirmationPage} from './pages/PostConfirmationPage';
import {ChatbotEntryPage} from './pages/ChatbotEntryPage';
import {ChatbotPage} from './pages/ChatbotPage';
import {AnalyticsPage} from './pages/AnalyticsPage';

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

const chatbotEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chatbot',
  component: ChatbotEntryPage,
});

const chatbotChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chatbot/chat',
  component: ChatbotPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  postConfirmationRoute,
  chatbotEntryRoute,
  chatbotChatRoute,
  analyticsRoute,
]);

const router = createRouter({routeTree});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
