import { z } from 'zod';

const RoomFacilityValidationSchema = z.object({
    facility: z.string(),
    isDeleted: z.boolean().optional(),
});

const createRoomValidationSchema = z.object({
    body: z.object({
        roomNumber: z.string(),
        building: z.string(),
        floor: z.number(),
        capacity: z.number(),
        monthlyRent: z.number(),
        roomFacilities: z.array(RoomFacilityValidationSchema).optional(),
        isDeleted: z.boolean().optional(),
    }),
});

const updateRoomFacilityValidationSchema = z.object({
    facility: z.string(),
    isDeleted: z.boolean().optional(),
});

const updateRoomValidationSchema = z.object({
    body: z.object({
        roomNumber: z.string().optional(),
        building: z.string().optional(),
        floor: z.number().optional(),
        capacity: z.number().optional(),
        monthlyRent: z.number().optional(),
        roomFacilities: z
            .array(updateRoomFacilityValidationSchema)
            .optional(),
        isDeleted: z.boolean().optional(),
    }),
});

const studentsWithRoomValidationSchema = z.object({
    body: z.object({
        students: z.array(z.string()),
    }),
});

export const RoomValidations = {
    createRoomValidationSchema,
    updateRoomValidationSchema,
    studentsWithRoomValidationSchema,
};