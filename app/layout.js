import "./globals.css";
import { TeacherProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { QueryProvider } from "./context/QueryContext";
import { SessionProvider } from "./context/SessionContext";
import { EnrollMentProvider } from "./context/EnrollStuContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata = {
  title: "Teacher Portal",
  description: "Professional teacher management portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://meet.jit.si/external_api.js"
          strategy="beforeInteractive" // or "lazyOnload" if not needed immediately
        />
        <TeacherProvider>
          <EnrollMentProvider>
            <CourseProvider>
              <QueryProvider>
                <SessionProvider>
                  <ChatProvider>
                    <NotificationProvider>
                      <Toaster position="top-right" />
                      {children}
                    </NotificationProvider>
                  </ChatProvider>
                </SessionProvider>
              </QueryProvider>
            </CourseProvider>
          </EnrollMentProvider>
        </TeacherProvider>
      </body>
    </html>
  );
}
