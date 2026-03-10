import { z as zod } from 'zod';

export const AddressSchema = zod.object({
  province: zod.object({ label: zod.string(), value: zod.string() }).nullish(),
  city: zod.object({ label: zod.string(), value: zod.string() }).nullish(),
  district: zod.object({ label: zod.string(), value: zod.string() }).nullish(),
  address: zod.string().optional(),
  addressName: zod.string().optional(),
  longitude: zod.string().optional(),
  latitude: zod.string().optional(),
});

export type AddressSchemaType = zod.infer<typeof AddressSchema>;
