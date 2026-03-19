import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Save } from '@mui/icons-material';
import { Stack, Paper, Alert, Button, Container, Typography } from '@mui/material';

import API from 'src/services/API';
import { AddressSchema } from 'src/common/zod-schema/address-schema';

import { Form, Field } from 'src/components/hook-form';
// ----------------------------------------------------------------------

export type ContactFormSchemaType = zod.infer<typeof ContactFormSchema>;

export const ContactFormSchema = zod
  .object({
    name: zod
      .string()
      .min(1, { message: '联系人姓名不能为空' })
      .max(20, { message: '联系人姓名不能超过20个字符' }),
    phone: zod
      .string()
      .min(1, { message: '联系电话不能为空' })
      .regex(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号码' }),
    wechat: zod.string().optional(),
    // .refine((val) => !val || /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(val), {
    //   message: '请输入正确的微信号（6-20位字母、数字、下划线、减号，以字母开头）',
    // }),
    address: AddressSchema.nullish(),
    isDefault: zod.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (
      !data.address ||
      !data.address?.province ||
      !data.address?.city ||
      !data.address?.district
    ) {
      ctx.addIssue({
        code: 'custom',
        message: '地址不能为空',
        path: ['address'],
      });
    }
    if (!data.address?.addressName) {
      ctx.addIssue({
        code: 'custom',
        message: '详细地址不能为空',
        path: ['address.addressName'],
      });
    }
  });

// ----------------------------------------------------------------------

export function NewEditContactFormContent({
  onSuccess,
  formData,
}: {
  formData?: MyApi.OutputContactDto;
  onSuccess?: () => void;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: ContactFormSchemaType = {
    name: '',
    phone: '',
    address: undefined,
    isDefault: false,
  };

  const methods = useForm({
    resolver: zodResolver(ContactFormSchema),
    defaultValues,
    values: formData
      ? {
          name: formData.contactName,
          phone: formData.contactPhone,
          wechat: formData.wechat,
          address: {
            province: {
              label: formData.province ?? '',
              value: formData.provinceCode ?? '',
            },
            city: {
              label: formData.city ?? '',
              value: formData.cityCode ?? '',
            },
            district: {
              label: formData.district ?? '',
              value: formData.districtCode ?? '',
            },
            address: formData.address,
            addressName: formData.addressName,
            longitude: formData.longitude?.toString(),
            latitude: formData.latitude?.toString(),
          },
          isDefault: formData.isDefault,
        }
      : undefined,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        setErrorMessage(null);
        const address = data.address!;

        const params = {
          contactName: data.name,
          contactPhone: data.phone,
          wechat: data.wechat,
          isDefault: data.isDefault,
          province: address.province!.label,
          provinceCode: address.province!.value,
          city: address.city!.label,
          cityCode: address.city!.value,
          district: address.district!.label,
          districtCode: address.district!.value,
          address: address.address,
          addressName: address.addressName,
          longitude: Number(address.longitude!),
          latitude: Number(address.latitude!),
        };
        if (formData) {
          await API.AppContact.AppContactControllerUpdateContactV1({ id: formData.id }, params);
        } else {
          await API.AppContact.AppContactControllerCreateContactV1(params);
        }

        onSuccess?.();
        // 成功后返回联系人列表页
        // router.push(paths.my.address.list);
      } catch (error) {
        console.error(error);
        setErrorMessage('保存失败，请稍后重试');
      }
    },
    (err) => {
      console.log(err);
    }
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* 基本信息 */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: (theme) => theme.vars.customShadows.card,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            基本信息
          </Typography>
          <Stack spacing={2.5}>
            <Field.Text
              name="name"
              label="联系人姓名"
              placeholder="请输入联系人姓名"
              slotProps={{
                input: {
                  inputProps: { maxLength: 50 },
                },
              }}
            />

            <Field.Text
              name="phone"
              label="联系电话"
              type="tel"
              placeholder="请输入手机号码"
              slotProps={{
                input: {
                  inputProps: { maxLength: 11 },
                },
              }}
            />

            <Field.Text
              name="wechat"
              label="微信号"
              placeholder="请输入微信号"
              slotProps={{
                input: {
                  inputProps: { maxLength: 50 },
                },
              }}
            />
          </Stack>
        </Paper>

        {/* 地址信息 */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: (theme) => theme.vars.customShadows.card,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            地址信息
          </Typography>
          <Stack spacing={2.5}>
            <Field.Address name="address" required />
            <Field.Text name="address.addressName" label="详细地址" placeholder="请输入详细地址" />

            <Field.Checkbox
              name="isDefault"
              label="设为默认地址"
              slotProps={{ checkbox: { sx: { ml: -1 } } }}
            />
          </Stack>
        </Paper>

        {/* 错误提示 */}
        {!!errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* 提交按钮 */}
        <Container
          sx={{
            position: 'fixed',
            bottom: 0,
            zIndex: 10,
            left: 0,
            right: 0,
            py: 2.5,
            backgroundColor: 'background.paper',
          }}
        >
          <Button
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="保存中..."
            startIcon={<Save />}
            sx={{ borderRadius: 2 }}
          >
            {formData ? '保存修改' : '保存联系人'}
          </Button>
        </Container>
      </Stack>
    </Form>
  );
}
