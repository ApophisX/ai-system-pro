import { z } from 'zod';
import dayjs from 'dayjs';
import wx from 'weixin-js-sdk';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import API from 'src/services/API';
import { encryptPhone } from 'src/utils';
import { ossUploader } from 'src/lib/oss-uploader';
import { useApiMutation } from 'src/lib/use-api-mutation';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaUtils } from 'src/components/hook-form';
import { MobileLayout, HorizontalStack } from 'src/components/custom/layout';

import { useAuthContext } from 'src/auth/hooks';

import { IdCardUpload } from '../components/idcard-upload';

// ----------------------------------------------------------------------

type GenderType = MyApi.RealNameAuthDto['gender'];
const GENDER_MAP: Record<string, GenderType> = {
  男: 'male',
  女: 'female',
  未知: 'unknown',
};

const VerifySchema = z.object({
  realName: z.string().min(2, '姓名至少2个字符'),
  idCard: z.string().min(18, '身份证号码需18位').max(18, '身份证号码需18位'),
  idCardAddress: z.string().optional(),
  idCardStartDate: z.string().optional(),
  idCardEndDate: z.string().optional(),
  idCardIssue: z.string().optional(),
  idCardNationality: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.string().optional(),
  faceImage: schemaUtils.file({ error: '请上传身份证照片' }),
  backImage: schemaUtils.file({ error: '请上传身份证照片' }),
});

type VerifySchemaType = z.infer<typeof VerifySchema>;

