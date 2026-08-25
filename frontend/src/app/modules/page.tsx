import Link from 'next/link';

export default function ModuleListPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Select a Course</h1>
      <p className="mt-4">
        Please select a course first to view its modules.
        <Link href="/courses" className="text-primary-foreground underline">
          Browse Courses
        </Link>
      </p>
    </div>
  );
}