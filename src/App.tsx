import { useEffect, useState } from "react";
import { TopNav, Footer, type PageKey } from "./components/chrome";
import Home from "./pages/Home";
import Lab from "./pages/Lab";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Agents from "./pages/Agents";
import Library from "./pages/Library";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";

export default function App() {
  const [page, setPage] = useState<PageKey>("home");
  const [courseId, setCourseId] = useState<string | null>(null);

  const navigate = (p: PageKey) => {
    setCourseId(null);
    setPage(p);
  };

  const openCourse = (id: string) => {
    setCourseId(id);
    setPage("courses");
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page, courseId]);

  if (page === "login") {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav page={page} onNavigate={navigate} />
        <main className="flex-1 pt-16">
          <Login />
        </main>
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav page={page} onNavigate={navigate} />
      <main className="flex-1">
        {page === "home" && <Home onNavigate={navigate} />}
        {page === "lab" && <Lab onNavigate={navigate} />}
        {page === "courses" &&
          (courseId ? (
            <CourseDetail courseId={courseId} onBack={() => setCourseId(null)} onNavigate={navigate} />
          ) : (
            <Courses onOpenCourse={openCourse} />
          ))}
        {page === "agents" && <Agents onNavigate={navigate} />}
        {page === "library" && <Library onNavigate={navigate} />}
        {page === "pricing" && <Pricing onNavigate={navigate} />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
