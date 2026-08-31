import { Model, Schema, model, models } from 'mongoose';
import { TRoom, TRoomStudent, TRoomFacilities } from './room.interface';

const roomFacilitiesSchema = new Schema<TRoomFacilities>(
  {
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const roomSchema = new Schema<TRoom>(
  {
    roomNumber: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    building: {
      type: String,
      trim: true,
      required: true,
    },
    floor: {
      type: Number,
      trim: true,
      required: true,
    },
    capacity: {
      type: Number,
      trim: true,
      required: true,
    },
    monthlyRent: {
      type: Number,
      trim: true,
      required: true,
    },
    roomFacilities: [roomFacilitiesSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Room: Model<TRoom> =
  (models.Room as Model<TRoom>) || model<TRoom>('Room', roomSchema);

const roomStudentSchema = new Schema<TRoomStudent>({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    unique: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
});

export const RoomStudent: Model<TRoomStudent> =
  (models.RoomStudent as Model<TRoomStudent>) ||
  model<TRoomStudent>('RoomStudent', roomStudentSchema);
