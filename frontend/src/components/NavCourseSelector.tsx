import { useEffect, useState } from 'react';

export default function NavCourseSelector({ onCourseChange }: { onCourseChange: (courseId: string) => void }) {
  const [courses, setCourses] = useState<Array<{id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const { courses } = await res.json();
        setCourses(courses);
        if (courses.length > 0) {
          setSelectedCourseId(courses[0].id);
          onCourseChange(courses[0].id);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCourses();
  }, [onCourseChange]);

  if (loading) return <div>Loading courses...</div>;
  
  return (
    <select
      value={selectedCourseId}
      onChange={(e) => {
        const courseId = e.target.value;
        setSelectedCourseId(courseId);
        onCourseChange(courseId);
      }}
      className="border rounded px-3 py-2"
    >
      {courses.map(course => (
        <option key={course.id} value={course.id}>
          {course.name}
        </option>
      ))}
    </select>
  );
}