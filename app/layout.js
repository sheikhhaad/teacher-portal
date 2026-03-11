import "./globals.css";
import { TeacherProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { QueryProvider } from "./context/QueryContext";
import { SessionProvider } from "./context/SessionContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TeacherProvider>
          <CourseProvider>
            <QueryProvider>
              <SessionProvider>{children}</SessionProvider>
            </QueryProvider>
          </CourseProvider>
        </TeacherProvider>
      </body>
    </html>
  );
}
