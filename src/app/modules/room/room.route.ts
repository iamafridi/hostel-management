import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RoomControllers } from './room.controller';
import { RoomValidations } from './room.validation';

const router = express.Router();

router.post(
    '/create-room',
    validateRequest(RoomValidations.createRoomValidationSchema),
    RoomControllers.createRoom,
);

router.get('/:id', RoomControllers.getSingleRoom);

router.patch(
    '/:id',
    validateRequest(RoomValidations.updateRoomValidationSchema),
    RoomControllers.updateRoom,
);

router.delete('/:id', RoomControllers.deleteRoom);

router.put(
    '/:roomId/assign-students',
    validateRequest(RoomValidations.studentsWithRoomValidationSchema),
    RoomControllers.assignStudentsWithRoom,
);

router.delete(
    '/:roomId/remove-students',
    validateRequest(RoomValidations.studentsWithRoomValidationSchema),
    RoomControllers.removeStudentsFromRoom,
);

router.get('/', RoomControllers.getAllRooms);

export const RoomRoutes = router;


/* Sample data
{
  "roomNumber": "A-101",
  "building": "Hostel A",
  "floor": 1,
  "capacity": 2,
  "monthlyRent": 5000,
  "roomFacilities": [
    { "facility": "facility_id_1" },
    { "facility": "facility_id_2" }
  ]
}
*/