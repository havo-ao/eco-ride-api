import {
  ReservationRepository,
  ReservationRecord,
} from "./reservation.repository";

export class ReservationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class ReservationService {
  private readonly repository = new ReservationRepository();

  async getActive(userId: number): Promise<ReservationRecord | null> {
    return this.repository.getActiveReservation(userId);
  }

  async create(
    userId: number,
    stationId: number,
    bikeType?: string
  ): Promise<ReservationRecord> {
    try {
      return await this.repository.createReservation(
        userId,
        stationId,
        bikeType ?? null
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ACTIVE_RESERVATION_EXISTS")) {
        throw new ReservationError(
          409,
          "ACTIVE_RESERVATION_EXISTS",
          "Ya tienes una reserva activa."
        );
      }
      if (message.includes("NO_BIKES_AVAILABLE")) {
        throw new ReservationError(
          409,
          "NO_BIKES_AVAILABLE",
          "No hay bicicletas disponibles en esta estación."
        );
      }
      if (message.includes("USER_NOT_ALLOWED")) {
        throw new ReservationError(
          403,
          "USER_NOT_ALLOWED",
          "No puedes reservar porque tienes restricciones activas."
        );
      }
      throw error;
    }
  }

  async cancel(
    reservationId: number,
    userId: number
  ): Promise<ReservationRecord> {
    try {
      return await this.repository.cancelReservation(reservationId, userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("RESERVATION_NOT_FOUND")) {
        throw new ReservationError(
          404,
          "RESERVATION_NOT_FOUND",
          "Reserva no encontrada."
        );
      }
      if (message.includes("RESERVATION_NOT_ACTIVE")) {
        throw new ReservationError(
          409,
          "RESERVATION_NOT_ACTIVE",
          "La reserva ya no está activa."
        );
      }
      throw error;
    }
  }
}
