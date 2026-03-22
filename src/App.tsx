// ***** src/App.tsx *****
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

// Router provider enables React Router integration with Refine
import routerProvider, {
    DocumentTitleHandler,
    UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import Dashboard from "@/pages/dashboard.tsx";
import { Layout } from "./components/refine-ui/layout/layout";
import { BookOpen, Home } from "lucide-react";
import SubjectsList from "@/pages/subjects/list.tsx";
import SubjectsCreate from "@/pages/subjects/create.tsx";

function App() {
    return (
        // BrowserRouter enables client-side routing throughout the application
        <BrowserRouter>
            <RefineKbarProvider>
                <ThemeProvider>
                    <DevtoolsProvider>
                        <Refine
                            // Data provider handles all data fetching operations
                            dataProvider={dataProvider}
                            // Notification provider manages system notifications and alerts
                            notificationProvider={useNotificationProvider()}
                            // Router provider connects Refine with React Router
                            routerProvider={routerProvider}
                            options={{
                                // Syncs application state with browser URL
                                syncWithLocation: true,
                                // Warns users before navigating away with unsaved changes
                                warnWhenUnsavedChanges: true,
                                // Unique project identifier for Refine DevTools
                                projectId: "0H0vwD-aUtVdA-YylxMQ",
                            }}
                            // Resources define entities and their associated routes
                            resources={[
                                {
                                    // Dashboard resource configuration
                                    name: "dashboard",
                                    list: "/",
                                    meta: { label: "Home", icon: <Home /> },
                                },
                                // Subjects resource
                                {
                                    name: "subjects",
                                    list: "/subjects",
                                    create: "/subjects/create",
                                    meta: {
                                        label: "Subjects",
                                        icon: <BookOpen />,
                                    },
                                },
                            ]}
                        >
                            <Routes>
                                {/*
                  Layout route wraps all child routes
                  Outlet renders nested routes within the Layout
                  This enables sidebar and header on all pages
                */}
                                <Route
                                    element={
                                        <Layout>
                                            <Outlet />
                                        </Layout>
                                    }
                                >
                                    {/* Root path renders Dashboard within Layout */}
                                    <Route path="/" element={<Dashboard />} />

                                    {/* Subjects route group nested within Layout */}
                                    <Route path="subjects">
                                        <Route index element={<SubjectsList />} />
                                        <Route path="create" element={<SubjectsCreate />} />
                                    </Route>
                                </Route>
                            </Routes>
                            {/* Notification toaster displays system messages */}
                            <Toaster />
                            {/* Command palette for quick navigation and actions */}
                            <RefineKbar />
                            {/* Notifies users about unsaved form changes */}
                            <UnsavedChangesNotifier />
                            {/* Manages document title based on current route */}
                            <DocumentTitleHandler />
                        </Refine>
                        <DevtoolsPanel />
                    </DevtoolsProvider>
                </ThemeProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;