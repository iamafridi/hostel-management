import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { RoomSearchableFields } from './room.constant';
import { TRoom, TRoomStudent } from './room.interface';
import { Room, RoomStudent } from './room.model';

const createRoomIntoDB = async (payload: TRoom) => {
    const result = await Room.create(payload);
    return result;
};

const getAllRoomsFromDB = async (query: Record<string, unknown>) => {
    const roomQuery = new QueryBuilder(
        Room.find(),
        // .populate('roomFacilities.facility'),
        query,
    )
        .search(RoomSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await roomQuery.modelQuery;
    return result;
};

const getSingleRoomFromDB = async (id: string) => {
    const result = await Room.findById(id).populate(
        'roomFacilities.facility',
    );
    return result;
};

const updateRoomIntoDB = async (id: string, payload: Partial<TRoom>) => {
    const { roomFacilities, ...roomRemainingData } = payload;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        //step1: basic room info update
        const updatedBasicRoomInfo = await Room.findByIdAndUpdate(
            id,
            roomRemainingData,
            {
                new: true,
                runValidators: true,
                session,
            },
        );

        if (!updatedBasicRoomInfo) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update room!');
        }

        // check if there is any room facilities to update
        if (roomFacilities && roomFacilities.length > 0) {
            // filter out the deleted fields
            const deletedFacilities = roomFacilities
                .filter((el) => el.facility && el.isDeleted)
                .map((el) => el.facility);

            const deletedRoomFacilities = await Room.findByIdAndUpdate(
                id,
                {
                    $pull: {
                        roomFacilities: { facility: { $in: deletedFacilities } },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!deletedRoomFacilities) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update room!');
            }

            // filter out the new facility fields
            const newFacilities = roomFacilities?.filter(
                (el) => el.facility && !el.isDeleted,
            );

            const newRoomFacilities = await Room.findByIdAndUpdate(
                id,
                {
                    $addToSet: { roomFacilities: { $each: newFacilities } },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!newRoomFacilities) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update room!');
            }
        }

        await session.commitTransaction();
        await session.endSession();

        const result = await Room.findById(id).populate(
            'roomFacilities.facility',
        );

        return result;
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update room');
    }
};

const deleteRoomFromDB = async (id: string) => {
    const result = await Room.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
            new: true,
        },
    );
    return result;
};

const assignStudentsWithRoomIntoDB = async (
    id: string,
    payload: Partial<TRoomStudent>,
) => {
    const result = await RoomStudent.findByIdAndUpdate(
        id,
        {
            room: id,
            $addToSet: { students: { $each: payload } },
        },
        {
            upsert: true,
            new: true,
        },
    );
    return result;
};

const removeStudentsFromRoomFromDB = async (
    id: string,
    payload: Partial<TRoomStudent>,
) => {
    const result = await RoomStudent.findByIdAndUpdate(
        id,
        {
            $pull: { students: { $in: payload } },
        },
        {
            new: true,
        },
    );
    return result;
};

export const RoomServices = {
    createRoomIntoDB,
    getAllRoomsFromDB,
    getSingleRoomFromDB,
    updateRoomIntoDB,
    deleteRoomFromDB,
    assignStudentsWithRoomIntoDB,
    removeStudentsFromRoomFromDB,
};