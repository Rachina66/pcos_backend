// src/services/notification/notification.service.js

import prisma from "../../config/prismaclient.js";

export const createNotification = async ({
  userId,
  doctorId,
  recipientRole,
  type,
  title,
  body,
  data = {},
}) => {
  return await prisma.notification.create({
    data: {
      userId: userId ?? null,
      doctorId: doctorId ?? null,
      recipientRole,
      type,
      title,
      body,
      data,
      read: false,
    },
  });
};

export const getNotifications = async ({ userId, doctorId, recipientRole }) => {
  return await prisma.notification.findMany({
    where: {
      ...(userId && { userId }),
      ...(doctorId && { doctorId }),
      recipientRole,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const getUnreadCount = async ({ userId, doctorId, recipientRole }) => {
  return await prisma.notification.count({
    where: {
      ...(userId && { userId }),
      ...(doctorId && { doctorId }),
      recipientRole,
      read: false,
    },
  });
};

export const markAsRead = async (id) => {
  return await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
};

export const markAllAsRead = async ({ userId, doctorId, recipientRole }) => {
  return await prisma.notification.updateMany({
    where: {
      ...(userId && { userId }),
      ...(doctorId && { doctorId }),
      recipientRole,
      read: false,
    },
    data: { read: true },
  });
};
