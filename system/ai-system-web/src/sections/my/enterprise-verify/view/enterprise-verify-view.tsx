import { z } from 'zod';
import wx from 'weixin-js-sdk';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, XCircle, CheckCircle } from 'lucide-react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import { splitFiles, combineImageUrls } from 'src/utils/upload';

import API from 'src/services/API';
import { ossUploader } from 'src/lib/oss-uploader';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { MobileLayout } from 'src/components/custom/layout';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/** 统一社会信用代码：18 位数字或大写字母 */
const CREDIT_CODE_REGEX = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;

const EnterpriseVerifySchema = z.object({
  companyName: z.string().min(2, '企业名称至少2个字符'),
  businessLicense: z
    .string()
    .length(18, '统一社会信用代码需18位')
    .regex(CREDIT_CODE_REGEX, '请输入有效的统一社会信用代码'),
  legalRepresentative: z.string().min(2, '法人代表姓名至少2个字符'),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.union([z.string().email('请输入有效的邮箱'), z.literal('')]).optional(),
  businessLicensePhotos: schemaUtils.files({
    error: '请至少上传一张营业执照照片',
    minFiles: 1,
  }),
  attachmentFiles: z.array(z.union([z.string(), z.instanceof(File)])),
});

type EnterpriseVerifySchemaType = z.infer<typeof EnterpriseVerifySchema>;

export function EnterpriseVerifyView() {
  const { user, checkUserSession } = useAuthContext();
  const [forceShowForm, setForceShowForm] = useState(false);

  const methods = useForm<EnterpriseVerifySchemaType>({
    resolver: zodResolver(EnterpriseVerifySchema),
    defaultValues: {
      companyName: user?.profile.companyName || '',
      businessLicense: user?.profile.businessLicense || '',
      legalRepresentative: user?.profile.legalRepresentative || '',
      companyAddress: user?.profile.companyAddress || '',
      companyPhone: user?.profile.companyPhone || '',
      companyEmail: user?.profile.companyEmail || '',
      businessLicensePhotos: [],
      attachmentFiles: [],
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const businessLicensePhotos = splitFiles(data.businessLicensePhotos);
      const attachmentFiles = splitFiles(data.attachmentFiles);

      const [businessLicensePhotoUploadResult, attachmentUploadResult] = await Promise.allSettled([
        ossUploader.uploadFiles(businessLicensePhotos.newFiles, {
          uploadPath: '/xuwu/enterprise',
        }),
        ossUploader.uploadFiles(attachmentFiles.newFiles, {
          uploadPath: '/xuwu/enterprise',
        }),
      ]);

      const bResult = combineImageUrls(
        businessLicensePhotos.existingFiles,
        businessLicensePhotoUploadResult.status === 'fulfilled'
          ? businessLicensePhotoUploadResult.value
          : []
      );
      const aResult = combineImageUrls(
        attachmentFiles.existingFiles,
        attachmentUploadResult.status === 'fulfilled' ? attachmentUploadResult.value : []
      );

      setValue('businessLicensePhotos', bResult.imageUrls);
      setValue('attachmentFiles', aResult.imageUrls);

      await API.Auth.AuthControllerEnterpriseAuthV1({
        companyName: data.companyName,
        businessLicense: data.businessLicense,
        legalRepresentative: data.legalRepresentative,
        companyAddress: data.companyAddress || undefined,
        companyPhone: data.companyPhone || undefined,
        companyEmail: data.companyEmail || undefined,
        businessLicensePhotoUrls: bResult.imagePaths,
        attachmentUrls: aResult.imagePaths,
      });
      toast.success('企业认证提交成功，请等待审核');
      await checkUserSession?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '提交失败，请重试');
    }
  });

  const handleRemoveBusinessLicensePhoto = (file: string | File) => {
    const current = methods.getValues('businessLicensePhotos') ?? [];
    methods.setValue(
      'businessLicensePhotos',
      current.filter((f) => f !== file),
      { shouldValidate: true }
    );
  };

  const handleRemoveAttachmentFile = (file: string | File) => {
    const current = methods.getValues('attachmentFiles') ?? [];
    methods.setValue(
      'attachmentFiles',
      current.filter((f) => f !== file),
      { shouldValidate: true }
    );
  };

  const enterpriseStatus =
    user?.userType === 'enterprise' ? user?.enterpriseVerificationStatus : undefined;
  const isPending = enterpriseStatus === 'pending';
  const isRejected = enterpriseStatus === 'rejected';
  const isVerified = enterpriseStatus === 'verified';

  if (isPending) return <PendingView />;
  if (isRejected && !forceShowForm) {
    return <RejectedView onResubmit={() => setForceShowForm(true)} />;
  }

  if (isVerified) return <SuccessView />;

  return (
    <MobileLayout appTitle="企业认证" containerProps={{ maxWidth: 'md', sx: { pb: 3 } }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        {/* 完成企业认证后，您将可以以商户身份在平台发布资产、承接订单。请确保所填信息真实有效。 */}
        完成认证后，您将成为我们的合作商，一起携手为平台用户提供优质服务。请确保所填信息真实有效。
      </Alert>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text
            name="companyName"
            label="企业名称"
            placeholder="请输入营业执照上的企业全称"
          />

          <Field.Text
            name="businessLicense"
            label="统一社会信用代码"
            placeholder="请输入18位统一社会信用代码"
            helperText="可在营业执照上查看"
            slotProps={{ input: { inputProps: { maxLength: 18 } } }}
          />

          <Field.Text
            name="legalRepresentative"
            label="法人代表姓名"
            placeholder="请输入法定代表人姓名"
          />

          <Field.Text
            name="companyAddress"
            label="企业地址"
            placeholder="请输入企业注册地址（选填）"
          />

          <Field.Text
            name="companyPhone"
            label="企业联系电话"
            placeholder="请输入企业联系电话（选填）"
          />

          <Field.Text name="companyEmail" label="企业邮箱" placeholder="请输入企业邮箱（选填）" />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              营业执照照片{' '}
              <Box component="span" sx={{ color: 'error.main' }}>
                *
              </Box>
            </Typography>
            <Field.Upload
              name="businessLicensePhotos"
              multiple
              maxFiles={5}
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              helperText="请上传营业执照照片，支持多张"
              onRemove={handleRemoveBusinessLicensePhoto}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              附件材料（选填）
            </Typography>
            <Field.Upload
              name="attachmentFiles"
              multiple
              maxFiles={5}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
                'application/pdf': ['.pdf'],
              }}
              helperText="可上传补充证明材料，如其他资质文件等"
              onRemove={handleRemoveAttachmentFile}
            />
          </Box>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator={isSubmitting ? '提交中...' : undefined}
          >
            提交认证
          </LoadingButton>
        </Stack>
      </Form>
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------
// 审核中状态
// ----------------------------------------------------------------------

