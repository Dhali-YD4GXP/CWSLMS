import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Konfigurasi ekstensi untuk Soft Delete
const prismaWithSoftDelete = prisma.$extends({
  query: {
    $allModels: {
      // Mencegat semua query pencarian untuk memfilter data yang terhapus (soft deleted)
      async findMany({ model, args, query }) {
        if (model !== 'ActivityLog') {
          args.where = { ...args.where, deleted_at: null };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (model !== 'ActivityLog') {
          args.where = { ...args.where, deleted_at: null };
        }
        return query(args);
      },
      // Mencegat operasi delete agar menjadi operasi update deleted_at
      async delete({ model, args, query }) {
        if (model !== 'ActivityLog') {
          return (prisma as any)[model].update({
            ...args,
            data: { deleted_at: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, args, query }) {
        if (model !== 'ActivityLog') {
          return (prisma as any)[model].updateMany({
            ...args,
            data: { deleted_at: new Date() },
          });
        }
        return query(args);
      },
    },
  },
});

// Helper untuk mencatat Audit Trail
export const logActivity = async (
  userId: string | null,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE',
  entityType: 'task' | 'material' | 'book' | 'comment',
  entityId: string,
  description: string
) => {
  await prisma.activityLog.create({
    data: { user_id: userId, action, entity_type: entityType, entity_id: entityId, description },
  });
};

export default prismaWithSoftDelete;
