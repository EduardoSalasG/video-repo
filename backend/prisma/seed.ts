import { CourseService } from '../src/services/CourseService';

async function main() {
  console.log(`Start seeding ...`);
  
  const courseNames = [
    { name: 'Mambo on2', description: 'Mambo On2 NY style' },
    { name: 'Casino', description: 'Casino style salsa' },
    { name: 'Sensual Bachata', description: 'Sensual Bachata style' },
    { name: 'Modern Bachata', description: 'Modern Bachata style' }
  ];
  
  for (const courseData of courseNames) {
    const course = await CourseService.createCourse(courseData);
    console.log(`Created course with id: ${course.id}, name: ${course.name}`);
  }
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promise
    // @ts-ignore
    prisma.$disconnect();
  });