export default function VerifyView() {
  const { user, checkUserSession } = useAuthContext();

  const tempUpload = useMutation({
    mutationFn: (file: File) => ossUploader.uploadFile(file, { uploadPath: '/xuwu/temp' }),
  });

  const idcardFaceRecognition = useApiMutation(
    API.Recognition.RecognitionControllerOcrIdCardFaceV1
  );
  const idcardBackRecognition = useApiMutation(
    API.Recognition.RecognitionControllerOcrIdCardBackV1
  );

  const methods = useForm<VerifySchemaType>({
    resolver: zodResolver(VerifySchema),
    defaultValues: {
      realName: '',
      idCard: '',
      faceImage: null,
      backImage: null,
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const isRecognizing =
    idcardBackRecognition.isPending || idcardFaceRecognition.isPending || tempUpload.isPending;

  const onSubmit = handleSubmit(async (data) => {
    if (!data.faceImage || !data.backImage) {
      toast.error('请上传身份证照片');
      return;
    }

    const idCardPhotoUrls = await Promise.all([
      data.faceImage instanceof File
        ? ossUploader.uploadFile(data.faceImage as File, { uploadPath: '/xuwu/encrypted' })
        : Promise.resolve({
            url: data.faceImage,
            path: new URL(data.faceImage).pathname,
            name: data.faceImage,
          }),
      data.backImage instanceof File
        ? ossUploader.uploadFile(data.backImage as File, { uploadPath: '/xuwu/encrypted' })
        : Promise.resolve({
            url: data.backImage,
            path: new URL(data.backImage).pathname,
            name: data.backImage,
          }),
    ]);

    const [faceImageUrl, backImageUrl] = idCardPhotoUrls;
    setValue('faceImage', ossUploader.getSignatureUrl(faceImageUrl.path));
    setValue('backImage', ossUploader.getSignatureUrl(backImageUrl.path));

    if (data.idCardEndDate) {
      if (Number(data.idCardEndDate) < Number(dayjs().format('YYYYMMDD'))) {
        toast.error('身份证已过期，请检查身份证有效期');
        return;
      }
    }

    await API.Auth.AuthControllerRealNameAuthV1({
      realName: data.realName,
      idCard: data.idCard,
      idCardAddress: data.idCardAddress,
      idCardStartDate: data.idCardStartDate
        ? dayjs(data.idCardStartDate).format('YYYY-MM-DD')
        : undefined,
      idCardEndDate: data.idCardEndDate
        ? dayjs(data.idCardEndDate).format('YYYY-MM-DD')
        : undefined,
      birthday: data.birthday ? dayjs(data.birthday).format('YYYY-MM-DD') : undefined,
      idCardIssue: data.idCardIssue,
      gender: GENDER_MAP[data.gender || '未知'],
      idCardPhotoUrls: [faceImageUrl.path, backImageUrl.path],
      idCardSnapshot: data,
    });
    await checkUserSession?.();
  });

  if (user?.isVerified) {
    return <SuccessView />;
  }

  return (
    <MobileLayout appTitle="实名认证" containerProps={{ maxWidth: 'md', sx: { pb: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        实名认证
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        为保障您的账户安全，请完成实名认证。我们承诺严格保护您的个人隐私信息。
      </Alert>

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              上传身份证照片
            </Typography>
            <HorizontalStack>
              <Box sx={{ flex: 1 }}>
                <IdCardUpload
                  name="faceImage"
                  placeholderImage="/assets/icons/apps/ic-idcard-face.svg"
                  onDelete={() => {
                    setValue('faceImage', '');
                  }}
                  disabled={tempUpload.isPending || idcardFaceRecognition.isPending}
                  loading={idcardFaceRecognition.isPending}
                  helperText="请上传身份证人像面照片"
                  onUploadChange={async (file) => {
                    let url = '';
                    if (file instanceof File) {
                      const uploadResult = await tempUpload.mutateAsync(file);
                      url = ossUploader.getSignatureUrl(uploadResult.path);
                    } else {
                      url = file;
                    }
                    try {
                      const { data: result } = await idcardFaceRecognition.mutateAsync({
                        side: 'face',
                        image: url,
                      });
                      setValue('realName', result.name);
                      setValue('idCard', result.num);
                      setValue('idCardNationality', result.nationality);
                      setValue('birthday', result.birth);
                      setValue('gender', result.sex);
                      setValue('idCardAddress', result.address);
                    } catch {
                      setValue('faceImage', '');
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <IdCardUpload
                  name="backImage"
                  placeholderImage="/assets/icons/apps/ic-idcard-back.svg"
                  onDelete={() => {
                    setValue('backImage', '');
                  }}
                  disabled={tempUpload.isPending || idcardBackRecognition.isPending}
                  helperText="请上传身份证国徽面照片"
                  loading={idcardBackRecognition.isPending}
                  onUploadChange={async (file) => {
                    let url = '';
                    if (file instanceof File) {
                      const uploadResult = await tempUpload.mutateAsync(file);
                      url = ossUploader.getSignatureUrl(uploadResult.path);
                    } else {
                      url = file;
                    }
                    try {
                      const { data: result } = await idcardBackRecognition.mutateAsync({
                        side: 'back',
                        image: url,
                      });
                      setValue('idCardIssue', result.issue);
                      setValue('idCardStartDate', result.start_date);
                      setValue('idCardEndDate', result.end_date);
                    } catch {
                      setValue('backImage', '');
                    }
                  }}
                />
              </Box>
            </HorizontalStack>
          </Box>
          <TextField label="手机号" value={encryptPhone(user?.phone)} disabled />

          <Field.Text
            name="realName"
            label="真实姓名"
            placeholder="请输入您的真实姓名"
            helperText="可从身份证照片中读取"
          />

          <Field.Text
            name="idCard"
            label="身份证号码"
            placeholder="请输入18位身份证号码"
            helperText="可从身份证照片中读取"
            slotProps={{ input: { inputProps: { maxLength: 18 } } }}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            disabled={isRecognizing}
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

function SuccessView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isInWeChatMiniProgram } = usePlatform();
  return (
    <Container maxWidth="sm" sx={{ py: 5, textAlign: 'center' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <CheckCircle size={80} color="#22C55E" />
      </Box>
      <Typography variant="h4" gutterBottom>
        已完成实名认证
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
        恭喜您，实名认证已成功！现在您可以无忧体验平台的全部功能与服务。
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'left' }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              真实姓名
            </Typography>
            <Typography variant="subtitle2">{user?.profile.realName}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              身份证号
            </Typography>
            <Typography variant="subtitle2">{user?.profile.idCard}</Typography>
          </Stack>
        </Stack>
      </Paper>

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
      >
        <Iconify icon="eva:arrow-ios-back-fill" />
        返回
      </Button>
    </Container>
  );
}
