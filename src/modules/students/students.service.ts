import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PaymentStatus, UserRole } from '@prisma/client';
import { join } from 'path';
import { NotFound } from 'src/common/config/error';
import { PrismaService } from 'src/core/database/prisma.service';
import fs from "fs"
import { UpdateStudentDto } from './dto/update-student.dto';
import hashPassword from 'src/common/config/hash';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService){}
    
    private async checkCoursePurchased(courseId:number, userId:number){
        const purchase = await this.prisma.purchasedCourse.findFirst({
            where: {
                userId,
                courseId,
                status: PaymentStatus.COMPLETED,
            },
        });
        
        if (!purchase) {
            throw new ForbiddenException("You have not purchased this course");
        }
    }
    
    async getAllStudents(page:number,limit:number){
        
        const skip = (page - 1) * limit;
        
        const [students, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where:{
                    role:UserRole.STUDENT
                },
                skip:Number(skip),
                take:Number(limit),
                select: {
                    id: true,
                    full_name: true,
                    phone: true,
                    file:true,
                    status: true,
                    role: true,
                    created_at:true
                },
                orderBy: { created_at: 'desc' },
            }),
            
            this.prisma.user.count({where:{role:UserRole.STUDENT}})
        ])
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:students
        }
        
    }
    
    async searchStudent(name:string){
        if(!name?.trim()){
            return { success: true, data: [] };
        }
        const student = await this.prisma.user.findMany({
            where:{
                role:UserRole.STUDENT,
                full_name:{
                    contains:name.trim(),
                    mode:"insensitive"
                },
            },
            select: {
                id: true,
                full_name: true,
                phone: true,
                file:true,
                role: true,
            }
        })
        
        return {
            success:true,
            data:student
        }
    }
    
    async getOneStudent(id:number){
        const student = await this.prisma.user.findFirst({
            where:{id, role:UserRole.STUDENT},
            select:{
                id: true,
                full_name: true,
                phone: true,
                file: true,
                role: true,
                status: true,
                created_at: true,
                purchasedCourses: {
                    select: {
                        id: true,
                        status: true,
                        amount: true,
                        purchasedAt: true,
                        course: {
                            select: { id: true, name: true },
                        }
                    }
                }
            }
        })
        
        if(!student){
            NotFound("Student")
        }
        
        return {
            success:true,
            data:{student}
        }
    }
    
    async deleteStudent(id:number){
        const student = await this.prisma.user.findUnique({
            where:{id}
        })
        
        if(!student) NotFound("Student");
        
        const purchasedCourses = await this.prisma.purchasedCourse.findFirst({
            where:{
                userId:id,
                status:PaymentStatus.COMPLETED
            }
        })
        
        if(purchasedCourses){
            throw new ConflictException("Cannot delete student who has purchased courses")
        }
        
        if (student.file) {
            const filePath = join(process.cwd(), "src", "uploads", "images", student.file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        await this.prisma.user.delete({where:{id}})
        
        return { success: true, message: "Student deleted successfully!" };
    }
    
    async updateStudent(id:number, payload:UpdateStudentDto){
        const student = await this.prisma.user.findFirst({
            where: { id, role: UserRole.STUDENT },
        });
        if (!student) NotFound("Student");
        
        if (payload.phone && payload.phone !== student.phone) {
            const phoneTaken = await this.prisma.user.findUnique({
                where: { phone: payload.phone },
            });
            if (phoneTaken) {
                throw new ConflictException("This phone number is already in use");
            }
        }
        
        await this.prisma.user.update({
            where: { id },
            data: {
                ...(payload.full_name && { full_name: payload.full_name }),
                ...(payload.phone && { phone: payload.phone }),
                ...(payload.password && { password: await hashPassword(payload.password) }),
            },
        });
        
        return { success: true, message: "Student updated successfully!" };
    }
    
    async getMyCourses(userId:number){
        const purchased = await this.prisma.purchasedCourse.findMany({
            where:{
                userId,
                status:PaymentStatus.COMPLETED
            },
            select:{
                id:true,
                purchasedAt:true,
                course:{
                    select:{
                        id: true,
                        name: true,
                        banner: true,
                        level: true,
                        categories: { select: { name: true } },
                        teacher_profile: {
                            select: {
                                user: { select: { full_name: true, file:true } },
                            },
                        }
                    }
                }
            },
            orderBy: { purchasedAt: 'desc' },
        })
        return {
            success:true,
            data:purchased
        }
    }
    
    async getCourseContent(courseId:number, userId:number){
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
            select: { id: true, name: true },
        });
        if (!course) NotFound("Course");
        
        await this.checkCoursePurchased(courseId, userId);
        
        const sections = await this.prisma.sections.findMany({
            where: { coursesId: courseId },
            select: {
                id: true,
                name: true,
                lessons: {
                    select: {
                        id: true,
                        name: true,
                        duration: true,
                    },
                    orderBy: { id: 'asc' },
                },
            },
            orderBy: { id: 'asc' },
        })
        
        
        const content = sections.map((section) => {
            const totalDuration = section.lessons.reduce(
                (sum, lesson) => sum + (lesson.duration || 0),
                0
            );
            return {
                sectionId: section.id,
                name: section.name,
                totalDuration,   // daqiqada (Image 2: "Kirish 30 daqiqa")
                lessons: section.lessons.map((l) => ({
                    lessonId: l.id,
                    name: l.name,
                    duration: l.duration,
                })),
            };
        });
        
        return {
            success: true,
            course: { id: course.id, name: course.name },
            data: content,
        }
    }
    
    async getLessonForStudent(lessonId:number, userId:number){
        
        const lesson = await this.prisma.lessons.findUnique({
            where:{id:lessonId},
            select:{
                id: true,
                name: true,
                file: true,
                section: {
                    select: {
                        id: true,
                        name: true,
                        coursesId: true,
                    },
                },
            }
        })
        
        if (!lesson) NotFound("Lesson");
        
        await this.checkCoursePurchased(lesson.section.coursesId, userId);
        
        return {
            success: true,
            data: {
                lessonId: lesson.id,
                name: lesson.name,
                file: lesson.file,       
                section: {
                    id: lesson.section.id,
                    name: lesson.section.name,
                },
            },
        };1
    }
    
    async rateLesson(lessonId:number,  rate:number, userId:number){
        if(rate < 1 || rate > 5){
            throw new BadRequestException('Rate must be between 1 and 5');
        }
        
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
            select: { id: true, section: { select: { coursesId: true } } },
        });
        if (!lesson) NotFound("Lesson");
        
        await this.checkCoursePurchased(lesson.section.coursesId, userId);
        
        await this.prisma.lessonRating.upsert({
            where: {
                lessonId_userId: { userId, lessonId },
            },
            update: { rate },
            create: { lessonId, userId, rate },
        });
        
        return { success: true, message: "Lesson rated successfully!" };
    }
    
    async getLessonRating(lessonId:number){
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) NotFound("Lesson");
        
        const result = await this.prisma.lessonRating.aggregate({
            where: { lessonId },
            _avg: { rate: true },
            _count: { rate: true },
        });
        
        return {
            success: true,
            data: {
                averageRate: result._avg.rate ? Number(result._avg.rate.toFixed(1)) : 0,
                totalRatings: result._count.rate,
            },
        };
    }
}
