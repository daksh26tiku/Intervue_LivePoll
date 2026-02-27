import { Student } from '../models/Student';
import { IStudentData } from '../types';

class StudentService {
    // In-memory map for quick lookup
    private students: Map<string, IStudentData> = new Map();

    async registerStudent(name: string, tabId: string, socketId: string): Promise<IStudentData> {
        const studentData: IStudentData = {
            name,
            tabId,
            socketId,
            isActive: true,
        };

        this.students.set(tabId, studentData);

        // Persist to DB
        try {
            await Student.findOneAndUpdate(
                { tabId },
                { name, tabId, socketId, isActive: true },
                { upsert: true, new: true }
            );
        } catch (dbError) {
            console.warn('⚠️  Failed to save student to DB:', dbError);
        }

        return studentData;
    }

    async updateSocketId(tabId: string, socketId: string): Promise<void> {
        const student = this.students.get(tabId);
        if (student) {
            student.socketId = socketId;
            student.isActive = true;
        }

        try {
            await Student.findOneAndUpdate({ tabId }, { socketId, isActive: true });
        } catch (dbError) {
            console.warn('⚠️  Failed to update student socket:', dbError);
        }
    }

    async kickStudent(tabId: string): Promise<IStudentData | null> {
        const student = this.students.get(tabId);
        if (!student) return null;

        student.isActive = false;
        this.students.delete(tabId);

        try {
            await Student.findOneAndUpdate({ tabId }, { isActive: false });
        } catch (dbError) {
            console.warn('⚠️  Failed to update kicked student in DB:', dbError);
        }

        return student;
    }

    getActiveStudents(): { name: string; tabId: string }[] {
        const active: { name: string; tabId: string }[] = [];
        this.students.forEach((student) => {
            if (student.isActive) {
                active.push({ name: student.name, tabId: student.tabId });
            }
        });
        return active;
    }

    getStudentByTabId(tabId: string): IStudentData | undefined {
        return this.students.get(tabId);
    }

    getStudentBySocketId(socketId: string): IStudentData | undefined {
        for (const student of this.students.values()) {
            if (student.socketId === socketId) return student;
        }
        return undefined;
    }

    removeBySocketId(socketId: string): void {
        for (const [tabId, student] of this.students.entries()) {
            if (student.socketId === socketId) {
                student.isActive = false;
                // Keep in map so they can reconnect via updateSocketId
                break;
            }
        }
    }
}

export const studentService = new StudentService();
