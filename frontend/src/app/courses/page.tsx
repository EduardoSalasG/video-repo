import Link from 'next/link';
import { CourseCard } from '@/components';

export default async function CourseListPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
  const { courses } = await res.json();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`} className="block">
            <CourseCard course={course} />
          </Link>
        ))}
      </div>
    </section>
  );
}