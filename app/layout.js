import "./globals.css";
import { TeacherProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { QueryProvider } from "./context/QueryContext";
import { SessionProvider } from "./context/SessionContext";
import { EnrollMentProvider } from "./context/EnrollStuContext";
import { ChatProvider } from "./context/ChatContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TeacherProvider>
          <CourseProvider>
            <QueryProvider>
              <SessionProvider>
                <EnrollMentProvider>
                  <ChatProvider>{children}</ChatProvider>
                </EnrollMentProvider>
              </SessionProvider>
            </QueryProvider>
          </CourseProvider>
        </TeacherProvider>
      </body>
    </html>
  );
}
