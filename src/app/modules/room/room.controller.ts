import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RoomServices } from './room.service';

const createRoom = catchAsync(async (req, res) => {
    const result = await RoomServices.createRoomIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Room is created succesfully',
        data: result,
    });
});

const getAllRooms = catchAsync(async (req, res) => {
    const result = await RoomServices.getAllRoomsFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Room are retrieved successfully',
        data: result,
    });
});

const getSingleRoom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RoomServices.getSingleRoomFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Room is retrieved succesfully',
        data: result,
    });
});

const updateRoom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RoomServices.updateRoomIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'room is updated succesfully',
        data: result,
    });
});

const deleteRoom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RoomServices.deleteRoomFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Room is deleted succesfully',
        data: result,
    });
});

const assignStudentsWithRoom = catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const { students } = req.body;
    const result = await RoomServices.assignStudentsWithRoomIntoDB(
        roomId,
        students,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Students assigned succesfully',
        data: result,
    });
});

const removeStudentsFromRoom = catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const { students } = req.body;
    const result = await RoomServices.removeStudentsFromRoomFromDB(
        roomId,
        students,
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Students removed succesfully',
        data: result,
    });
});

export const RoomControllers = {
    createRoom,
    getSingleRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
    assignStudentsWithRoom,
    removeStudentsFromRoom,
};