function PendingView() {
  const router = useRouter();
  const { user } = useAuthContext();

  return (
    <MobileLayout
      // appTitle="企业认证"
      appTitle="合作商认证"
      containerProps={{ maxWidth: 'sm', sx: { py: 5 } }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Clock size={80} color="#F59E0B" />
      </Box>
      <Typography variant="h4" gutterBottom>
        审核中
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
        {/* 您的企业认证资料已提交，我们将在 1-3 个工作日内完成审核，请耐心等待。 */}
        您的认证资料已提交，我们将在 1-3 个工作日内完成审核，请耐心等待。
      </Typography>

      {user?.profile?.companyName && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'left' }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" flexShrink={0} sx={{ color: 'text.secondary' }}>
                {/* 企业名称 */}
                合作商名称
              </Typography>
              <Typography variant="subtitle2">{user.profile.companyName}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        审核期间如有问题，请联系客服。审核通过后将自动更新状态。
      </Alert>

      <Button
        variant="contained"
        onClick={() => router.back()}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
      >
        返回
      </Button>
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------
// 审核拒绝状态
// ----------------------------------------------------------------------

function RejectedView({ onResubmit }: { onResubmit: () => void }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const rejectReason = (user as { enterpriseRejectReason?: string })?.enterpriseRejectReason;

  return (
    <MobileLayout
      // appTitle="企业认证"
      appTitle="合作商认证"
      containerProps={{ maxWidth: 'sm', sx: { py: 5 } }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <XCircle size={80} color="#EF4444" />
      </Box>
      <Typography variant="h4" gutterBottom>
        审核未通过
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
        {/* 很抱歉，您的企业认证申请未通过审核。请根据以下说明修改后重新提交。 */}
        很抱歉，您的认证申请未通过审核。请根据以下说明修改后重新提交。
      </Typography>

      {rejectReason && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            拒绝原因
          </Typography>
          <Typography variant="body2">{rejectReason}</Typography>
        </Alert>
      )}

      {user?.profile?.companyName && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'left' }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" flexShrink={0} sx={{ color: 'text.secondary' }}>
                {/* 企业名称 */}
                合作商名称
              </Typography>
              <Typography variant="subtitle2">{user.profile.companyName}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ flex: 1 }}
        >
          返回
        </Button>
        <Button
          variant="contained"
          onClick={onResubmit}
          startIcon={<Iconify icon="solar:pen-bold" />}
          sx={{ flex: 1 }}
        >
          重新提交
        </Button>
      </Stack>
    </MobileLayout>
  );
}

// ----------------------------------------------------------------------
// 认证成功状态
// ----------------------------------------------------------------------

function SuccessView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isInWeChatMiniProgram } = usePlatform();

  return (
    <MobileLayout
      // appTitle="企业认证"
      appTitle="合作商认证"
      containerProps={{ maxWidth: 'sm', sx: { py: 5 } }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CheckCircle size={80} color="#22C55E" />
      </Box>
      <Typography variant="h4" gutterBottom>
        {/* 已完成企业认证 */}
        已认证成功
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
        {/* 恭喜您，企业认证已通过！您可以以商户身份在平台发布资产、承接订单。 */}
        恭喜您，您已成功成为我们的合作商，一起携手为平台用户提供优质服务。
      </Typography>

      {user?.profile?.companyName && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'left' }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" flexShrink={0} sx={{ color: 'text.secondary' }}>
                {/* 企业名称 */}
                合作商名称
              </Typography>
              <Typography variant="subtitle2">{user.profile.companyName}</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Button
        variant="contained"
        onClick={() => {
          if (isInWeChatMiniProgram) {
            wx.miniProgram.navigateBack({
              url: '/pages/setting/index',
            });
            return;
          }
          router.back();
        }}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
      >
        返回
      </Button>
    </MobileLayout>
  );
}
