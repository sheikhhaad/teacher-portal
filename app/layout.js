import "./globals.css";
import { TeacherProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { QueryProvider } from "./context/QueryContext";
import { SessionProvider } from "./context/SessionContext";
import { EnrollMentProvider } from "./context/EnrollStuContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Teacher Portal",
  description: "Professional teacher management portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TeacherProvider>
          <EnrollMentProvider>
            <NotificationProvider>
              <CourseProvider>
                <QueryProvider>
                  <SessionProvider>
                    <ChatProvider>
                      <Toaster position="top-right" />
                      {children}
                    </ChatProvider>
                  </SessionProvider>
                </QueryProvider>
              </CourseProvider>
            </NotificationProvider>
          </EnrollMentProvider>
        </TeacherProvider>
      </body>
    </html>
  );
}

