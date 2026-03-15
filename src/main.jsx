import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import App from "./App";
import LoginPage from "./pages/LoginPage";
import ClientsPage from "./pages/ClientsPage";
import RoomsPage from "./pages/RoomsPage";
import OperationsPage from "./pages/OperationsPage";
import { rootLoader, protectedLoader } from "./auth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Navigate to="/clients" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        loader: protectedLoader,
        children: [
          {
            path: "clients",
            element: <ClientsPage />,
          },
          {
            path: "rooms",
            element: <RoomsPage />,
          },
          {
            path: "operations",
            element: <OperationsPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
