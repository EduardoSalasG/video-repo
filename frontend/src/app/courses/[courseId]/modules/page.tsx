import Link from 'next/link';
import { ModuleCard } from '@/components/library/ModuleCard';
import { NavCourseSelector } from '@/components';

export default async function ModuleListPage({
  params
}: {
  params: { courseId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules`);
  const { modules } = await res.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Modules</h1>
        <NavCourseSelector onCourseChange={(courseId) => {
          // Redirect to modules page for new course
          window.location.href = `/courses/${courseId}/modules`;
        }} />
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.id} href={`/courses/${params.courseId}/modules/${module.id}`} className="block">
              <ModuleCard module={module} />
            </Link>
          ))}
        </div>
      </div>
      
      {/* Pagination controls would go here */}
    </section>
  );
}