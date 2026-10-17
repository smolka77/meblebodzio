import type { StoreOrder } from "@/lib/typy";
import {
  logEmailFailure,
  sendAdminNewOrderEmail,
  sendPaymentConfirmedEmail,
} from "@/lib/serwer/poczta";
import {
  logSmsFailure,
  sendCustomerPaidSms,
  sendNewOrderSms,
  sendPaidOrderSms,
} from "@/lib/serwer/sms";

/** Mail do sklepu i SMS o nowym zamówieniu. Potwierdzenie klienta idzie dopiero po opłaceniu. */
export function queueShopNewOrderAlerts(
  order: StoreOrder,
  adminEmail: string,
  emailAdmin: boolean
): void {
  void sendNewOrderSms(order).catch((err) =>
    logSmsFailure("nie wysłano SMS o nowym zamówieniu", order.id, err)
  );
  if (emailAdmin) {
    void sendAdminNewOrderEmail(order, adminEmail).catch((err) =>
      logEmailFailure("nie wysłano maila do sklepu o zamówieniu", order.id, err)
    );
  }
}

export function queueOrderPaidAlerts(order: StoreOrder): void {
  void sendPaymentConfirmedEmail(order).catch((err) =>
    logEmailFailure("nie wysłano maila z potwierdzeniem", order.id, err)
  );
  void sendCustomerPaidSms(order).catch((err) =>
    logSmsFailure("nie wysłano SMS do klienta", order.id, err)
  );
  void sendPaidOrderSms(order).catch((err) =>
    logSmsFailure("nie wysłano SMS o opłaceniu do sklepu", order.id, err)
  );
}
